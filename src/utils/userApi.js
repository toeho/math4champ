const USERS_FILE = "/mock/users.json";
const API_URL = import.meta.env.VITE_API_URL;
const MAKE_CALL = import.meta.env.VITE_API_CALL === "true";

// Get token from localStorage
function getToken() {
  return localStorage.getItem("token") || "";
}

// GET current user
export async function fetchUser() {
  try {
    if (!MAKE_CALL) {
      const token = getToken();
      if (!token) return null;

      const cached = localStorage.getItem("user");
      if (cached) return JSON.parse(cached);

      return null;
    }

    const res = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!res.ok) throw new Error("API fetch failed");
    return await res.json();
  } catch (err) {
    console.error("fetchUser error:", err);
    return null;
  }
}

// SAVE user (update profile)
export async function saveUser(userData) {
  try {
    if (!MAKE_CALL) {
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    }

    const res = await fetch(`${API_URL}/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "API save failed");
    }

    return await res.json();
  } catch (err) {
    console.error("saveUser error:", err.message);
    return null;
  }
}

// LOGIN → returns token
export async function loginUser({ username, password }) {
  if (!MAKE_CALL) {
    const res = await fetch(USERS_FILE);
    const users = await res.json();

    const found = users.find(u => u.username === username && u.password === password);
    if (!found) throw new Error("Invalid username or password");

    localStorage.setItem("user", JSON.stringify(found));
    localStorage.setItem("token", "mock-token-" + found.username);

    return { token: "mock-token-" + found.username, user: found };
  }

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  const data = await res.json();
  localStorage.setItem("token", data.access_token);
  return data;
}

// SIGNUP → returns token
export async function signupUser({ name, username, password }) {
  if (!MAKE_CALL) {
    const newUser = { username, password, name, level: 1, email: "", avatar: null };
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("token", "mock-token-" + username);
    return { token: "mock-token-" + username, user: newUser };
  }

  const res = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, username, password }),
  });

  if (!res.ok) throw new Error("Signup failed");
  const data = await res.json();
  localStorage.setItem("token", data.access_token);
  return data;
}

// LOGOUT
export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
