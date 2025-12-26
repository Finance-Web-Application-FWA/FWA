document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('signupForm').addEventListener('submit', function (event) {
        event.preventDefault();
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        var confirmPassword = document.getElementById('confirm-password').value;
        var xhttp = new XMLHttpRequest();
        if (password === confirmPassword) {
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        try {
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
                        } catch (e) {
                            document.getElementById("info").innerHTML = 'Server error: Invalid response format';
                            document.getElementById("info").style.color = "red";
                            console.error('Parse error:', e);
                        }
                    } else {
                        document.getElementById("info").innerHTML = 'Server error (Status ' + this.status + '). Please try again.';
                        document.getElementById("info").style.color = "red";
                        console.error('HTTP Error:', this.status, this.responseText);
                    }
                }
            }
            xhttp.onerror = function () {
                document.getElementById("info").innerHTML = 'Network error or server not responding. Make sure the server is running on localhost:3000';
                document.getElementById("info").style.color = "red";
                console.error('Network error occurred');
            }
            xhttp.ontimeout = function () {
                document.getElementById("info").innerHTML = 'Request timeout. Server is not responding.';
                document.getElementById("info").style.color = "red";
            }
            xhttp.open("POST", "/register", true);
            xhttp.timeout = 10000; // 10 second timeout
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("username=" + username + "&password=" + password);

        } else {
            document.getElementById("info").innerHTML = 'Passwords do not match, Make this Correct.';
            document.getElementById("info").style.color = "red";

        }
    });
});

