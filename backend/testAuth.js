async function testAuth() {
  const timestamp = Date.now();
  const testEmail = `testuser_${timestamp}@example.com`;
  const testPassword = "password123";

  console.log(`--- Testing Register API ---`);
  try {
    const registerRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Test User",
        email: testEmail,
        password: testPassword,
        role: "patient"
      })
    });
    const registerData = await registerRes.json();
    console.log("Register Response:");
    console.log(JSON.stringify(registerData, null, 2));
    
    if (registerData.success && registerData.token && registerData.user) {
      console.log("✅ Register matched new format expected!");
    } else {
      console.log("❌ Register format did not match expected structure.");
    }
  } catch (err) {
    console.error("Register Error:", err);
  }

  console.log(`\n--- Testing Login API ---`);
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    const loginData = await loginRes.json();
    console.log("Login Response:");
    console.log(JSON.stringify(loginData, null, 2));

    if (loginData.success && loginData.token && loginData.user) {
      console.log("✅ Login matched new format expected!");
    } else {
      console.log("❌ Login format did not match expected structure.");
    }
  } catch (err) {
    console.error("Login Error:", err);
  }
}

testAuth();
