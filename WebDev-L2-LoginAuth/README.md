# Keyhole — Login Authentication System (Enhanced)

A front-end-only authentication flow with real, separate pages — registration, login, password reset, and a protected dashboard.

## Pages
- `register.html` — create an account, with a live **password strength meter**
- `login.html` — sign in, with **show/hide password**, **Remember me**, and a link to reset your password
- `forgot-password.html` — reset your password by confirming username + email (front-end-only equivalent of an emailed reset link)
- `dashboard.html` — protected; redirects to `login.html` if there's no active session
- `index.html` — redirects straight to `login.html`

## Features
- Registration: username, email, password → validated, hashed (SHA-256), stored
- **Live password strength meter** (Very weak → Very strong) based on length and character diversity
- **Show/hide password** toggle on every password field
- Password rule: minimum 8 characters **and** at least 1 number
- Duplicate username/email rejected with a clear error
- Login: generic "Incorrect username/email or password" — never reveals which field was wrong
- **Remember me**: checked → session survives closing the browser tab (`localStorage`); unchecked → session ends when the tab closes (`sessionStorage`)
- **Forgot password**: confirms both username and email match the same account before allowing a reset
- Dashboard shows a **colour-coded initials avatar** (deterministic per username), a **live-ticking session duration** timer, account-created date, and which storage the session is using
- Dashboard is a real protected route: opening `dashboard.html` directly without logging in bounces you straight to `login.html`
- Logout clears both possible session locations
- Passwords are never stored in plain text — hashed client-side with SHA-256 via the Web Crypto API
- No empty-field submissions

## How the "backend" works (read this — it matters)
This is a **front-end only** demo:
- `localStorage` holds registered users (`username`, `email`, a SHA-256 password **hash**, `createdAt`)
- The session lives in `sessionStorage` **or** `localStorage` depending on "Remember me"

**Do not treat this as production-secure.** A real system must hash passwords server-side with a salted algorithm like bcrypt/argon2, send real reset emails, never trust the client to enforce auth, and use HttpOnly session cookies — not localStorage. This project demonstrates the *user-facing flow*.

## File structure
```
WebDev-L2-LoginAuth/
├── index.html
├── register.html
├── login.html
├── forgot-password.html
├── dashboard.html
├── css/style.css
├── js/auth.js
└── README.md
```

## Run it
Open `index.html` (or `login.html`) in a browser. Register an account, watch the strength meter respond as you type, log in with "Remember me" checked, then close and reopen the tab to see the session persist. Try `forgot-password.html` to reset a password, and open `dashboard.html` directly with no session to see the redirect guard.
