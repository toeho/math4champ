import { Home, Compass, User } from "lucide-react";

const navItems = [
  { icon: <Home size={22} />, label: "होम" },
  { icon: "👁", label: "गणित" },
  { icon: <Compass size={22} />, label: "एक्सप्लोर" },
  { icon: <User size={22} />, label: "प्रोफ़ाइल" },
];

export default function BottomNav() {
  return (
    <div className="flex justify-around items-center bg-white/10 rounded-2xl py-2 mt-6 text-white">
      {navItems.map((n, i) => (
        <button
          key={i}
          className="flex flex-col items-center text-xs hover:text-orange-400"
        >
          <div>{n.icon}</div>
          <span>{n.label}</span>
        </button>
      ))}
    </div>
  );
}
