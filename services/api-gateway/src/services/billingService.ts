import Stripe from 'stripe';
import { createDb } from '@restroops/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27' as any,
});

export class BillingService {
  static async createCheckoutSession(restaurantId: string, priceId: string) {
    const db = createDb(process.env.DATABASE_URL || '');
    
    const restaurant = await db.selectFrom('restaurants')
      .selectAll()
      .where('id', '=', restaurantId)
      .executeTakeFirst();

    if (!restaurant) throw new Error('Restaurant not found');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing`,
      metadata: { restaurantId },
    });

    return session;
  }

  static async handleWebhook(payload: any, sig: string) {
    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
    } catch (err: any) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    const db = createDb(process.env.DATABASE_URL || '');

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const restaurantId = session.metadata?.restaurantId;

      if (restaurantId) {
        // Update restaurant subscription status
        await db.updateTable('restaurants')
          .set({ 
            // In a real app, we'd have a subscription_status column
            // For now, let's assume we log it to audit
          })
          .where('id', '=', restaurantId)
          .execute();
      }
    }

    return { received: true };
  }
}
