// @ts-ignore
import * as QuickBooks from 'node-quickbooks';
import { createDb } from '@restroops/db';

export class QuickBooksService {
  static async syncExpenses(restaurantId: string) {
    const db = createDb(process.env.DATABASE_URL || '');
    
    const integration = await db.selectFrom('external_integrations')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .where('provider', '=', 'quickbooks')
      .executeTakeFirst();

    if (!integration) throw new Error('No QuickBooks integration found');

    const qbo = new (QuickBooks as any)(
      process.env.QUICKBOOKS_CLIENT_ID,
      process.env.QUICKBOOKS_CLIENT_SECRET,
      integration.access_token,
      false, // no token secret for oAuth 2.0
      integration.external_id, // realmId
      process.env.QUICKBOOKS_ENV === 'sandbox',
      true, // debug
      null, // minor version
      '2.0' // oauth version
    );

    return new Promise((resolve, reject) => {
      qbo.findPurchases({
        MetaData: { LastUpdatedTime: integration.last_sync_at?.toISOString() }
      }, async (err: any, purchases: any) => {
        if (err) return reject(err);

        const transactions = (purchases.QueryResponse.Purchase || []).map((p: any) => ({
          restaurant_id: restaurantId,
          source: 'quickbooks',
          source_reference: p.Id,
          amount: p.TotalAmt,
          type: 'expense',
          category: 'Accounting',
          description: `QB Purchase: ${p.Id}`,
          date: p.TxnDate,
        }));

        if (transactions.length > 0) {
          await db.insertInto('transactions').values(transactions as any).execute();
        }

        await db.updateTable('external_integrations')
          .set({ last_sync_at: new Date() })
          .where('id', '=', integration.id)
          .execute();

        resolve({ synced: transactions.length });
      });
    });
  }
}
