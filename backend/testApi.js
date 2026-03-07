/* built-in fetch requires Node 18+ */
import jwt from 'jsonwebtoken';

// Generate a valid mock token for a user that exists
const secret = process.env.JWT_SECRET || 'fallback_secret';
const token = jwt.sign({ id: '659b1234abcd5678ef901234' }, secret, { expiresIn: '1h' });

async function run() {
  try {
    const res = await fetch('http://localhost:5000/api/patients/saved-trials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ trialId: 'TEST-123', trialName: 'Test Trial' })
    });
    
    if (!res.ok) {
       console.error("HTTP ERROR", res.status);
       const text = await res.text();
       console.error(text);
       return;
    }

    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}
run();
