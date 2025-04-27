const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const https = require('https');
const fs = require('fs');

const app = express();
app.use(express.json());

app.post('/check-password', async (req, res) => {
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }
    // Hash the password using SHA-1 and convert to uppercase.
    const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);
    
    try {
        const response = await axios.get(`https://api.pwnedpasswords.com/range/`);
        const lines = response.data.split('\n');
        let breached = false;
        for (const line of lines) {
            const [hashSuffix, count] = line.split(':');
            if (hashSuffix.trim() === suffix) {
                breached = true;
                break;
            }
        }
        res.json({ breached });
    } catch (error) {
        console.error("Error checking password:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Read your certificate and key files. Update the paths accordingly.
const options = {
    key: fs.readFileSync('path/to/your-private-key.pem'),
    cert: fs.readFileSync('path/to/your-certificate.pem')
  };
  

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
