// src/pages/Profile.jsx
import { useUser } from "../components/UserContext";
import Login from "./Login";
import { LogOut, Star } from "lucide-react";

export default function Profile() {
  const { user, logout } = useUser();

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex flex-col items-center justify-start h-full text-white">
      {/* Profile Card */}
      <div className="bg-white/10 rounded-xl p-4 flex flex-col items-center w-full shadow mb-4">
        <img
          src="https://i.pravatar.cc/150"
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-purple-500 mb-3"
        />
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="text-sm text-gray-300">
          {user.classLevel} · Level {user.level}
        </p>
      </div>

      {/* Progress */}
      <div className="bg-white/10 rounded-xl p-4 w-full shadow mb-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Star className="text-yellow-400" /> Progress
        </h3>
        <div className="flex justify-between text-sm">
          <span>Points: <b>250</b></span>
          <span>Level: <b>{user.level}</b></span>
          <span>Stars: ⭐⭐⭐</span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="mt-6 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <LogOut size={18}/> Logout
      </button>
    </div>
  );
}
