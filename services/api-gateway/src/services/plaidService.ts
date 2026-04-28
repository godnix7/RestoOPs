import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { createDb } from '@restroops/db';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export class PlaidService {
  static async createLinkToken(userId: string, restaurantId: string) {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'RestroOps AI',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    });
    return response.data;
  }

  static async exchangePublicToken(publicToken: string, restaurantId: string) {
    const db = createDb(process.env.DATABASE_URL || '');
    
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const { access_token, item_id } = response.data;

    await db.insertInto('external_integrations')
      .values({
        restaurant_id: restaurantId,
        provider: 'plaid',
        external_id: item_id,
        access_token,
        status: 'active',
      })
      .execute();

    return { success: true };
  }

  static async syncTransactions(restaurantId: string) {
    const db = createDb(process.env.DATABASE_URL || '');
    
    const integration = await db.selectFrom('external_integrations')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .where('provider', '=', 'plaid')
      .executeTakeFirst();

    if (!integration) throw new Error('No Plaid integration found');

    const response = await plaidClient.transactionsSync({
      access_token: integration.access_token,
    });

    const transactions = response.data.added.map(t => ({
      restaurant_id: restaurantId,
      source: 'plaid',
      source_reference: t.transaction_id,
      amount: t.amount,
      type: t.amount > 0 ? 'expense' : 'revenue',
      category: t.personal_finance_category?.primary || 'General',
      description: t.name,
      date: t.date,
    }));

    if (transactions.length > 0) {
      await db.insertInto('transactions').values(transactions as any).execute();
    }

    await db.updateTable('external_integrations')
      .set({ last_sync_at: new Date() })
      .where('id', '=', integration.id)
      .execute();

    return { synced: transactions.length };
  }
}
