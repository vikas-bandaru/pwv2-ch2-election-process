/**
 * BudgetMiddleware — Server-side API call limiter
 *
 * PURPOSE: Acts as a server-side safety net to prevent runaway API calls
 * during the demo period. This does NOT track real GCP billing — it counts
 * calls per server lifetime and blocks if the threshold is crossed.
 *
 * For real billing tracking, set up a GCP Budget Alert (see README).
 */

// In-memory counters (reset on server restart / Cloud Run cold start)
let callCounts = { GEMINI: 0, MAPS: 0 };

// Max calls allowed before blocking (conservative limits for a $5 trial)
const MAX_CALLS = {
    GEMINI: 400,  // ~$0.04 at gemini-1.5-flash pricing
    MAPS:   200   // ~$0.40 at Static Maps pricing
};

const budgetMiddleware = (req, res, next) => {
    req.trackApiUsage = (type) => {
        callCounts[type] = (callCounts[type] || 0) + 1;
        const count = callCounts[type];
        const max = MAX_CALLS[type] || 9999;

        console.log(`[Budget] ${type} call #${count} / ${max}`);

        if (count > max) {
            console.warn(`[Budget] SOFT LIMIT reached for ${type}. Blocking call.`);
            return false; // Caller falls back to static content
        }
        return true;
    };

    // Kept for backward compat but no longer exposed in UI
    req.getBudgetStatus = () => ({
        geminiCalls: callCounts.GEMINI,
        mapsCalls: callCounts.MAPS
    });

    next();
};

module.exports = budgetMiddleware;
