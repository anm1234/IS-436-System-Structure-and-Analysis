const loginBtn = document.querySelector(".loginbtn");
const loadingImg = document.querySelector(".loading");

loginBtn.addEventListener("click", () => {
    loadingImg.src = "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2FscmN3eGZ1ZTUwMDk5czJ1bTNqNHMxN25pNDYxdjkwMHozN3djNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7bu3XilJ5BOiSGic/giphy.gif";
    loadingImg.classList.add("visible");
});
