// src/pages/Login.jsx
import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, signup } = useUser();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both fields");
      return;
    }

    let result;
    if (isSignup) {
      console.log(username , password)
      result = await signup(username, password);
    } else {
      result = await login(username, password);
    }

    if (!result.success) {
      setError(result.message || "Something went wrong");
    } else {
      setError("");
      navigate("/profile"); // ✅ redirect to profile
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-white">
      <h1 className="text-2xl font-bold mb-4">{isSignup ? "📝 Sign Up" : "🔑 Login"}</h1>

      <form onSubmit={handleSubmit} className="bg-white/10 p-6 rounded-xl shadow-md w-full max-w-xs">
        <label className="block mb-2 text-sm">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 rounded bg-white/20 text-white outline-none mb-3"
          placeholder="Your name"
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

        <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg">
          {isSignup ? "Sign Up" : "Login"}
        </button>
      </form>

      <button onClick={() => setIsSignup(!isSignup)} className="mt-4 text-sm text-orange-300 hover:underline">
        {isSignup ? "Already have an account? Login" : "New user? Sign up"}
      </button>
    </div>
  );
}
