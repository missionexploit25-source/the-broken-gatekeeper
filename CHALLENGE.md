# The Broken Gatekeeper - Challenge Brief

## Scenario

You've discovered a login portal for a secure administrative system. The system uses JWT tokens for authentication and claims to have "military-grade security."

Your mission: Retrieve the admin flag from `/admin/flag`

## Getting Started

The system has a guest account for demo purposes:
- Username: `guest`
- Password: `guest123`

The admin account exists but the password is unknown and uncrackable.

## Endpoints Discovered

- `POST /login` - Authentication endpoint
- `GET /dashboard` - User dashboard (requires authentication)
- `GET /admin/flag` - Admin-only endpoint (requires admin role)

## Your Task

Find a way to access the admin flag without knowing the admin password.

**Hint:** Sometimes the strongest locks have the weakest keys. Look closely at how the system validates your identity.

## Tools You Might Need

- Browser Developer Console (F12)
- JWT.io (https://jwt.io) - for inspecting tokens
- curl or Postman - for API testing

Good luck, hacker!
