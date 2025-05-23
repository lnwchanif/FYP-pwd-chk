// Toggle password visibility

// const eye_dark_close = document.getElementById('eye_dark_close');
// const passwordField = document.getElementById('password');

//   eye_dark_close.onclick = function(){
//     if(passwordField.type == 'password'){
//         passwordField.type = 'text';
//         eye_dark_close.src = '/FYP/images/eye_dark_open.png'
//     }
//     else{
//         passwordField.type='password';
//         eye_dark_close.src = '/FYP/images/eye_dark_close.png'
//       }
//   }

//https://dev.to/designyff/password-input-with-label-and-hideshow-toggle-eye-svg-a-simple-tutorial-46mb
const input__toggle = document.getElementById('toggle_button');
const passwordField = document.getElementById('password');

input__toggle.onclick = function(){
  if(passwordField.type == 'password'){
    passwordField.type = 'text';
    toggle_button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="60" height="55">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>`
      }
      else{
        passwordField.type='password';
        toggle_button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="60" height="55">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>`
      }
}

//https://www.geeksforgeeks.org/html-clearing-the-input-field/
//click clear button to clear input
//2. onclick event and document.getElementById() method
const clear = document.getElementById('clear_button');

//https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent
function clearPasswordField(){
  passwordField.value = ''
  password.dispatchEvent(new Event('input'));
}

clear.onclick = function (){
  // wipe the field and all the dynamic feedback
  clearPasswordField();

  }
