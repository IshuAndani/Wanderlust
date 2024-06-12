const signupForm = document.getElementById('signupForm');
const msg = document.getElementById("message");
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('passAgain');

try{
  signupForm.addEventListener('submit', function(event) {
    if (passwordInput.value !== confirmPasswordInput.value) {
      msg.textContent = 'Passwords do not match!';
      msg.style.color = 'red';  
      event.preventDefault();
      confirmPasswordInput.style.borderColor = "red";
      const imgUrl = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e";
      confirmPasswordInput.style.backgroundImage = `url(${imgUrl})`;
    };
    return false;
  });
}catch(err){
  console.log(err);
}

const loginText = document.querySelector(".title-text .login");
const loginForm = document.querySelector("form.login");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.querySelector("form .signup-link a");

const loginRadio = document.getElementById("login");
const signRadio = document.getElementById("signup");

try {
  signupBtn.onclick = (()=>{
    loginForm.style.marginLeft = "-50%";
    loginText.style.marginLeft = "-50%";
  });
} catch (error) {
  console.log(error);
}

try {
  loginBtn.onclick = (()=>{
    loginForm.style.marginLeft = "0%";
    loginText.style.marginLeft = "0%";
  });
} catch (error) {
  console.log(error);
}

try {
  signupLink.onclick = (()=>{
    signupBtn.click();
    return false;
  });
} catch (error) {
  console.log(error);
}

try {
  document.addEventListener('DOMContentLoaded', function() {
    if(loginRadio.checked){
        loginBtn.click();
    }

    if(loginRadio.checked){
        loginBtn.click();
    }
});
} catch (error) {
  console.log(error);
}