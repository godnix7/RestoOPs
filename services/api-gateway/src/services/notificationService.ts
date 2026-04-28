import { createDb } from '@restroops/db';

export class NotificationService {
  static async notifyManager(restaurantId: string, title: string, message: string, severity: 'info' | 'warning' | 'critical') {
    const db = createDb(process.env.DATABASE_URL || '');
    
    // 1. Log to Database (Notification Inbox)
    // For now, we'll store these in the ai_insights table as actionable insights
    await db.insertInto('ai_insights')
      .values({
        restaurant_id: restaurantId,
        type: 'anomaly_alert',
        title,
        content: message,
        severity,
        is_dismissed: false,
      })
      .execute();

    // 2. Mock Email/Push Logic
    console.log(`[NOTIFICATION] [${severity.toUpperCase()}] to Restaurant ${restaurantId}: ${title} - ${message}`);
    
    // In production, we would integrate with Resend, Twilio, or Firebase here.
  }
}
