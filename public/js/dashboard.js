document.addEventListener('DOMContentLoaded', function() {
    const user_name = sessionStorage.getItem( 'user_name' );
    if (document.getElementById("user_name")) {
        document.getElementById("user_name").innerHTML = 'User Name: '+user_name;
    }

    // Run validation checks on page load
    runSystemValidation();

    if (document.getElementById('finalSubmitButton')) {
        document.getElementById('finalSubmitButton').addEventListener('click', function (event) {
            event.preventDefault();
            const username_id = sessionStorage.getItem( 'id' );
            save_and_calculate(username_id)
        });
    }
});

/**
 * Run system validation to check API access and connectivity
 */
function runSystemValidation() {
    console.log('🔍 Starting system validation...');
    
    // Show validation panel
    const validationPanel = document.getElementById('validationPanel');
    if (validationPanel) {
        validationPanel.style.display = 'block';
    }
    
    // Test 1: Check form validation
    checkFormValidation();
    
    // Test 2: Check API access with test request
    checkAPIAccess();
}

/**
 * Validate that all form fields exist and are accessible
 */
function checkFormValidation() {
    const requiredFields = [
        'age', 'employmentStatus', 'income_monthly', 'rent', 'utilities',
        'groceries', 'entertainment', 'total_dept', 'total_assets', 'total_liabilities',
        'principal', 'monthly_interest_rate', 'number_of_payments', 'months_of_coverage_desired',
        'desired_retirement_income', 'withdrawal_rate', 'total_credit_card_balances',
        'total_credit_card_limits', 'property_value', 'debt'
    ];
    
    let missingFields = [];
    for (let fieldId of requiredFields) {
        if (!document.getElementById(fieldId)) {
            missingFields.push(fieldId);
        }
    }
    
    const statusElement = document.getElementById('formValidationStatus');
    if (statusElement) {
        if (missingFields.length === 0) {
            statusElement.innerHTML = '<strong>Form Data:</strong> <span style="color: #28a745;">✓ All fields found</span>';
            console.log('✓ Form validation passed');
        } else {
            statusElement.innerHTML = '<strong>Form Data:</strong> <span style="color: #dc3545;">✗ Missing fields: ' + 
                missingFields.join(', ') + '</span>';
            console.error('✗ Missing form fields:', missingFields);
        }
    }
}

/**
 * Check if API is accessible by sending test request
 */
function checkAPIAccess() {
    const statusElement = document.getElementById('apiStatus');
    if (!statusElement) return;
    
    statusElement.innerHTML = '<strong>API Access:</strong> <span style="color: #ffc107;">⏳ Testing...</span>';
    
    // Test the /generatereport endpoint
    const testData = {
        username_id: "test",
        age: "25",
        employmentStatus: "employed",
        income_monthly: "5000"
    };
    
    var xhttp = new XMLHttpRequest();
    xhttp.timeout = 10000;
    
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status === 200) {
                try {
                    var response = JSON.parse(this.responseText);
                    if (response.response && response.response.result === 'ok') {
                        statusElement.innerHTML = '<strong>API Access:</strong> <span style="color: #28a745;">✓ Gemini API Working</span>';
                        console.log('✓ Gemini API is accessible');
                    } else if (response.response && response.response.result === 'fail') {
                        const errorMsg = response.response.data || 'Unknown error';
                        
                        // Check for specific API errors
                        if (errorMsg.includes('quota') || errorMsg.includes('Quota')) {
                            statusElement.innerHTML = '<strong>API Access:</strong> <span style="color: #dc3545;">✗ API Quota Exceeded</span><br>' +
                                '<span style="font-size: 12px; color: #dc3545;">Gemini API free tier quota is exhausted. Please upgrade your plan.</span>';
                            console.error('✗ API Quota exceeded:', errorMsg);
                        } else if (errorMsg.includes('model') || errorMsg.includes('not found')) {
                            statusElement.innerHTML = '<strong>API Access:</strong> <span style="color: #dc3545;">✗ Model Not Available</span><br>' +
                                '<span style="font-size: 12px; color: #dc3545;">The Gemini model is not available. Check your API key.</span>';
                            console.error('✗ Model unavailable:', errorMsg);
                        } else {
                            statusElement.innerHTML = '<strong>API Access:</strong> <span style="color: #dc3545;">✗ API Error</span><br>' +
                                '<span style="font-size: 12px; color: #dc3545;">' + errorMsg + '</span>';
                            console.error('✗ API Error:', errorMsg);
                        }
                    }
                } catch (e) {
                    statusElement.innerHTML = '<strong>API Access:</strong> <span style="color: #ff9800;">⚠ Invalid Response</span>';
                    console.error('✗ Parse error:', e);
                }
            } else if (this.status === 404) {
                statusElement.innerHTML = '<strong>API Access:</strong> <span style="color: #dc3545;">✗ Endpoint Not Found (404)</span>';
                console.error('✗ API endpoint not found');
            } else if (this.status === 500) {
                statusElement.innerHTML = '<strong>API Access:</strong> <span style="color: #dc3545;">✗ Server Error (500)</span>';
                console.error('✗ Server error');
            } else {
                statusElement.innerHTML = '<strong>API Access:</strong> <span style="color: #dc3545;">✗ HTTP Error ' + this.status + '</span>';
                console.error('✗ HTTP Error:', this.status);
            }
        }
    }
    
    xhttp.onerror = function () {
        statusElement.innerHTML = '<strong>API Access:</strong> <span style="color: #dc3545;">✗ Cannot reach server</span>';
        console.error('✗ Network error - cannot reach server');
    }
    
    xhttp.ontimeout = function () {
        statusElement.innerHTML = '<strong>API Access:</strong> <span style="color: #ff9800;">⏱ Request Timeout</span>';
        console.error('✗ API request timed out');
    }
    
    xhttp.open("POST", "/generatereport", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(testData));
}


function save_and_calculate(username_id) {
    // Validate username_id
    if (!username_id) {
        document.getElementById("info").innerHTML = 'Session expired. Please log in again.';
        document.getElementById("info").style.color = "red";
        return;
    }
    
    var age = Number(document.getElementById('age').value) || 0;
    var employmentStatus = document.getElementById('employmentStatus').value;
    var income_monthly = Number(document.getElementById('income_monthly').value) || 0;
    var rent = Number(document.getElementById('rent').value) || 0;
    var utilities = Number(document.getElementById('utilities').value) || 0;
    var groceries = Number(document.getElementById('groceries').value) || 0;
    var entertainment = Number(document.getElementById('entertainment').value) || 0;
    var total_dept = Number(document.getElementById('total_dept').value) || 0;
    var total_assets = Number(document.getElementById('total_assets').value) || 0;
    var total_liabilities = Number(document.getElementById('total_liabilities').value) || 0;
    var principal = Number(document.getElementById('principal').value) || 0;
    var monthly_interest_rate = Number(document.getElementById('monthly_interest_rate').value) || 0;
    var number_of_payments = Number(document.getElementById('number_of_payments').value) || 0;
    var months_of_coverage_desired = Number(document.getElementById('months_of_coverage_desired').value) || 0;
    var desired_retirement_income = Number(document.getElementById('desired_retirement_income').value) || 0;
    var withdrawal_rate = Number(document.getElementById('withdrawal_rate').value) || 0;
    var total_credit_card_balances = Number(document.getElementById('total_credit_card_balances').value) || 0;
    var total_credit_card_limits = Number(document.getElementById('total_credit_card_limits').value) || 0;
    var property_value = Number(document.getElementById('property_value').value) || 0;
    var debt = Number(document.getElementById('debt').value) || 0;

    // Save Raw to Database
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                try {
                    var response_text = JSON.parse(this.responseText);
                    if (response_text['response']['result'] == 'ok') {
                        document.getElementById("info").innerHTML = response_text['response']['data'];
                        document.getElementById("info").style.color = "white";
                    } else if (response_text['response']['result'] == 'fail') {
                        document.getElementById("info").innerHTML = response_text['response']['data'];
                        document.getElementById("info").style.color = "red";
                    }
                } catch (e) {
                    document.getElementById("info").innerHTML = 'Error: Invalid server response';
                    document.getElementById("info").style.color = "red";
                    console.error('Parse error:', e);
                }
            } else {
                document.getElementById("info").innerHTML = 'Server error (Status ' + this.status + ')';
                document.getElementById("info").style.color = "red";
                console.error('HTTP Error:', this.status);
            }
        }
    }
    xhttp.onerror = function () {
        document.getElementById("info").innerHTML = 'Network error. Server not responding.';
        document.getElementById("info").style.color = "red";
    }
    xhttp.open("POST", "/saverawdata", true);
    xhttp.timeout = 15000;
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("username_id=" + username_id + "&age=" + age + "&employmentStatus=" + employmentStatus + "&income_monthly=" + income_monthly
        + "&rent=" + rent + "&utilities=" + utilities + "&groceries=" + groceries + "&entertainment=" +
        entertainment + "&total_dept=" + total_dept + "&total_assets=" + total_assets + "&total_liabilities=" + total_liabilities +
        "&principal=" + principal + "&monthly_interest_rate=" + monthly_interest_rate + "&number_of_payments=" + number_of_payments + "&months_of_coverage_desired=" + months_of_coverage_desired + "&desired_retirement_income=" + desired_retirement_income + "&withdrawal_rate=" + withdrawal_rate + "&total_credit_card_balances=" + total_credit_card_balances + "&total_credit_card_limits=" + total_credit_card_limits + "&property_value=" + property_value + "&debt=" + debt);

    // Calculate Financial Metrics
    var net_worth = total_assets - total_liabilities;
    document.getElementById("net_worth").innerHTML = net_worth.toFixed(2);
    
    // Monthly Expenses
    var monthly_expenses = rent + utilities + groceries + entertainment;
    
    // Budget Variance: Income - Expenses
    var budget_variance = income_monthly - monthly_expenses;
    document.getElementById("budget_variance").innerHTML = budget_variance.toFixed(2);
    
    // Debt to Income Ratio: Total Monthly Debt / Monthly Income
    var debt_to_income_ratio = income_monthly > 0 ? (total_dept / income_monthly) : 0;
    document.getElementById("debt_to_income_ratio").innerHTML = debt_to_income_ratio.toFixed(2);
    
    // Savings Rate: Budget Variance / Income (as percentage)
    var savings_rate = income_monthly > 0 ? ((budget_variance / income_monthly) * 100) : 0;
    document.getElementById("savings_rate").innerHTML = savings_rate.toFixed(2) + "%";
    
    // Emergency Fund: Monthly Expenses * Months of Coverage
    var emergency_fund = monthly_expenses * months_of_coverage_desired;
    document.getElementById("emergency_fund").innerHTML = emergency_fund.toFixed(2);
    
    // Retirement Goal: Desired Retirement Income / Withdrawal Rate
    var retirement_goal = withdrawal_rate > 0 ? (desired_retirement_income / withdrawal_rate) : 0;
    document.getElementById("retirement_goal").innerHTML = retirement_goal.toFixed(2);
    
    // Credit Utilization Ratio: Total CC Balances / Total CC Limits
    var credit_utilization_ratio = total_credit_card_limits > 0 ? ((total_credit_card_balances / total_credit_card_limits) * 100) : 0;
    document.getElementById("credit_utilization_ratio").innerHTML = credit_utilization_ratio.toFixed(2) + "%";
    
    // Monthly Mortgage Repayment: Principal * [r(1+r)^n] / [(1+r)^n - 1], where r = monthly_interest_rate
    var monthly_mortgage_repayment = 0;
    if (principal > 0 && number_of_payments > 0) {
        if (monthly_interest_rate > 0) {
            monthly_mortgage_repayment = principal * (monthly_interest_rate * Math.pow(1 + monthly_interest_rate, number_of_payments)) / (Math.pow(1 + monthly_interest_rate, number_of_payments) - 1);
        } else {
            monthly_mortgage_repayment = principal / number_of_payments;
        }
    }
    document.getElementById("monthly_mortgage_repayment").innerHTML = monthly_mortgage_repayment.toFixed(2);
    
    // Monthly Savings: Budget Variance (positive surplus)
    var monthly_savings = budget_variance > 0 ? budget_variance : 0;
    document.getElementById("monthly_savings").innerHTML = monthly_savings.toFixed(2);
    
    // Loan to Value Ratio: Principal / Property Value
    var loan_to_value_ratio = property_value > 0 ? ((principal / property_value) * 100) : 0;
    document.getElementById("loan_to_value_ratio").innerHTML = loan_to_value_ratio.toFixed(2) + "%";

    // Save Result to Database
    var xhttp2 = new XMLHttpRequest();
    xhttp2.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                try {
                    var response_text = JSON.parse(this.responseText);
                    if (response_text['response']['result'] == 'ok') {
                            let element = document.getElementById("result_section");
                                   element.removeAttribute("hidden");
                                   element.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
                        document.getElementById("info_result").innerHTML = response_text['response']['data'];
                        document.getElementById("info_result").style.color = "white";
                    } else if (response_text['response']['result'] == 'fail') {
                        document.getElementById("info_result").innerHTML = response_text['response']['data'];
                        document.getElementById("info_result").style.color = "red";
                    }
                } catch (e) {
                    document.getElementById("info_result").innerHTML = 'Error: Invalid server response';
                    document.getElementById("info_result").style.color = "red";
                    console.error('Parse error:', e);
                }
            } else {
                document.getElementById("info_result").innerHTML = 'Server error (Status ' + this.status + ')';
                document.getElementById("info_result").style.color = "red";
                console.error('HTTP Error:', this.status);
            }
        }
    }
    xhttp2.onerror = function () {
        document.getElementById("info_result").innerHTML = 'Network error. Server not responding.';
        document.getElementById("info_result").style.color = "red";
    }
    xhttp2.open("POST", "/saveresultdata", true);
    xhttp2.timeout = 15000;
    xhttp2.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp2.send("username_id=" + username_id + "&net_worth=" + net_worth);

    // Call generateAIReport after 2 seconds (after results are shown)
    setTimeout(function() {
        generateAIReport(username_id, age, employmentStatus, income_monthly, rent, utilities, groceries, 
                        entertainment, total_dept, total_assets, total_liabilities, principal, 
                        monthly_interest_rate, number_of_payments, months_of_coverage_desired, 
                        desired_retirement_income, withdrawal_rate, total_credit_card_balances, 
                        total_credit_card_limits, property_value, debt, net_worth, budget_variance, 
                        debt_to_income_ratio, savings_rate, emergency_fund, retirement_goal, 
                        credit_utilization_ratio, monthly_mortgage_repayment, monthly_savings, 
                        loan_to_value_ratio);
    }, 2000);
}

// Function to generate AI Financial Report
function generateAIReport(username_id, age, employmentStatus, income_monthly, rent, utilities, groceries, 
                          entertainment, total_dept, total_assets, total_liabilities, principal, 
                          monthly_interest_rate, number_of_payments, months_of_coverage_desired, 
                          desired_retirement_income, withdrawal_rate, total_credit_card_balances, 
                          total_credit_card_limits, property_value, debt, net_worth, budget_variance, 
                          debt_to_income_ratio, savings_rate, emergency_fund, retirement_goal, 
                          credit_utilization_ratio, monthly_mortgage_repayment, monthly_savings, 
                          loan_to_value_ratio) {
    
    const reportData = {
        username_id: username_id,
        age: age,
        employmentStatus: employmentStatus,
        income_monthly: income_monthly,
        rent: rent,
        utilities: utilities,
        groceries: groceries,
        entertainment: entertainment,
        total_dept: total_dept,
        total_assets: total_assets,
        total_liabilities: total_liabilities,
        principal: principal,
        monthly_interest_rate: monthly_interest_rate,
        number_of_payments: number_of_payments,
        months_of_coverage_desired: months_of_coverage_desired,
        desired_retirement_income: desired_retirement_income,
        withdrawal_rate: withdrawal_rate,
        total_credit_card_balances: total_credit_card_balances,
        total_credit_card_limits: total_credit_card_limits,
        property_value: property_value,
        debt: debt,
        net_worth: net_worth,
        budget_variance: budget_variance,
        debt_to_income_ratio: debt_to_income_ratio,
        savings_rate: savings_rate,
        emergency_fund: emergency_fund,
        retirement_goal: retirement_goal,
        credit_utilization_ratio: credit_utilization_ratio,
        monthly_mortgage_repayment: monthly_mortgage_repayment,
        monthly_savings: monthly_savings,
        loan_to_value_ratio: loan_to_value_ratio
    };

    var xhttp3 = new XMLHttpRequest();
    xhttp3.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                try {
                    var response_text = JSON.parse(this.responseText);
                    if (response_text['response']['result'] == 'ok') {
                        document.getElementById("ai_report").innerHTML = response_text['response']['data']
                            .replace(/\n/g, '<br>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>');
                        
                        if (response_text['response']['timestamp']) {
                            const date = new Date(response_text['response']['timestamp']);
                            document.getElementById("report_timestamp").innerHTML = 
                                'Generated: ' + date.toLocaleString();
                        }
                    } else if (response_text['response']['result'] == 'fail') {
                        document.getElementById("ai_report").innerHTML = 
                            '<p style="color: red;">Error: ' + response_text['response']['data'] + '</p>';
                    }
                } catch (e) {
                    document.getElementById("ai_report").innerHTML = 
                        '<p style="color: red;">Error: Invalid server response</p>';
                    console.error('Parse error:', e);
                }
            } else {
                document.getElementById("ai_report").innerHTML = 
                    '<p style="color: red;">Server error (Status ' + this.status + ')</p>';
                console.error('HTTP Error:', this.status);
            }
        }
    }

    xhttp3.onerror = function () {
        document.getElementById("ai_report").innerHTML = 
            '<p style="color: red;">Network error. Cannot reach server.</p>';
    }

    xhttp3.ontimeout = function () {
        document.getElementById("ai_report").innerHTML = 
            '<p style="color: orange;">Request timeout. Server took too long to respond.</p>';
    }

    xhttp3.open("POST", "/generatereport", true);
    xhttp3.timeout = 45000; // 45 second timeout (Gemini can take 10-15 seconds)
    xhttp3.setRequestHeader("Content-type", "application/json");
    xhttp3.send(JSON.stringify(reportData));
}

// Function to download report as text file
function downloadReport() {
    const reportText = document.getElementById("ai_report").innerText;
    const timestamp = document.getElementById("report_timestamp").innerText;
    const userName = document.getElementById("user_name").innerText;
    
    const fullReport = userName + "\n" + timestamp + "\n\n" + reportText;
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fullReport));
    element.setAttribute('download', 'financial_report_' + new Date().getTime() + '.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Function to print report
function printReport() {
    const reportText = document.getElementById("ai_report").innerHTML;
    const timestamp = document.getElementById("report_timestamp").innerHTML;
    const userName = document.getElementById("user_name").innerHTML;
    
    const printWindow = window.open('', '', 'height=500,width=800');
    printWindow.document.write('<html><head><title>Financial Report</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: Arial, sans-serif; margin: 20px; }');
    printWindow.document.write('h3 { color: #1b2c46; }');
    printWindow.document.write('p { line-height: 1.6; }');
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<h2>AI Financial Advisor Report</h2>');
    printWindow.document.write('<h3>' + userName + '</h3>');
    printWindow.document.write('<p style="color: #666; font-size: 12px;">' + timestamp + '</p>');
    printWindow.document.write(reportText);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}
