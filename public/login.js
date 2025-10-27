const loginForm = document.querySelector("#login"); // the form
const loadingImg = document.querySelector(".loading");

let input_email = document.querySelector(".email");
let decision = document.querySelector(".status");
let decision_pass = document.querySelector(".password");

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