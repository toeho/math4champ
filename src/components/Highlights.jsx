const highlights = [
  "Large Touch Targets",
  "Clear Visual Hierarchy",
  "Intuitive Navigation",
  "Progress Indicators",
  "Chat Interface",
  "Hindi Language Support",
];

export default function Highlights() {
  return (
    <div className="flex flex-wrap gap-2 mt-6">
      {highlights.map((h, i) => (
        <span
          key={i}
          className="bg-white/10 text-white text-xs px-3 py-1 rounded-full"
        >
          {h}
        </span>
      ))}
    </div>
  );
}
