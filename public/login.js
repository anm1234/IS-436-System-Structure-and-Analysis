const loginForm = document.querySelector("#login"); // the form
const loadingImg = document.querySelector(".loading");
const signup = document.querySelector(".submitbtn");

let input_email = document.querySelector(".email");
let decision = document.querySelector(".status");
let decision_pass = document.querySelector(".password");

window.onload = function() {
  history.pushState(null, null, window.location.href);
  history.back();
  window.onpopstate = () => history.forward();
};

loginForm.addEventListener("submit", async(e) => {
    e.preventDefault();
    const user_email = document.querySelector(".email").value;
    const user_password = document.querySelector(".password").value;

    loadingImg.src = "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2FscmN3eGZ1ZTUwMDk5czJ1bTNqNHMxN25pNDYxdjkwMHozN3djNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7bu3XilJ5BOiSGic/giphy.gif";
    loadingImg.classList.add("visible");

    setTimeout(() => {
        loadingImg.style.display = "none"
    }, 2000);


    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: user_email, user_pass: user_password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.value == false) {
            input_email.value = "";
            decision.innerHTML = "Unable to authenticate user.";
            decision.style.color ="red";
            decision_pass.value ="";
        }else{
            loginForm.reset();
            window.location.href = "/index";

        }
    });
})

signup.addEventListener("click", ()=>{
    const first_name = prompt("What is your first name ");
    const last_name = prompt("Wha is your last name");
    
    let email_address;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    do {
        email_address = prompt("Enter your email:");
        if (!emailRegex.test(email_address)) {
            alert("Invalid email, please try again.");
        }
    } while (!emailRegex.test(email_address));

    const account_password = prompt("Please enter a password for this account");
    alert("Account setup is complete.");

    const registration = {"fname": first_name, "lname": last_name, "email": email_address, "password": account_password};
    send_to_register(registration);

})

function send_to_register(registration){

        fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration})
    })
    .then(res => res.json())
    .then(data => {
        if (data.values == false) {
            input_email.value = "";
            decision.innerHTML = "Unable to register  user.";
            decision.style.color ="red";
            decision_pass.value ="";
        }else{
            decision.innerHTML = "User registration successful";
            decision.style.color ="green";
            decision_pass.value ="";

        }
    });
    
}