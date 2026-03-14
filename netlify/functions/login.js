const jwt = require('jsonwebtoken');

const SECRET = 'supersecret';
const users = [
  { username: 'guest', password: 'guest123', role: 'guest' },
  { username: 'admin', password: 'X9k#mP2$vL8@qR5!', role: 'admin' }
];

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const { username, password } = JSON.parse(event.body);
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid credentials' })
    };
  }

  const token = jwt.sign(
    { username: user.username, role: user.role },
    SECRET,
    { algorithm: 'HS256' }
  );

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  };
};
