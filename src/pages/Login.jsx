import { useState } from "react";

const API_BASE_URL = "http://localhost:8000"; // Change this to your backend URL

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Store token in memory (not localStorage for Claude.ai artifacts)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    if (!username || !password) {
      return setError("Please enter username and password");
    }
    
    if (isSignup && !name) {
      return setError("Please enter your name");
    }

    setLoading(true);

    try {
      if (isSignup) {
        // Signup request to /users/signup
        const response = await fetch(`${API_BASE_URL}/users/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
            name,
            level: 1,
            email: null,
            avatar: null,
            class_level: null,
            age: null,
            school: null,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Signup error:", data);
          throw new Error(data.detail || "Signup failed");
        }

        // After successful signup, auto-login
        await handleLogin();
      } else {
        // Login request
        await handleLogin();
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    // Login request to /users/login
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Login failed");
    }

    // Store the access token in memory
    // accessToken = data.access_token;
    
    // Show success message
    setSuccessMessage(`✓ Successfully logged in as ${username}!`);
    
    // Fetch user profile to verify token works
    await fetchUserProfile(data.access_token);
  };

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const userData = await response.json();

      if (response.ok) {
        console.log("User profile:", userData);
        // You can store user data in state or context here
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError("");
    setSuccessMessage("");
    setName("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-white text-center">
          {isSignup ? "📝 Create Account" : "🔑 Welcome Back"}
        </h1>
        
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20">
          <div className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-white/80 text-sm mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/50 transition-all"
                />
              </div>
            )}
            
            <div>
              <label className="block text-white/80 text-sm mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-100 px-4 py-3 rounded-lg text-sm">
                {successMessage}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                isSignup ? "Sign Up" : "Login"
              )}
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={toggleMode}
            className="text-white/80 hover:text-white text-sm transition-colors underline"
          >
            {isSignup ? "Already have an account? Login" : "New user? Create an account"}
          </button>
        </div>

        <div className="mt-8 text-center text-white/60 text-xs">
          <p>Demo mode - Token stored in memory</p>
          <p className="mt-1">API: {API_BASE_URL}</p>
        </div>
      </div>
    </div>
  );
}