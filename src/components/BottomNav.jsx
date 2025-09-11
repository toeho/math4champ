import { Home, Compass, User } from "lucide-react";

const navItems = [
  { icon: <Home size={18} />, label: "होम" },
  { icon: "👁", label: "गणित" },
  { icon: <Compass size={18} />, label: "एक्सप्लोर" },
  { icon: <User size={18} />, label: "प्रोफ़ाइल" },
];

export default function BottomNav() {
  return (
    <div className="flex justify-around items-center bg-white/10 rounded-xl py-1 mt-2 text-white text-xs">
      {navItems.map((n, i) => (
        <button
          key={i}
          className="flex flex-col items-center hover:text-orange-400"
        >
          <div>{n.icon}</div>
          <span className="mt-0.5">{n.label}</span>
        </button>
      ))}
    </div>
  );
}
