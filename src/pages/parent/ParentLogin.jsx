// src/pages/parent/ParentLogin.jsx
import { useState, useEffect } from "react";
import { useParent } from "../../contexts/ParentContext";
import { useNavigate, Link } from "react-router-dom";
import { NotificationContainer } from "../../components/parent/Notification";

export default function ParentLogin() {
  const { login, parent } = useParent();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [shakeError, setShakeError] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (parent?.authenticated) {
      navigate("/parent/dashboard");
    }
  }, [parent, navigate]);

  // Shake animation on error
  useEffect(() => {
    if (error) {
      setShakeError(true);
      const t = setTimeout(() => setShakeError(false), 400);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.username || !formData.password) {
      setError("Username and password are required");
      return false;
    }

    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await login(formData.username, formData.password);

    setIsLoading(false);

    if (!result.success) {
      // Handle specific error messages
      if (result.message.includes("credentials") || result.message.includes("Invalid")) {
        setError("Invalid username or password");
      } else if (result.message.includes("network") || result.message.includes("Network")) {
        setError("Network error. Please check your connection.");
      } else {
        setError(result.message || "Login failed");
      }
    } else {
      // Successful login - redirect to dashboard
      navigate("/parent/dashboard");
    }
  };

  return (
    <>
      <NotificationContainer />
      <div className="flex flex-col items-center justify-center min-h-screen text-white px-4 py-8 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 animate-gradient-slow">
        
        <div className="mb-6 animate-bounce-in">
        <div className="text-6xl mb-2 animate-float">👨‍👩‍👧‍👦</div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold mb-2 animate-fade-in text-center drop-shadow-lg">
        Parent Portal
      </h1>
      <p className="text-white/80 mb-8 animate-fade-in-delay text-center text-sm sm:text-base">
        Login to track your child's progress
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-[400px] animate-slide-up border-2 border-white/20 transition-all duration-300"
      >
        {/* Username */}
        <div className="relative mb-6">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onFocus={() => setFocusedField("username")}
            onBlur={() => setFocusedField("")}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white outline-none border-2 border-transparent focus:border-purple-400 focus:shadow-[0_0_20px_rgba(192,132,252,0.5)] transition-all duration-200 placeholder-transparent peer"
            placeholder="Username"
            id="username"
            aria-label="Username"
            required
            autoComplete="username"
          />
          <label
            htmlFor="username"
            className={`absolute left-4 transition-all duration-200 pointer-events-none ${
              formData.username || focusedField === "username" 
                ? "-top-2.5 text-xs bg-purple-600 px-2 rounded text-white" 
                : "top-3 text-white/50"
            }`}
          >
            Username
          </label>
        </div>

        {/* Password */}
        <div className="relative mb-6">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField("")}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white outline-none border-2 border-transparent focus:border-purple-400 focus:shadow-[0_0_20px_rgba(192,132,252,0.5)] transition-all duration-200 placeholder-transparent peer"
            placeholder="Password"
            id="password"
            aria-label="Password"
            required
            autoComplete="current-password"
          />
          <label
            htmlFor="password"
            className={`absolute left-4 transition-all duration-200 pointer-events-none ${
              formData.password || focusedField === "password" 
                ? "-top-2.5 text-xs bg-purple-600 px-2 rounded text-white" 
                : "top-3 text-white/50"
            }`}
          >
            Password
          </label>
        </div>

        {error && (
          <div className={`bg-red-500/20 border-2 border-red-400 rounded-lg p-3 mb-4 ${shakeError ? "animate-shake" : ""}`}>
            <p className="text-red-400 text-sm text-center">⚠️ {error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:brightness-110 text-white font-semibold py-3 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          aria-label={isLoading ? "Logging in" : "Login"}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Logging in...
            </span>
          ) : (
            <span>Login</span>
          )}
        </button>
      </form>

        <Link 
          to="/parent/register" 
          className="mt-6 text-sm text-cyan-300 hover:text-cyan-200 hover:underline transition-all duration-200"
        >
          Don't have an account? Register
        </Link>
      </div>
    </>
  );
}
