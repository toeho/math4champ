import { Mic } from "lucide-react";

export default function ChatSection() {
  return (
    <div className="bg-white/10 rounded-2xl p-4 mt-6 shadow-md text-white">
      <h2 className="text-base font-semibold mb-3">गणित शिक्षक</h2>
      <div className="space-y-3">
        <div className="bg-white/20 rounded-xl px-3 py-2 text-sm w-fit">
          नमस्ते! मैं आपके गणित के सवालों की मदद कर सकता हूँ।
        </div>
        <div className="bg-green-500 rounded-xl px-3 py-2 text-sm w-fit ml-auto">
          2 + 3 कितना होता है?
        </div>
        <div className="bg-white/20 rounded-xl px-3 py-2 text-sm w-fit">
          2 + 3 = 5 होता है। आप और कुछ पूछना चाहते हैं?
        </div>
      </div>
      <div className="flex items-center mt-3 bg-white/20 rounded-xl px-3 py-2">
        <input
          type="text"
          placeholder="अपना सवाल पूछें..."
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/70"
        />
        <Mic className="text-white ml-2" size={20} />
      </div>
    </div>
  );
}
