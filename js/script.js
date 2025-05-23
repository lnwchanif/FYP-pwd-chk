/*https://getbootstrap.com/docs/5.3/customize/color-modes/ */
/*https://github.com/404GamerNotFound/bootstrap-5.3-dark-mode-light-mode-switch/tree/main*/

document.addEventListener('DOMContentLoaded', ()=>{
    const htmlElement = document.documentElement;
    const switchElement = document.getElementById('themeSwitch');
    
    // Set the default theme to light
    const currentTheme = localStorage.getItem('bsTheme') || 'light';
    htmlElement.setAttribute('data-bs-theme', currentTheme);
    switchElement.checked = currentTheme === 'dark';

    switchElement.addEventListener('change', function () {
        if (this.checked) {
            htmlElement.setAttribute('data-bs-theme', 'dark');
            localStorage.setItem('bsTheme', 'dark');
        } else {
            htmlElement.setAttribute('data-bs-theme', 'light');
            localStorage.setItem('bsTheme', 'light');
        }
    });    
})
// Listen for password input events
document.getElementById('password').addEventListener('input', async function() {
    const password = this.value;

    //https://www.codingnepalweb.com/password-strength-checker-javascript-2///
    // Evaluate password strength using a zxcvbn
    const pwStrength = document.getElementById('PasswordStrength__value');
    const strength = evaluatePasswordStrength(password);
    const input__box = document.getElementById('input-box');
    const toggle_button = document.getElementById('toggle_button');
    const clear_button = document.getElementById('clear_button')


    pwStrength.textContent = strength.feedback;
    pwStrength.style.color = strength.color;
    input__box.style.borderColor = strength.color; //change border color box according to strength
    toggle_button.style.color = strength.color; //change eye icon color accoding to strength
    clear_button.style.color = strength.color; // change clear button color according to strenght

    //Bar
    //Update Bar
    const bar = document.getElementById('strengthBar');
    const box__password = document.getElementById('input-box');

    bar.style.width = strength.percent;
    bar.style.backgroundColor = strength.color;
    box__password.style.borderColor = strength.color;


    // display estimated crack time based on zxcvbn
    const timeCrackElem = document.getElementById('timeCrack__value');
    const crackTime = zxcvbnCrackTime(password);
    function zxcvbnCrackTime(password) {
        if (!password)
            return '';
        if (password.length < 8)
            return 'less than a second';

        const result = zxcvbn(password);
        return result.crack_times_display.offline_slow_hashing_1e4_per_second;
    }
    timeCrackElem.textContent = crackTime;


    //checkbox
    const checkboxes = {
        length: document.getElementById("length"),
        digits: document.getElementById("digits"),
        symbols: document.getElementById("symbols"),
        capital: document.getElementById("capital")
      };
    
    const rules = [
        {regex: /.{8,}/}, //at least 8 characters
        {regex: /[0-9]/}, //contains a digit
        {regex: /[^A-Za-z0-9]/}, //symbols
        {regex: /[A-Z]/} //contain capital

    ]
    const checkboxIds = ['length','digits','symbols','capital'];

    function updateRulesState(password){
        rules.forEach((rule, i)=>{
            const id = checkboxIds[i];
            const checkbox__each = checkboxes[id];
            if (!checkbox__each)
                return'';
            checkbox__each.checked = rule.regex.test(password)
        })
    }

    updateRulesState(password);

    
    // Check breach status using Have I Been Pwned API (client-side)
    const HIBP_feedback = document.getElementById('HIBP_feedback');
    if (password.length > 0) {
        try {
            // Compute SHA-1 hash using CryptoJS (as an uppercase hex string)
            const hash = CryptoJS.SHA1(password).toString().toUpperCase();
            const prefix = hash.substring(0, 5);
            const suffix = hash.substring(5);
            const response = await fetch("https://api.pwnedpasswords.com/range/" + prefix);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.text();
            const lines = data.split("\n");
            let breached = false;
            let breachCount = 0;
            for (let line of lines) {
                const parts = line.split(':');
                if (parts[0].trim() === suffix) {
                    breached = true;
                    breachCount = parseInt(parts[1].trim());
                    break;
                }
            }
            if (breached) {
             const exclamationIcon = `
                <svg xmlns="http://www.w3.org/2000/svg" class = "warningIcon" width="40" height="40" fill="currentColor" class="bi bi-exclamation-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
                </svg>`;
                HIBP_feedback.innerHTML = exclamationIcon + "<b>Your password has been breached </b>" + breachCount.toLocalString('en') + "<b> times.</b>";
                HIBP_feedback.style.color = "red";
            } else {
                const checkIcon = 
                '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" class = "warningIcon" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16"> <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/> <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/></svg>';
                HIBP_feedback.innerHTML = checkIcon + "<b>Your password does not appear in leaked passwords</b>";                HIBP_feedback.style.color = "green";
            }
        } catch (error) {
            console.error("Error checking breach status:", error);
            HIBP_feedback.textContent = "Error checking breach status.";
            HIBP_feedback.style.color = "gray";
        }
        
     } else {
        HIBP_feedback.textContent = "";
     }

    //display feedback & warning
    const suggestionsList = document.getElementById('suggestionsList');
    const warningList = document.getElementById('warningList');
    // 1) Run zxcvbn a single time
    const feedback = zxcvbn(password).feedback;

    // 2) Warning (just one string)
    warningList.textContent = feedback.warning;

    // 3) Suggestions (array → <li>…</li>)
    suggestionsList.innerHTML = (feedback.suggestions || []).map(s => `<li>${s}</li>`).join('');
    

    //clear if empty
    if (!password){
        warningList.textContent = '';
        suggestionsList.innerHTML = '';
        return;
    }
    
});


