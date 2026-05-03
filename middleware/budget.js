/**
 * BudgetMiddleware
 * Ensures simulation stays under $5.00 API limit
 */

let totalCost = 0;
const MAX_BUDGET = 5.00;

const COSTS = {
    GEMINI: 0.0001, // 1000 requests = $0.1
    MAPS: 0.002     // 1000 requests = $2.0
};

const budgetMiddleware = (req, res, next) => {
    // Add trackApiUsage to the request object
    req.trackApiUsage = (type) => {
        const cost = COSTS[type] || 0;
        totalCost += cost;
        console.log(`[Budget] API call: ${type}. Current total: $${totalCost.toFixed(4)}`);
        
        if (totalCost >= MAX_BUDGET) {
            console.error(`[Budget] LIMIT EXCEEDED: $${totalCost.toFixed(4)}`);
            return false;
        }
        return true;
    };

    req.getBudgetStatus = () => ({
        totalCost: totalCost.toFixed(4),
        limit: MAX_BUDGET,
        remaining: (MAX_BUDGET - totalCost).toFixed(4)
    });

    next();
};

module.exports = budgetMiddleware;
