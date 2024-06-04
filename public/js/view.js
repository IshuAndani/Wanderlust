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