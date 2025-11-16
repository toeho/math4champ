// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, signup } = useUser();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  // Trigger shake animation when error changes
  useEffect(() => {
    if (error) {
      setShakeError(true);
      const timer = setTimeout(() => setShakeError(false), 400);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both fields");
      return;
    }

    setIsLoading(true);
    setError("");

    let result;
    if (isSignup) {
      console.log(username, password);
      result = await signup(username, password);
    } else {
      result = await login(username, password);
    }

    setIsLoading(false);

    if (!result.success) {
      setError(result.message || "Something went wrong");
    } else {
      setError("");
      // Show success animation before redirect
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    }
  };

  const handleToggleMode = () => {
    setIsSignup(!isSignup);
    setError("");
    setUsername("");
    setPassword("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white px-4 py-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 animate-gradient-slow">
      {/* Animated welcome character/illustration */}
      <div className="mb-6 animate-bounce-in">
        <div className="text-6xl mb-2 animate-float">
          {isSignup ? "🎓" : "👋"}
        </div>
      </div>

      {/* Welcome heading with fade-in animation */}
      <h1 className="text-3xl sm:text-4xl font-bold mb-2 animate-fade-in text-center drop-shadow-lg">
        {isSignup ? "Join Math GPT!" : "Welcome Back!"}
      </h1>
      <p className="text-white/80 mb-8 animate-fade-in-delay text-center text-sm sm:text-base">
        {isSignup ? "Start your math learning journey" : "Continue your learning adventure"}
      </p>

      {/* Form card with glass-morphism and slide-up animation */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-[400px] animate-slide-up border-2 border-white/20 transition-all duration-300"
      >
        {/* Username field with floating label */}
        <div className="relative mb-6">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={() => setUsernameFocused(true)}
            onBlur={() => setUsernameFocused(false)}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white outline-none border-2 border-transparent focus:border-blue-400 focus:shadow-[0_0_20px_rgba(96,165,250,0.5)] transition-all duration-200 placeholder-transparent peer"
            placeholder="Username"
            id="username"
          />
          <label
            htmlFor="username"
            className={`absolute left-4 transition-all duration-200 pointer-events-none ${
              username || usernameFocused
                ? "-top-2.5 text-xs bg-blue-600 px-2 rounded text-white"
                : "top-3 text-white/50"
            }`}
          >
            Username
          </label>
        </div>

        {/* Password field with floating label */}
        <div className="relative mb-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white outline-none border-2 border-transparent focus:border-blue-400 focus:shadow-[0_0_20px_rgba(96,165,250,0.5)] transition-all duration-200 placeholder-transparent peer"
            placeholder="Password"
            id="password"
          />
          <label
            htmlFor="password"
            className={`absolute left-4 transition-all duration-200 pointer-events-none ${
              password || passwordFocused
                ? "-top-2.5 text-xs bg-blue-600 px-2 rounded text-white"
                : "top-3 text-white/50"
            }`}
          >
            Password
          </label>
        </div>

        {/* Error message with shake animation */}
        {error && (
          <div
            className={`bg-red-500/20 border-2 border-red-400 rounded-lg p-3 mb-4 ${
              shakeError ? "animate-shake" : ""
            }`}
          >
            <p className="text-red-400 text-sm text-center">⚠️ {error}</p>
          </div>
        )}

        {/* Submit button with loading state */}
        <button
          type="submit"
          disabled={isLoading || showSuccess}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:brightness-110 text-white font-semibold py-3 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : showSuccess ? (
            <span className="flex items-center justify-center gap-2">
              ✓ Success!
            </span>
          ) : (
            <span>{isSignup ? "Sign Up" : "Login"}</span>
          )}
        </button>
      </form>

      {/* Toggle button with smooth transition */}
      <button
        onClick={handleToggleMode}
        className="mt-6 text-sm text-cyan-300 hover:text-cyan-200 hover:underline transition-all duration-200 animate-fade-in-delay-2"
      >
        {isSignup ? "Already have an account? Login" : "New user? Sign up"}
      </button>

      {/* Success animation overlay */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center animate-bounce-in">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <p className="text-2xl font-bold text-white">Welcome!</p>
            <p className="text-white/80 mt-2">Redirecting...</p>
          </div>
        </div>
      )}
    </div>
  );
}
