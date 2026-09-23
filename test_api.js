const fetch = require('node-fetch');

async function test() {
  const login = await fetch('http://localhost:8001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ezeilodavid292@gmail.com', password: 'password' }) // Assuming password is 'password', actually I don't know the password.
  });
}
