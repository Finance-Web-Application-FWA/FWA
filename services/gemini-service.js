const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateFinancialReport(financialData) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Create a detailed prompt from user's financial data
        const prompt = createFinancialPrompt(financialData);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return {
            success: true,
            report: text,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            success: false,
            error: error.message,
            report: "Failed to generate report. Please try again."
        };
    }
}

function createFinancialPrompt(data) {
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