import * as square from 'square';
const { Client, Environment } = square as any;
import { createDb } from '@restroops/db';

export class SquareService {
  private static getClient(accessToken: string) {
    return new Client({
      accessToken,
      environment: process.env.SQUARE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
    });
  }

  static async syncSales(restaurantId: string) {
    const db = createDb(process.env.DATABASE_URL || '');
    
    const integration = await db.selectFrom('external_integrations')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .where('provider', '=', 'square')
      .executeTakeFirst();

    if (!integration) throw new Error('No Square integration found');

    const client = this.getClient(integration.access_token);
    const { result } = await client.ordersApi.searchOrders({
      locationIds: integration.settings?.locationIds || [],
      query: {
        filter: {
          stateFilter: { states: ['COMPLETED'] },
          dateTimeFilter: {
            closedAt: {
              startAt: integration.last_sync_at?.toISOString() || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            }
          }
        }
      }
    });

    const transactions = (result.orders || []).map((order: any) => ({
      restaurant_id: restaurantId,
      source: 'square',
      source_reference: order.id,
      amount: Number(order.totalMoney?.amount || 0) / 100, // Square amounts are in cents
      type: 'revenue',
      category: 'Sales',
      description: `Square Order: ${order.id}`,
      date: order.closedAt || new Date().toISOString(),
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

  static async linkAccount(restaurantId: string, accessToken: string, locationIds: string[]) {
    const db = createDb(process.env.DATABASE_URL || '');
    
    await db.insertInto('external_integrations')
      .values({
        restaurant_id: restaurantId,
        provider: 'square',
        external_id: 'square-account',
        access_token: accessToken,
        settings: { locationIds },
        status: 'active',
      })
      .execute();

    return { success: true };
  }
}
