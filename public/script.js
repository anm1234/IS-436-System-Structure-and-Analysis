window.onload = (event) => {
    
    history.pushState(null, null, location.href);


    window.addEventListener('popstate', function () {
       
        history.pushState(null, null, location.href);
    });
};


const form = document.getElementById("askForm");
const respond = document.querySelector(".response");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const question = form.askgpt.value;

    const parent = document.querySelector(".ai")

    const responding = document.createElement("p");
    const userask = document.createElement("p");

    userask.classList.add("user-question");
    responding.classList.add("response");
    responding.textContent = "Thinking... 🤔";


    userask.innerHTML = question; 
    parent.appendChild(userask);
    parent.appendChild(responding);

    fetch("/submitquest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ askgpt: question })
    })
    .then(res => res.json())
    .then(data => {
        responding.innerHTML = "AI response: " + data.answer;
        form.reset();
    })
    .catch(err => {
        console.error(err);
        responding.innerHTML = "Error fetching response";
    });
});


