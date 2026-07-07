/**
 * Shared authentication utilities.
 * Front-end only demo: users + hashed passwords live in localStorage.
 * The active session lives in sessionStorage by default, or localStorage
 * if "Remember me" was checked at login (so it survives closing the tab).
 *
 * IMPORTANT: this is a client-side demo for learning purposes only.
 * A real system must never store credentials in the browser.
 */
const Auth = (function () {
  const USERS_KEY = 'authdemo.users.v1';
  const SESSION_KEY = 'authdemo.session.v1';

  async function sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  function findUser(identifier) {
    const lower = (identifier || '').trim().toLowerCase();
    return getUsers().find(
      (u) => u.username.toLowerCase() === lower || u.email.toLowerCase() === lower
    );
  }

  function validatePassword(password) {
    if (password.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
    return null;
  }

  /**
   * Returns a 0-4 strength score plus a label, based on length and character
   * diversity. This is a simple heuristic (not a substitute for zxcvbn),
   * good enough to give the user a visual nudge.
   */
  function passwordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
    return { score: Math.min(score, 5), label: labels[Math.min(score, 5)] };
  }

  function initialsAvatar(name) {
    const parts = (name || '?').trim().split(/\s+/);
    const initials = parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0])
      : parts[0].slice(0, 2);
    // Deterministic colour from the name so the same user always gets the
    // same avatar colour.
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return { initials: initials.toUpperCase(), color: `hsl(${hue}, 55%, 45%)` };
  }

  async function register({ username, email, password }) {
    if (!username || !email || !password) throw new Error('All fields are required.');
    const pwError = validatePassword(password);
    if (pwError) throw new Error(pwError);
    if (findUser(username) || findUser(email)) {
      throw new Error('An account with that username or email already exists.');
    }
    const passwordHash = await sha256(password);
    const users = getUsers();
    users.push({ username: username.trim(), email: email.trim(), passwordHash, createdAt: Date.now() });
    saveUsers(users);
    return true;
  }

  async function login({ identifier, password, remember }) {
    if (!identifier || !password) throw new Error('Please enter your username/email and password.');
    const user = findUser(identifier);
    const passwordHash = await sha256(password);
    if (!user || user.passwordHash !== passwordHash) {
      throw new Error('Incorrect username/email or password.');
    }
    const session = { username: user.username, email: user.email, loginAt: Date.now() };
    if (remember) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      localStorage.removeItem(SESSION_KEY);
    }
    return true;
  }

  /** Resets a password after confirming the username AND email both match the same account. */
  async function resetPassword({ username, email, newPassword }) {
    const pwError = validatePassword(newPassword);
    if (pwError) throw new Error(pwError);
    const users = getUsers();
    const user = users.find(
      (u) => u.username.toLowerCase() === (username || '').trim().toLowerCase()
        && u.email.toLowerCase() === (email || '').trim().toLowerCase()
    );
    if (!user) throw new Error('No account matches that username and email combination.');
    user.passwordHash = await sha256(newPassword);
    saveUsers(users);
    return true;
  }

  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch (e) { return null; }
  }
  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  }
  function requireAuth(redirectTo = 'login.html') {
    if (!getSession()) window.location.href = redirectTo;
  }

  return { register, login, resetPassword, getSession, logout, requireAuth, validatePassword, passwordStrength, initialsAvatar };
})();
