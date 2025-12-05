// src/pages/parent/ParentProfile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParent } from "../../contexts/ParentContext";
import { LogOut, Edit, Save, User, Phone, UserCheck, Loader2, X } from "lucide-react";

export default function ParentProfile() {
  const { parent, stats, logout, loading } = useParent();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: "",
    name: "",
    phone_number: "",
    student_username: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Initialize form with parent data from stats
  useEffect(() => {
    if (stats?.child) {
      setForm({
        username: parent?.username || "",
        name: stats.child.name || "",
        phone_number: "",
        student_username: stats.child.username || "",
      });
    }
  }, [stats, parent]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !parent) {
      navigate("/parent/login");
    }
  }, [parent, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <Loader2 className="animate-spin mr-2" size={24} />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!parent || !stats) {
    return null;
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    // Validate form
    if (!form.name || form.name.trim().length < 2) {
      setSaveMessage({ type: "error", text: "Name must be at least 2 characters" });
      setSaving(false);
      return;
    }

    if (form.phone_number && !/^[\d\s\-\+\(\)]+$/.test(form.phone_number)) {
      setSaveMessage({ type: "error", text: "Please enter a valid phone number" });
      setSaving(false);
      return;
    }

    // Simulate save (backend endpoint may need to be created)
    try {
      // TODO: Implement actual API call when backend endpoint is available
      // await updateParentProfile(form, getParentToken());
      
      // For now, just simulate a successful save
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSaveMessage({ type: "success", text: "Profile updated successfully!" });
      setEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ 
        type: "error", 
        text: error.message || "Failed to update profile. Please try again." 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/parent/login");
  };

  const handleCancel = () => {
    // Reset form to original values
    setForm({
      username: parent?.username || "",
      name: stats.child.name || "",
      phone_number: "",
      student_username: stats.child.username || "",
    });
    setEditing(false);
    setSaveMessage(null);
  };

  return (
    <div className="flex flex-col items-center justify-start h-full text-white px-4 py-6 animate-page-fade-in">
      {/* Profile Header */}
      <div className="mb-6 flex flex-col items-center">
        <div className="relative w-[120px] h-[120px] lg:w-[160px] lg:h-[160px] rounded-full p-[4px] bg-gradient-to-br from-purple-500 to-pink-500 shadow-glow-purple transition-all duration-300 hover:shadow-glow-pink">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <User size={60} className="text-white/80" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex flex-col items-center w-full max-w-md shadow-xl mb-4 transition-all duration-300"
        style={{
          border: editing ? "2px solid transparent" : "2px solid rgba(255, 255, 255, 0.2)",
          backgroundImage: editing
            ? "linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), linear-gradient(135deg, #a855f7, #ec4899)"
            : "none",
          backgroundOrigin: "border-box",
          backgroundClip: editing ? "padding-box, border-box" : "padding-box",
        }}
      >
        <h2 className="text-2xl font-bold mb-1">Parent Profile</h2>
        <p className="text-sm text-gray-300 mb-4">Manage your account information</p>

        {/* Save Message */}
        {saveMessage && (
          <div
            className={`w-full mb-4 p-3 rounded-lg flex items-center justify-between animate-slide-up ${
              saveMessage.type === "success"
                ? "bg-green-500/20 border border-green-500/50"
                : "bg-red-500/20 border border-red-500/50"
            }`}
          >
            <span className="text-sm">{saveMessage.text}</span>
            <button
              onClick={() => setSaveMessage(null)}
              className="ml-2 hover:opacity-70 transition-opacity"
              aria-label="Close message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {!editing ? (
          <div className="space-y-4 w-full">
            {/* Username (Read-only) */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-300 text-sm mb-1">
                <User size={16} aria-hidden="true" />
                <span className="font-medium">Username</span>
              </div>
              <p className="text-white font-semibold">{form.username || "Not set"}</p>
            </div>

            {/* Name */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-300 text-sm mb-1">
                <User size={16} aria-hidden="true" />
                <span className="font-medium">Name</span>
              </div>
              <p className="text-white font-semibold">{form.name || "Not set"}</p>
            </div>

            {/* Phone Number */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-300 text-sm mb-1">
                <Phone size={16} aria-hidden="true" />
                <span className="font-medium">Phone Number</span>
              </div>
              <p className="text-white font-semibold">{form.phone_number || "Not set"}</p>
            </div>

            {/* Linked Student (Read-only) */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-300 text-sm mb-1">
                <UserCheck size={16} aria-hidden="true" />
                <span className="font-medium">Linked Student</span>
              </div>
              <p className="text-white font-semibold">{form.student_username}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 w-full animate-slide-up">
            {/* Username (Read-only in edit mode) */}
            <label className="block text-white text-sm font-medium">
              Username (cannot be changed)
              <input
                type="text"
                value={form.username}
                disabled
                className="w-full px-3 py-2 rounded-lg mt-1 bg-white/20 text-gray-300 cursor-not-allowed min-h-[48px]"
                aria-label="Username (read-only)"
              />
            </label>

            {/* Name (Editable) */}
            <label className="block text-white text-sm font-medium">
              Name *
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full px-3 py-2 rounded-lg mt-1 bg-white/90 text-gray-800 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300 min-h-[48px]"
                aria-label="Name"
                required
              />
            </label>

            {/* Phone Number (Editable) */}
            <label className="block text-white text-sm font-medium">
              Phone Number
              <input
                type="tel"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full px-3 py-2 rounded-lg mt-1 bg-white/90 text-gray-800 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300 min-h-[48px]"
                aria-label="Phone number"
              />
            </label>

            {/* Linked Student (Read-only in edit mode) */}
            <label className="block text-white text-sm font-medium">
              Linked Student (cannot be changed)
              <input
                type="text"
                value={form.student_username}
                disabled
                className="w-full px-3 py-2 rounded-lg mt-1 bg-white/20 text-gray-300 cursor-not-allowed min-h-[48px]"
                aria-label="Linked student username (read-only)"
              />
            </label>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        {!editing ? (
          <>
            <button
              onClick={() => setEditing(true)}
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:brightness-110 px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-glow-purple active:scale-95 min-h-[48px] group"
              aria-label="Edit profile"
            >
              <Edit size={20} className="transition-transform duration-300 group-hover:rotate-12" aria-hidden="true" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:brightness-110 px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 min-h-[48px] group"
              aria-label="Logout"
            >
              <LogOut size={20} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:brightness-110 px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-glow-green active:scale-95 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
              aria-label="Save changes"
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={20} className="transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:brightness-110 px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed group"
              aria-label="Cancel editing"
            >
              <X size={20} className="transition-transform duration-300 group-hover:rotate-90" aria-hidden="true" />
              <span>Cancel</span>
            </button>
          </>
        )}
      </div>

      {/* Note about backend endpoint */}
      {editing && (
        <p className="text-xs text-gray-300 mt-4 text-center max-w-md">
          Note: Profile updates are currently simulated. Backend endpoint integration pending.
        </p>
      )}
    </div>
  );
}
