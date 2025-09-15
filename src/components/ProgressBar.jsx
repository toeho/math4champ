export default function ProgressBar({ loading }) {
  return (
    <div className="w-full h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
      <div
        className={`h-1.5 bg-green-400 rounded-full transition-all duration-300 ${
          loading ? "w-full animate-pulse" : "w-0"
        }`}
      ></div>
    </div>
  );
}
