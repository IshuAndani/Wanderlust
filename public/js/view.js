const del = document.querySelector("#delete");
const req = document.querySelector(".delReq");
del.addEventListener("click", () => {
    // alert("Are you sure you want to delete this listing?");
    if (window.confirm('Are you sure you want to delete this listing?')){
        req.click();
    }
});

function goBack() {
    window.history.back();
}