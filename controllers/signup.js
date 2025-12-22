document.getElementById('signupForm').addEventListener('submit', function (event) {
    event.preventDefault();
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirm-password').value;
    var xhttp = new XMLHttpRequest();
    if (password === confirmPassword) {
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var response_text = JSON.parse(this.responseText);
                if (response_text['response']['result'] == 'ok') {
                    document.getElementById("info").innerHTML = response_text['response']['data'];
                    document.getElementById("info").style.color = "green";
                    setTimeout(function () {
                        window.location.href = 'login.html'
                    }, 1000);
                } else if (response_text['response']['result'] == 'fail') {
                    document.getElementById("info").innerHTML = response_text['response']['data'];
                    document.getElementById("info").style.color = "red";
                }
            }
        }
        xhttp.open("POST", "http://localhost:3000/register", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("username=" + username + "&password=" + password);

    } else {
        document.getElementById("info").innerHTML = 'Passwords do not match, Make this Correct.';
        document.getElementById("info").style.color = "red";

    }
});
  