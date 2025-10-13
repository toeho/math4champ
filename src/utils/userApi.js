const API_URL = "http://localhost:8000/users";

export async function loginUser({ username, password }) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Invalid credentials");
  }
  return res.json();
}

export async function signupUser({
  username,
  password,
  name,
  level,
  email,
  avatar,
  class_level,
  age,
  school
}) {
  const payload = {
    username,
    password,
    name,
    level,
    email,
    avatar,
    class_level,
    age,
    school
  };

  console.log("🟢 Sending signup payload:", payload); // <--- Add this

  const res = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Signup failed");
  }

  return res.json();
}


export async function fetchUser(token) {
  const res = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function saveUser(updates, token) {
  const res = await fetch(`${API_URL}/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) return null;
  return res.json();
}
