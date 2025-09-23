// src/pages/Login.jsx
import { useState } from "react";
import { useUser } from "../components/UserContext";

export default function Login() {
  const { login, signup } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return setError("Please enter both fields");

    try {
      let res;
      if (isSignup) res = await signup({ name: username, username, password });
      else res = await login(username, password);

      if (!res.success) throw new Error(res.message || "Operation failed");
      setError("");
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-white">
      <h1 className="text-2xl font-bold mb-4">{isSignup ? "📝 Sign Up" : "🔑 Login"}</h1>
      <form onSubmit={handleSubmit} className="bg-white/10 p-6 rounded-xl shadow-md w-full max-w-xs">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full px-3 py-2 rounded bg-white/20 text-white mb-3 outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-3 py-2 rounded bg-white/20 text-white mb-4 outline-none"
        />
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <button type="submit" className="w-full bg-green-500 hover:bg-green-600 py-2 rounded-lg">
          {isSignup ? "Sign Up" : "Login"}
        </button>
      </form>
      <button onClick={() => setIsSignup(!isSignup)} className="mt-4 text-sm text-orange-300 hover:underline">
        {isSignup ? "Already have an account? Login" : "New user? Sign up"}
      </button>
    </div>
  );
}
