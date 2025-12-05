// src/pages/parent/ParentRegister.jsx
import { useState, useEffect } from "react";
import { useParent } from "../../contexts/ParentContext";
import { useNavigate, Link } from "react-router-dom";
import { NotificationContainer } from "../../components/parent/Notification";

export default function ParentRegister() {
  const { register, parent } = useParent();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    phone_number: "",
    student_username: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [shakeError, setShakeError] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: "",
  });

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

  // Calculate password strength
  useEffect(() => {
    if (formData.password) {
      const strength = calculatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, message: "", color: "" });
    }
  }, [formData.password]);

  const calculatePasswordStrength = (password) => {
    let score = 0;
    let message = "";
    let color = "";

    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) {
      message = "Weak";
      color = "text-red-400";
    } else if (score <= 3) {
      message = "Fair";
      color = "text-yellow-400";
    } else if (score <= 4) {
      message = "Good";
      color = "text-green-400";
    } else {
      message = "Strong";
      color = "text-green-500";
    }

    return { score, message, color };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Check required fields
    if (!formData.username || !formData.password || !formData.student_username) {
      setError("Username, password, and student username are required");
      return false;
    }

    // Username validation
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return false;
    }

    // Password strength validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (passwordStrength.score < 2) {
      setError("Password is too weak. Use a mix of letters, numbers, and symbols");
      return false;
    }

    // Student username validation
    if (formData.student_username.length < 3) {
      setError("Student username must be at least 3 characters");
      return false;
    }

    // Phone number validation (optional field)
    if (formData.phone_number && !/^[\d\s\-\+\(\)]+$/.test(formData.phone_number)) {
      setError("Phone number contains invalid characters");
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

    // Prepare data - only include optional fields if they have values
    const registrationData = {
      username: formData.username,
      password: formData.password,
      student_username: formData.student_username,
    };

    if (formData.name) {
      registrationData.name = formData.name;
    }

    if (formData.phone_number) {
      registrationData.phone_number = formData.phone_number;
    }

    const result = await register(registrationData);

    setIsLoading(false);

    if (!result.success) {
      // Handle specific error messages
      if (result.message.includes("student") && result.message.includes("not found")) {
        setError("Student username not found. Please check and try again.");
      } else if (result.message.includes("username") && result.message.includes("exists")) {
        setError("Username already taken. Please choose a different username.");
      } else if (result.message.includes("duplicate") || result.message.includes("already exists")) {
        setError("Username already taken. Please choose a different username.");
      } else if (result.message.includes("network") || result.message.includes("Network")) {
        setError("Network error. Please check your connection.");
      } else {
        setError(result.message || "Registration failed");
      }
    } else {
      // Successful registration - redirect to login
      navigate("/parent/login", { 
        state: { message: "Registration successful! Please login." } 
      });
    }
  };

  return (
    <>
      <NotificationContainer />
      <div className="flex flex-col items-center justify-center min-h-screen text-white px-4 py-8 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 animate-gradient-slow">
        
        <div className="mb-4 animate-bounce-in">
        <div className="text-5xl mb-2 animate-float">👨‍👩‍👧‍👦</div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold mb-2 animate-fade-in text-center drop-shadow-lg">
        Parent Registration
      </h1>
      <p className="text-white/80 mb-6 animate-fade-in-delay text-center text-sm sm:text-base">
        Create an account to track your child's progress
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
            Username *
          </label>
        </div>

        {/* Password */}
        <div className="relative mb-2">
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
            autoComplete="new-password"
          />
          <label
            htmlFor="password"
            className={`absolute left-4 transition-all duration-200 pointer-events-none ${
              formData.password || focusedField === "password" 
                ? "-top-2.5 text-xs bg-purple-600 px-2 rounded text-white" 
                : "top-3 text-white/50"
            }`}
          >
            Password *
          </label>
        </div>

        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/70">Strength:</span>
              <span className={`font-semibold ${passwordStrength.color}`}>
                {passwordStrength.message}
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  passwordStrength.score <= 1 ? "bg-red-400" :
                  passwordStrength.score <= 3 ? "bg-yellow-400" :
                  "bg-green-400"
                }`}
                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Name (Optional) */}
        <div className="relative mb-6">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onFocus={() => setFocusedField("name")}
            onBlur={() => setFocusedField("")}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white outline-none border-2 border-transparent focus:border-purple-400 focus:shadow-[0_0_20px_rgba(192,132,252,0.5)] transition-all duration-200 placeholder-transparent peer"
            placeholder="Full Name"
            id="name"
            aria-label="Full Name"
            autoComplete="name"
          />
          <label
            htmlFor="name"
            className={`absolute left-4 transition-all duration-200 pointer-events-none ${
              formData.name || focusedField === "name" 
                ? "-top-2.5 text-xs bg-purple-600 px-2 rounded text-white" 
                : "top-3 text-white/50"
            }`}
          >
            Full Name (Optional)
          </label>
        </div>

        {/* Phone Number (Optional) */}
        <div className="relative mb-6">
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            onFocus={() => setFocusedField("phone_number")}
            onBlur={() => setFocusedField("")}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white outline-none border-2 border-transparent focus:border-purple-400 focus:shadow-[0_0_20px_rgba(192,132,252,0.5)] transition-all duration-200 placeholder-transparent peer"
            placeholder="Phone Number"
            id="phone_number"
            aria-label="Phone Number"
            autoComplete="tel"
          />
          <label
            htmlFor="phone_number"
            className={`absolute left-4 transition-all duration-200 pointer-events-none ${
              formData.phone_number || focusedField === "phone_number" 
                ? "-top-2.5 text-xs bg-purple-600 px-2 rounded text-white" 
                : "top-3 text-white/50"
            }`}
          >
            Phone Number (Optional)
          </label>
        </div>

        {/* Student Username */}
        <div className="relative mb-6">
          <input
            type="text"
            name="student_username"
            value={formData.student_username}
            onChange={handleChange}
            onFocus={() => setFocusedField("student_username")}
            onBlur={() => setFocusedField("")}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white outline-none border-2 border-transparent focus:border-purple-400 focus:shadow-[0_0_20px_rgba(192,132,252,0.5)] transition-all duration-200 placeholder-transparent peer"
            placeholder="Student Username"
            id="student_username"
            aria-label="Student Username"
            required
            autoComplete="off"
          />
          <label
            htmlFor="student_username"
            className={`absolute left-4 transition-all duration-200 pointer-events-none ${
              formData.student_username || focusedField === "student_username" 
                ? "-top-2.5 text-xs bg-purple-600 px-2 rounded text-white" 
                : "top-3 text-white/50"
            }`}
          >
            Student Username *
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
          aria-label={isLoading ? "Registering" : "Register"}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Registering...
            </span>
          ) : (
            <span>Register</span>
          )}
        </button>
      </form>

        <Link 
          to="/parent/login" 
          className="mt-6 text-sm text-cyan-300 hover:text-cyan-200 hover:underline transition-all duration-200"
        >
          Already have an account? Login
        </Link>
      </div>
    </>
  );
}
