
const loginForm  = document.querySelector("#id01 .modal-content");
const signupForm = document.querySelector("#id02 .modal-content");
const loadingImg = document.querySelector(".loading");
const statusMsg  = document.querySelector(".status");


window.onload = function () {
    history.pushState(null, null, window.location.href);
    history.back();
    window.onpopstate = () => history.forward();
};


loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user_email = loginForm.querySelector("input[name='user_email']").value;
    const user_pass  = loginForm.querySelector("input[name='user_pass']").value;

    loadingImg.src =
      "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2FscmN3eGZ1ZTUwMDk5czJ1bTNqNHMxN25pNDYxdjkwMHozN3djNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7bu3XilJ5BOiSGic/giphy.gif";
    loadingImg.style.display = "block";
    loadingImg.style.margin = "20px auto"

    setTimeout(() => { loadingImg.style.display = "none"; }, 1200);

    const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email, user_pass })
    });

    const data = await res.json();
    console.log("LOGIN RESPONSE:", data);

    if (data.value === false) {
        statusMsg.innerHTML = "Unable to authenticate user.";
        statusMsg.style.color = "red";
        return;
    }

    loginForm.reset();
    document.getElementById("id01").style.display = "none";

    if (data.redirect) {
        window.location.href = data.redirect;
    }
});


signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fname = signupForm.querySelector("input[name='fname']").value;
    const lname = signupForm.querySelector("input[name='lname']").value;
    const email = signupForm.querySelector("input[name='email']").value;
    const psw   = signupForm.querySelector("input[name='psw']").value;

    const registration = {
        fname, lname, email, password: psw
    };

    const res = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration })
    });

    const data = await res.json();
    console.log("SIGNUP RESPONSE:", data);

    if (!data.values) {
        statusMsg.innerHTML = "Unable to register user.";
        statusMsg.style.color = "red";
        return;
    }
    statusMsg.style.textAlign = "center";
    statusMsg.innerHTML = "User registration successful!";  
    statusMsg.style.color = "green";
    statusMsg.innerHTML = "";
    signupForm.reset();
    document.getElementById("id02").style.display = "none";
});
