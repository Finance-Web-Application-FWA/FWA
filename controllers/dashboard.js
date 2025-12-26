

   const user_name = sessionStorage.getItem( 'user_name' );
 document.getElementById("user_name").innerHTML = 'User Name: '+user_name;



document.getElementById('finalSubmitButton').addEventListener('click', function (event) {
    event.preventDefault();
    const username_id = sessionStorage.getItem( 'id' );
    save_and_calculate(username_id)
});


function save_and_calculate(username_id) {
    var age = document.getElementById('age').value;
    var employmentStatus = document.getElementById('employmentStatus').value;
    var income_monthly = document.getElementById('income_monthly').value;
    var rent = document.getElementById('rent').value;
    var utilities = document.getElementById('utilities').value;
    var groceries = document.getElementById('groceries').value;
    var entertainment = document.getElementById('entertainment').value;
    var total_dept = document.getElementById('total_dept').value;
    var total_assets = document.getElementById('total_assets').value;
    var total_liabilities = document.getElementById('total_liabilities').value;
    var principal = document.getElementById('principal').value;
    var monthly_interest_rate = document.getElementById('monthly_interest_rate').value;
    var number_of_payments = document.getElementById('number_of_payments').value;
    var months_of_coverage_desired = document.getElementById('months_of_coverage_desired').value;
    var desired_retirement_income = document.getElementById('desired_retirement_income').value;
    var withdrawal_rate = document.getElementById('withdrawal_rate').value;
    var total_credit_card_balances = document.getElementById('total_credit_card_balances').value;
    var total_credit_card_limits = document.getElementById('total_credit_card_limits').value;
    var property_value = document.getElementById('property_value').value;
    var debt = document.getElementById('debt').value;

    // Save Raw to Database
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var response_text = JSON.parse(this.responseText);
            if (response_text['response']['result'] == 'ok') {
                document.getElementById("info").innerHTML = response_text['response']['data'];
                document.getElementById("info").style.color = "white";
            } else if (response_text['response']['result'] == 'fail') {
                document.getElementById("info").innerHTML = response_text['response']['data'];
                document.getElementById("info").style.color = "red";
            }
        }else{
            document.getElementById("info").innerHTML = 'Error Detected'
                   document.getElementById("info").style.color = "red";
        }
    }
    xhttp.open("POST", "http://localhost:3000/saverawdata", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("username_id=" + username_id + "&age=" + age + "&employmentStatus=" + employmentStatus + "&income_monthly=" + income_monthly
        + "&rent=" + rent + "&utilities=" + utilities + "&groceries=" + groceries + "&entertainment=" +
        entertainment + "&total_dept=" + total_dept + "&total_assets=" + total_assets + "&total_liabilities=" + total_liabilities +
        "&principal=" + principal + "&monthly_interest_rate=" + monthly_interest_rate + "&number_of_payments=" + number_of_payments + "&months_of_coverage_desired=" + months_of_coverage_desired + "&desired_retirement_income=" + desired_retirement_income + "&withdrawal_rate=" + withdrawal_rate + "&total_credit_card_balances=" + total_credit_card_balances + "&total_credit_card_limits=" + total_credit_card_limits + "&property_value=" + property_value + "&debt=" + debt);

    var net_worth = total_assets - total_liabilities;
    document.getElementById("net_worth").innerHTML = net_worth


    // Save Result to Database
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
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
        }else{
                          document.getElementById("info_result").innerHTML = 'Error Detected'
                   document.getElementById("info_result").style.color = "red";
        }
    }
    xhttp.open("POST", "http://localhost:3000/saveresultdata", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("username_id=" + username_id + "&net_worth=" + net_worth);
   // After saving result data, generate AI report
    setTimeout(function() {
        generateAIReport(username_id, net_worth, budget_variance, debt_to_income_ratio, 
                        savings_rate, emergency_fund, retirement_goal, credit_utilization_ratio,
                        monthly_mortgage_repayment, monthly_savings, loan_to_value_ratio,
                        age, employmentStatus, income_monthly, rent, utilities, groceries, 
                        entertainment, total_dept, total_assets, total_liabilities, principal,
                        monthly_interest_rate, number_of_payments, months_of_coverage_desired,
                        desired_retirement_income, withdrawal_rate, total_credit_card_balances,
                        total_credit_card_limits, property_value, debt);
    }, 2000); // Wait 2 seconds after saving data 
    function generateAIReport(username_id, net_worth, budget_variance, debt_to_income_ratio, 
                         savings_rate, emergency_fund, retirement_goal, credit_utilization_ratio,
                         monthly_mortgage_repayment, monthly_savings, loan_to_value_ratio,
                         age, employmentStatus, income_monthly, rent, utilities, groceries, 
                         entertainment, total_dept, total_assets, total_liabilities, principal,
                         monthly_interest_rate, number_of_payments, months_of_coverage_desired,
                         desired_retirement_income, withdrawal_rate, total_credit_card_balances,
                         total_credit_card_limits, property_value, debt) {
    
    console.log('Generating AI report...');
    
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                try {
                    var response_text = JSON.parse(this.responseText);
                    if (response_text['response']['result'] == 'ok') {
                        // Display the report
                        document.getElementById("ai_report").innerHTML = 
                            response_text['response']['data'].replace(/\n/g, '<br>');
                        document.getElementById("report_timestamp").innerHTML = 
                            'Generated: ' + new Date(response_text['response']['timestamp']).toLocaleString();
                        
                        // Show the report section
                        let reportElement = document.getElementById("report_section");
                        reportElement.removeAttribute("hidden");
                        reportElement.scrollIntoView({behavior: "smooth", block: "start"});
                    } else if (response_text['response']['result'] == 'fail') {
                        document.getElementById("ai_report").innerHTML = 
                            '<span style="color: red;">' + response_text['response']['data'] + '</span>';
                        let reportElement = document.getElementById("report_section");
                        reportElement.removeAttribute("hidden");
                    }
                } catch (e) {
                    console.error('Parse error:', e);
                    document.getElementById("ai_report").innerHTML = 
                        '<span style="color: red;">Error parsing report response</span>';
                }
            } else {
                document.getElementById("ai_report").innerHTML = 
                    '<span style="color: red;">Server error (Status ' + this.status + ')</span>';
                console.error('HTTP Error:', this.status);
                let reportElement = document.getElementById("report_section");
                reportElement.removeAttribute("hidden");
            }
        }
    }
    
    xhttp.onerror = function () {
        document.getElementById("ai_report").innerHTML = 
            '<span style="color: red;">Network error. Could not generate report.</span>';
        let reportElement = document.getElementById("report_section");
        reportElement.removeAttribute("hidden");
    }
    
    xhttp.open("POST", "/generatereport", true);
    xhttp.timeout = 30000; // 30 second timeout for AI generation
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    
    // Send all the financial data
    xhttp.send("username_id=" + username_id + 
        "&age=" + age + 
        "&employmentStatus=" + employmentStatus + 
        "&income_monthly=" + income_monthly +
        "&rent=" + rent + 
        "&utilities=" + utilities + 
        "&groceries=" + groceries + 
        "&entertainment=" + entertainment +
        "&total_dept=" + total_dept + 
        "&total_assets=" + total_assets + 
        "&total_liabilities=" + total_liabilities +
        "&principal=" + principal + 
        "&monthly_interest_rate=" + monthly_interest_rate + 
        "&number_of_payments=" + number_of_payments +
        "&months_of_coverage_desired=" + months_of_coverage_desired + 
        "&desired_retirement_income=" + desired_retirement_income + 
        "&withdrawal_rate=" + withdrawal_rate +
        "&total_credit_card_balances=" + total_credit_card_balances + 
        "&total_credit_card_limits=" + total_credit_card_limits + 
        "&property_value=" + property_value +
        "&debt=" + debt +
        "&net_worth=" + net_worth + 
        "&budget_variance=" + budget_variance + 
        "&debt_to_income_ratio=" + debt_to_income_ratio +
        "&savings_rate=" + savings_rate + 
        "&emergency_fund=" + emergency_fund + 
        "&retirement_goal=" + retirement_goal +
        "&credit_utilization_ratio=" + credit_utilization_ratio + 
        "&monthly_mortgage_repayment=" + monthly_mortgage_repayment + 
        "&monthly_savings=" + monthly_savings +
        "&loan_to_value_ratio=" + loan_to_value_ratio);
}

function downloadReport() {
    const reportText = document.getElementById("ai_report").innerText;
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(reportText));
    element.setAttribute("download", "financial_report_" + new Date().toISOString().split('T')[0] + ".txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function printReport() {
    const reportContent = document.getElementById("ai_report").innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
        <html>
        <head>
            <title>Financial Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.8; }
                h2 { color: #0055ce; }
            </style>
        </head>
        <body>
            <h2>AI Financial Advisor Report</h2>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <div>${reportContent}</div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
    } 
}