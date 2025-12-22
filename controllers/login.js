var xxx = 1
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var response_text = JSON.parse(this.responseText);
            if (response_text['response']['result'] == 'ok') {
                document.getElementById("info").innerHTML = response_text['response']['data'];
                document.getElementById("info").style.color = "green";
                   sessionStorage.setItem( 'id' ,response_text['response']['id'] );
                   sessionStorage.setItem( 'user_name' ,response_text['response']['user_name'] );
                setTimeout(function () {
                    window.location.href = 'dashboard.html'
                }, 1000);
            } else if (response_text['response']['result'] == 'fail') {
                document.getElementById("info").innerHTML = response_text['response']['data'];
                document.getElementById("info").style.color = "red";
            }
        }
    }
    xhttp.open("POST", "http://localhost:3000/login", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("username=" + username + "&password=" + password);
});

document.addEventListener('DOMContentLoaded', function() {

    const form = document.getElementById('loginForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Store form data in localStorage and redirect to results.html
        localStorage.setItem('id', '33333333333333');

    });
});