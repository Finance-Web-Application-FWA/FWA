const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set in environment. AI requests will fail.');
}
const crypto = require('crypto');

// Simple in-memory cache to avoid repeated identical requests and save quota
const reportCache = new Map();
const CACHE_TTL = process.env.REPORT_CACHE_TTL ? parseInt(process.env.REPORT_CACHE_TTL, 10) : 6 * 60 * 60 * 1000; // 6 hours
const CACHE_MAX = process.env.REPORT_CACHE_MAX ? parseInt(process.env.REPORT_CACHE_MAX, 10) : 200;

function makeCacheKey(financialData, compact) {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify({ financialData, compact }));
    return hash.digest('hex');
}

function cacheGet(key) {
    const entry = reportCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL) {
        reportCache.delete(key);
        return null;
    }
    return entry.value;
}

function cacheSet(key, value) {
    // enforce max entries
    if (reportCache.size >= CACHE_MAX) {
        // delete oldest entry
        let oldestKey = null;
        let oldestTs = Infinity;
        for (const [k, v] of reportCache.entries()) {
            if (v.ts < oldestTs) {
                oldestTs = v.ts;
                oldestKey = k;
            }
        }
        if (oldestKey) reportCache.delete(oldestKey);
    }
    reportCache.set(key, { ts: Date.now(), value });
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateFinancialReport(financialData) {
    try {
        console.log('generateFinancialReport: starting generation', { userId: financialData.username_id ? true : false });
        // Determine compact mode: environment forces compact if COMPACT_REPORT=1, or client can pass compact flag
        const compactEnv = process.env.COMPACT_REPORT === '1';
        const compact = compactEnv || !!financialData.compact;

        // Check cache first
        const cacheKey = makeCacheKey(financialData, compact);
        const cached = cacheGet(cacheKey);
        if (cached) {
            console.log('generateFinancialReport: cache hit');
            return { success: true, report: cached.report, timestamp: cached.timestamp, cached: true };
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Create a detailed prompt from user's financial data (compact if requested)
        const prompt = createFinancialPrompt(financialData, compact);

        // Log the data and prompt for debugging
        console.log('Financial data sent to Gemini:', JSON.stringify(financialData, null, 2));
        console.log('Prompt sent to Gemini:', prompt);

        // Ask the model to be concise to save tokens; SDK parameter may vary so prefer prompt guidance
        const result = await model.generateContent(prompt);

        // Try to robustly extract text from different client shapes
        let text = null;
        try {
            if (result?.response?.text) {
                text = typeof result.response.text === 'function' ? await result.response.text() : result.response.text;
            } else if (result?.candidates && result.candidates.length > 0 && result.candidates[0].output) {
                text = result.candidates[0].output;
            } else if (result?.output) {
                text = result.output;
            } else {
                text = JSON.stringify(result);
            }
        } catch (innerErr) {
            console.error('Error extracting text from generative result:', innerErr, 'result:', result);
            text = JSON.stringify(result);
        }

        const responseObj = { success: true, report: text, timestamp: new Date().toISOString() };
        try {
            cacheSet(cacheKey, responseObj);
        } catch (e) {
            console.warn('Failed to cache report:', e && e.message);
        }

        return responseObj;
    } catch (error) {
        console.error("Gemini API Error:", error && (error.stack || error));
        
        // Check for quota exceeded errors and provide user-friendly message
        const errorMsg = (error && error.message) || String(error);
        if (errorMsg.includes('quota') || errorMsg.includes('Quota') || errorMsg.includes('429')) {
            // Try to extract retry delay from the error message
            const retryMatch = errorMsg.match(/retry in (\d+\.?\d*)s/);
            let retryMessage = '';
            if (retryMatch) {
                const seconds = parseFloat(retryMatch[1]);
                const minutes = Math.ceil(seconds / 60);
                retryMessage = ` Please try again in about ${minutes} minute${minutes > 1 ? 's' : ''}.`;
            }
            
            return {
                success: false,
                error: `API quota exceeded. The free tier limit has been reached.${retryMessage} Consider upgrading your Google AI plan for unlimited access.`,
                report: "Unable to generate financial report due to API quota limits.",
                isQuotaExceeded: true
            };
        }
        
        return {
            success: false,
            error: (error && error.message) || String(error),
            report: "Failed to generate report. Please check server logs and API key settings."
        };
    }
}

function createFinancialPrompt(data, compact) {
    const {
        age,
        employmentStatus,
        income_monthly,
        rent,
        utilities,
        groceries,
        entertainment,
        total_dept,
        total_assets,
        total_liabilities,
        principal,
        monthly_interest_rate,
        number_of_payments,
        months_of_coverage_desired,
        desired_retirement_income,
        withdrawal_rate,
        total_credit_card_balances,
        total_credit_card_limits,
        property_value,
        debt,
        net_worth,
        budget_variance,
        debt_to_income_ratio,
        savings_rate,
        emergency_fund,
        retirement_goal,
        credit_utilization_ratio,
        monthly_mortgage_repayment,
        monthly_savings,
        loan_to_value_ratio
    } = data;

    if (compact) {
        return `You are a concise financial advisor. Keep the report under ~250 words and use simple bullets. Provide a 3-line summary, 3 strengths, 3 concerns, and 4 prioritized actions. Use percentages or dollar amounts only when straightforward.

DATA: Age:${age}; Employment:${employmentStatus}; Income:${income_monthly}; Rent:${rent}; Utilities:${utilities}; Groceries:${groceries}; Entertainment:${entertainment}; MonthlyDebt:${total_dept}; Assets:${total_assets}; Liabilities:${total_liabilities}; NetWorth:${net_worth}; MortgagePrincipal:${principal}; InterestRate:${monthly_interest_rate}; Payments:${number_of_payments}; MortgageRepay:${monthly_mortgage_repayment}; Property:${property_value}; LTV:${loan_to_value_ratio}%; CreditBal:${total_credit_card_balances}; CreditLimit:${total_credit_card_limits}; CreditUtil:${credit_utilization_ratio}%; RetirementGoal:${retirement_goal}; EmergencyFund:${emergency_fund}; SavingsRate:${savings_rate}%; MonthlySavings:${monthly_savings}; BudgetVariance:${budget_variance}; DTI:${debt_to_income_ratio}.

Respond in plain text with short bullets and labeled sections: Summary; Strengths; Concerns; Actions (prioritized).`; 
    }

    return `
You are a professional financial advisor. Analyze the following financial information and provide a detailed, personalized financial report with actionable advice.

PERSONAL INFORMATION:
- Age: ${age}
- Employment Status: ${employmentStatus}

MONTHLY INCOME & EXPENSES:
- Monthly Income: $${income_monthly}
- Rent: $${rent}
- Utilities: $${utilities}
- Groceries: $${groceries}
- Entertainment: $${entertainment}
- Total Monthly Debt: $${total_dept}

ASSETS & LIABILITIES:
- Total Assets: $${total_assets}
- Total Liabilities: $${total_liabilities}
- Net Worth: $${net_worth}

MORTGAGE INFORMATION:
- Principal: $${principal}
- Monthly Interest Rate: ${monthly_interest_rate}
- Number of Payments: ${number_of_payments}
- Monthly Mortgage Repayment: $${monthly_mortgage_repayment}
- Property Value: $${property_value}
- Loan to Value Ratio: ${loan_to_value_ratio}%

CREDIT CARDS:
- Total Credit Card Balances: $${total_credit_card_balances}
- Total Credit Card Limits: $${total_credit_card_limits}
- Credit Utilization Ratio: ${credit_utilization_ratio}%

RETIREMENT & EMERGENCY FUND:
- Desired Retirement Income: $${desired_retirement_income}
- Withdrawal Rate: ${withdrawal_rate}
- Retirement Goal Amount: $${retirement_goal}
- Emergency Fund Target (${months_of_coverage_desired} months): $${emergency_fund}

CALCULATED METRICS:
- Budget Variance: $${budget_variance}
- Debt to Income Ratio: ${debt_to_income_ratio}
- Savings Rate: ${savings_rate}%
- Monthly Savings: $${monthly_savings}

Based on this financial data, please provide:

1. **Financial Health Summary** (2-3 sentences on overall financial status)

2. **Strengths** (What they're doing well)

3. **Areas of Concern** (What needs improvement)

4. **Actionable Recommendations** (5-7 specific, practical steps they can take)

5. **Debt Management Strategy** (How to approach their debts)

6. **Savings & Investment Plan** (How to build wealth)

7. **Retirement Planning** (Steps to reach retirement goals)

8. **Emergency Fund Status** (Is it adequate? What should they do?)

9. **Credit Score Impact** (How their credit utilization and debt affect them)

10. **Action Plan for Next 90 Days** (Specific steps for immediate improvement)

Please be encouraging but honest, and provide specific numbers and percentages where relevant.
    `;
}

module.exports = {
    generateFinancialReport,
    createFinancialPrompt
};