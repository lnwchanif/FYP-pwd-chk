// Evaluate password strength based on zxcvbn
function evaluatePasswordStrength(password) {
    if (!password){
        return { percent: '0%', feedback: '', color: '' };
    }
    // if (password.length < 8) {
    //     return { percent: 0, feedback: "Very weak", color: "red" };
    // }

    //call zxcvbn
    const result = zxcvbn(password);
    const score = result.score; //0-4
    const percent = (score / 4) * 100 + '%'; //map 0-100%

    // Map score to feedback and color
    let feedbackText = "", color = "";
    switch (score) {
        case 0: feedbackText = "Very weak"; color = "red"; break;
        case 1: feedbackText = "Weak"; color = "#ff4000"; break;
        case 2: feedbackText = "Moderate"; color = "#ff8000"; break;
        case 3: feedbackText = "Strong"; color = "#9bc158"; break;
        case 4: feedbackText = "Very strong"; color = "green"; break;

        default: feedbackText = "Undefined"; color = "#ccc";
    }

    return { percent: percent, feedback: feedbackText, color: color };
 

}

