// Local prototype account helpers only.
// For a public site, replace with a trusted authentication provider.

const USERS_KEY = 'yumori-demo-users-v1';
const SESSION_KEY = 'yumori-demo-session-v1';

const readUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch {
    return {};
  }
};

async function digest(value) {
  if (!globalThis.crypto?.subtle) {
    throw new Error(
      'Secure password hashing is unavailable in this browser context.'
    );
  }

  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);

  return [...new Uint8Array(hash)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}

export async function signUp(username, password) {
  const name = String(username || '').trim();

  if (!/^[\w.-]{3,24}$/.test(name)) {
    throw new Error(
      'Use 3–24 letters, numbers, dots or underscores for your username.'
    );
  }

  if (String(password || '').length < 8) {
    throw new Error('Choose a password with at least 8 characters.');
  }

  const users = readUsers();
  const key = name.toLowerCase();

  if (users[key]) {
    throw new Error('That username is already taken.');
  }

  users[key] = {
    username: name,
    passwordHash: await digest(password)
  };

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(SESSION_KEY, name);

  return users[key];
}

export async function logIn(username, password) {
  const name = String(username || '').trim();
  const user = readUsers()[name.toLowerCase()];

  if (!user || user.passwordHash !== await digest(password)) {
    throw new Error('Username or password is incorrect.');
  }

  localStorage.setItem(SESSION_KEY, user.username);

  return user;
}

export function currentUser() {
  return localStorage.getItem(SESSION_KEY);
}

export function logOut() {
  localStorage.removeItem(SESSION_KEY);
}

// This demo stores account data in this browser only.
// It is not production-grade authentication.
