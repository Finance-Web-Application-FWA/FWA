

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
}