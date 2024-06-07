const del = document.querySelector("#delete");
const req = document.querySelector(".delReq");
del.addEventListener("click", async () => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await req.click(); // Wait for deletion to complete
      } catch (error) {
        // Handle deletion error (optional)
        console.error("Error deleting:", error);
      }
    }
});
  

function goBack() {
    window.history.back();
}

// script.js

// To access the stars
let stars = document.getElementsByClassName("star");
let output = document.getElementById("output");
let ratingInput = document.getElementById("rating"); // Get the rating input element
let err = document.getElementById("error");
let submitBtn = document.getElementById("subBtn");
let reviewForm = document.getElementById("reviewForm");

// Function to update rating and set input value
function gfg(n) {
  remove(); // Remove previous styling
  for (let i = 0; i < n; i++) {
    if (n == 1) cls = "one";
    else if (n == 2) cls = "two";
    else if (n == 3) cls = "three";
    else if (n == 4) cls = "four";
    else if (n == 5) cls = "five";
    stars[i].className = "star " + cls;
  }
  output.innerText = n + "/5";
  ratingInput.value = n; // Set the value of the hidden input field
}

// Function to remove pre-applied styling
function remove() {
  let i = 0;
  while (i < 5) {
    stars[i].className = "star";
    i++;
  }
}

submitBtn.addEventListener("click", (event) => {
  if(ratingInput.value == 0){
    err.style.display = "block";
      event.preventDefault();
      event.stopPropagation();
  }
})

let delReviewBtns = document.querySelectorAll("#delReview");
let reviewDelReqs = document.querySelectorAll("#reviewDelReq");
for(let i = 0; i < delReviewBtns.length; i++){
  delReviewBtns[i].addEventListener("click", async() => {
    const scrollY = window.scrollY; // Get current scroll position
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewDelReqs[i].click(); // Wait for deletion to complete
      } catch (error) {
        // Handle deletion error (optional)
        console.error("Error deleting:", error);
      }
    }
    else{
      window.scrollTo(0, scrollY);
    }
  });
}

