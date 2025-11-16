// src/pages/Profile.jsx
import { useState, useEffect, useRef } from "react";
import { useUser } from "../hooks/useUser";
import Login from "./Login";
import { LogOut, Star, Edit, Save, Upload, X, Loader2 } from "lucide-react";
import LazyImage from "../components/LazyImage";

export default function Profile() {
  const { user, loading, logout, updateUser } = useUser();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const [animatedLevel, setAnimatedLevel] = useState(0);
  const hasAnimated = useRef(false);

  // Sync form with user from context
  useEffect(() => {
    if (user) setForm(user);
  }, [user]);

  // Animated counter effect for points and level
  useEffect(() => {
    if (!user || hasAnimated.current) return;
    
    const targetPoints = user.points || 250;
    const targetLevel = user.level || 1;
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const pointsIncrement = targetPoints / steps;
    const levelIncrement = targetLevel / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setAnimatedPoints(Math.min(Math.round(pointsIncrement * currentStep), targetPoints));
      setAnimatedLevel(Math.min(Math.round(levelIncrement * currentStep), targetLevel));
      
      if (currentStep >= steps) {
        clearInterval(timer);
        hasAnimated.current = true;
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-full text-white"><p>Loading profile...</p></div>;
  if (!user) return <Login />;

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(prev => ({ ...prev, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => setForm(prev => ({ ...prev, avatar: null }));

  const handleSave = async () => {
    setSaving(true);
    const updated = await updateUser(form);
    if (updated) {
      setEditing(false);
      // Reset animation flag to re-animate with new values
      hasAnimated.current = false;
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col items-center justify-start h-full text-white px-4 py-6 animate-page-fade-in">
      {/* Avatar Section */}
      <div className="mb-6 flex flex-col items-center">
        <div className="relative group">
          {/* Avatar with gradient border (4px purple to pink) and colored glow */}
          <div className="relative w-[120px] h-[120px] lg:w-[160px] lg:h-[160px] rounded-full p-[4px] bg-gradient-to-br from-purple-500 to-pink-500 shadow-glow-purple transition-all duration-300 hover:shadow-glow-pink">
            <LazyImage 
              src={form?.avatar || "https://i.pravatar.cc/150"} 
              alt={`${form?.name || user?.name || 'User'}'s profile picture`}
              className="w-full h-full rounded-full object-cover bg-gray-800 transition-transform duration-500"
              style={{ 
                animation: form?.avatar !== user?.avatar ? 'scale-in 0.5s ease-out' : 'none',
                transform: form?.avatar !== user?.avatar ? 'scale(1)' : 'scale(1)'
              }}
            />
          </div>
          
          {/* Remove button with smooth fade transition */}
          {editing && form?.avatar && (
            <button 
              onClick={handleRemoveImage} 
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-2 text-white shadow-lg transition-all duration-300 hover:scale-110 animate-fade-in min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Remove profile photo"
            >
              <X size={16} aria-hidden="true"/>
            </button>
          )}
        </div>

        {/* Upload button with icon animation */}
        {editing && (
          <label className="cursor-pointer group flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 rounded-xl text-sm font-medium mt-4 hover:brightness-110 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg min-h-[44px]">
            <Upload size={18} className="transition-transform duration-300 group-hover:-translate-y-1" aria-hidden="true"/> 
            Upload Photo
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload}
              aria-label="Upload profile photo"
            />
          </label>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex flex-col items-center w-full max-w-md shadow-xl mb-4 transition-all duration-300"
           style={{ border: editing ? '2px solid transparent' : '2px solid rgba(255, 255, 255, 0.2)', 
                    backgroundImage: editing ? 'linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), linear-gradient(135deg, #a855f7, #ec4899)' : 'none',
                    backgroundOrigin: 'border-box',
                    backgroundClip: editing ? 'padding-box, border-box' : 'padding-box' }}>

        <h2 className="text-2xl font-bold mb-1">{form?.name || user.name}</h2>

        {!editing ? (
          <p className="text-sm text-gray-300 mb-4">{form?.classLevel || user.classLevel} · Level {form?.level || user.level}</p>
        ) : (
          <div className="space-y-3 w-full mt-4 animate-slide-up">
            <label className="block text-white text-sm font-medium">
              Class:
              <select 
                name="classLevel" 
                value={form.classLevel || ""} 
                onChange={handleChange} 
                className="w-full px-3 py-2 rounded-lg mt-1 bg-white/90 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300 min-h-[48px]"
              >
                <option>Class 1</option><option>Class 2</option><option>Class 3</option>
                <option>Class 4</option><option>Class 5</option><option>Above Class 5</option>
              </select>
            </label>
            <label className="block text-white text-sm font-medium">
              Level:
              <input 
                type="number" 
                name="level" 
                value={form.level || ""} 
                onChange={handleChange} 
                className="w-full px-3 py-2 rounded-lg mt-1 bg-white/90 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300 min-h-[48px]"
              />
            </label>
            <label className="block text-white text-sm font-medium">
              Email:
              <input 
                type="email" 
                name="email" 
                value={form.email || ""} 
                onChange={handleChange} 
                className="w-full px-3 py-2 rounded-lg mt-1 bg-white/90 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300 min-h-[48px]"
              />
            </label>
            <label className="block text-white text-sm font-medium">
              Age:
              <input 
                type="number" 
                name="age" 
                value={form.age || ""} 
                onChange={handleChange} 
                className="w-full px-3 py-2 rounded-lg mt-1 bg-white/90 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300 min-h-[48px]"
              />
            </label>
            <label className="block text-white text-sm font-medium">
              School:
              <input 
                type="text" 
                name="school" 
                value={form.school || ""} 
                onChange={handleChange} 
                className="w-full px-3 py-2 rounded-lg mt-1 bg-white/90 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300 min-h-[48px]"
              />
            </label>
          </div>
        )}
      </div>

      {/* Progress Stats - Animated counters for points and level */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md shadow-xl mb-6 animate-fade-in">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Star className="text-yellow-400 animate-pulse"/> Progress
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Points Counter with animated count-up */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-glow-purple">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {animatedPoints}
            </div>
            <div className="text-sm text-gray-300 mt-1">Points</div>
          </div>
          
          {/* Level Badge with glow effect */}
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 text-center relative transition-all duration-300 hover:scale-105 hover:shadow-glow-blue overflow-hidden">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent relative z-10">
              {animatedLevel}
            </div>
            <div className="text-sm text-gray-300 mt-1 relative z-10">Level</div>
            {/* Animated glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/30 to-cyan-400/30 blur-xl animate-pulse-glow pointer-events-none"></div>
          </div>
          
          {/* Star Rating with fill animation */}
          <div className="col-span-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-glow-green">
            <div className="flex justify-center gap-1 text-2xl mb-2">
              {[1, 2, 3, 4, 5].map((starNum, idx) => {
                const rating = user?.rating || 3;
                const isFilled = idx < rating;
                return (
                  <Star 
                    key={starNum} 
                    size={24}
                    className={`inline-block transition-all duration-300 ${
                      isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'
                    }`}
                    style={{ 
                      animation: `scale-in 0.3s ease-out ${idx * 0.1}s both`,
                    }}
                  />
                );
              })}
            </div>
            <div className="text-sm text-gray-300">Achievement Rating</div>
          </div>
        </div>
      </div>

      {/* Action Buttons with gradient backgrounds and loading states */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        {!editing ? (
          <button 
            onClick={() => setEditing(true)} 
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:brightness-110 px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-glow-blue active:scale-95 min-h-[48px] group"
          >
            <Edit size={20} className="transition-transform duration-300 group-hover:rotate-12"/> 
            <span>Edit Profile</span>
          </button>
        ) : (
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:brightness-110 px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-glow-green active:scale-95 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin"/>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={20} className="transition-transform duration-300 group-hover:scale-110"/> 
                <span>Save Changes</span>
              </>
            )}
          </button>
        )}
        <button 
          onClick={logout} 
          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:brightness-110 px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 min-h-[48px] group"
        >
          <LogOut size={20} className="transition-transform duration-300 group-hover:translate-x-1"/> 
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
