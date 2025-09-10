const features = [
  { label: "संख्याएँ", icon: "123" },
  { label: "जोड़", icon: "+" },
  { label: "घटाव", icon: "−" },
  { label: "आकार", icon: "⬤" },
];

export default function FeatureGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      {features.map((f, i) => (
        <button
          key={i}
          className="bg-white/10 rounded-2xl flex flex-col items-center justify-center p-6 shadow-md text-white text-lg font-semibold hover:bg-white/20 transition"
        >
          <div className="text-2xl mb-2">{f.icon}</div>
          {f.label}
        </button>
      ))}
    </div>
  );
}
