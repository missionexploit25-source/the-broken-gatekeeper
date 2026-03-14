const jwt = require('jsonwebtoken');

const SECRET = 'supersecret';

function vulnerableJWTCheck(token) {
  const parts = token.split('.');
  
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

  console.log('[DEBUG] Token header:', header);
  console.log('[DEBUG] Token payload:', payload);

  if (header.alg === 'none') {
    console.log('[DEBUG] Algorithm is "none" - skipping verification');
    return payload;
  }

  if (header.alg === 'HS256') {
    return jwt.verify(token, SECRET, { algorithms: ['HS256'] });
  }

  throw new Error('Unsupported algorithm');
}

exports.handler = async (event) => {
  const authHeader = event.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'No token provided' })
    };
  }

  const token = authHeader.substring(7);

  try {
    const user = vulnerableJWTCheck(token);

    if (user.role === 'guest') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Welcome guest. Nothing to see here.' })
      };
    }

    if (user.role === 'admin') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Welcome to the dashboard.' })
      };
    }

    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Unknown role' })
    };
  } catch (err) {
    console.log('[DEBUG] Token verification error:', err.message);
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid token' })
    };
  }
};
