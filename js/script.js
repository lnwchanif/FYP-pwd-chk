// Listen for password input events
document.getElementById('password').addEventListener('input', async function() {
    const password = this.value;

    //https://www.codingnepalweb.com/password-strength-checker-javascript-2///
    // Evaluate password strength using a zxcvbn
    const pwStrength = document.getElementById('PasswordStrength__value');
    const strength = evaluatePasswordStrength(password);
    const input__box = document.getElementById('input-box');
    const toggle_button = document.getElementById('toggle_button');

    pwStrength.textContent = strength.feedback;
    pwStrength.style.color = strength.color;
    input__box.style.borderColor = strength.color; //change border color box according to strength
    toggle_button.style.color = strength.color; //change eye icon color accoding to strength


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
                HIBP_feedback.textContent = "Your password has been breached " + breachCount + " times.";
                HIBP_feedback.style.color = "red";
            } else {
                HIBP_feedback.textContent = "Your password does not appear in leaked passwords";
                HIBP_feedback.style.color = "green";
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


