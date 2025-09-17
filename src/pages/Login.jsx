// src/pages/Login.jsx
import { useState } from "react";
import { useUser } from "../components/UserContext";

export default function Login() {
  const { login } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(username, password);
    if (!success) {
      setError("❌ Invalid username or password");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-white">
      <h1 className="text-2xl font-bold mb-4"> Login</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 p-6 rounded-xl shadow-md w-full max-w-xs"
      >
        <label className="block mb-2 text-sm">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 rounded bg-white/20 text-white outline-none mb-4"
          placeholder="Enter username"
        />

        <label className="block mb-2 text-sm">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded bg-white/20 text-white outline-none mb-4"
          placeholder="Enter password"
        />

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg"
        >
          Login
        </button>
      </form>
    </div>
  );
}
