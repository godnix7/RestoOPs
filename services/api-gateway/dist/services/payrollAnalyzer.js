export class PayrollAnalyzer {
    static async analyzeLineItem(lineItem, restaurantId) {
        const anomalies = [];
        // Rule: hours > 60/week
        if (lineItem.hours_worked > 60) {
            anomalies.push({
                type: 'payroll_anomaly',
                severity: 'critical',
                entity_type: 'payroll_line_item',
                entity_id: lineItem.id,
                description: `High hours detected: ${lineItem.hours_worked}h exceeds 60h/week limit.`,
                restaurant_id: restaurantId,
            });
        }
        // Rule: pay variance > 30% vs prior period
        // (Logic for variance check would go here, requiring historical data fetch)
        return anomalies;
    }
    static async triggerAnomalies(db, anomalies) {
        if (anomalies.length === 0)
            return;
        await db
            .insertInto('ai_exceptions')
            .values(anomalies)
            .execute();
    }
}
