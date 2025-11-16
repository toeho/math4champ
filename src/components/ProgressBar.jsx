export default function ProgressBar({ loading }) {
  return (
    <div 
      className={`w-full h-[2px] md:h-[3px] bg-white/20 rounded-full mt-2 overflow-hidden transition-opacity duration-300 ${
        loading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className={`h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-300 ${
          loading ? 'w-full animate-shimmer' : 'w-0'
        }`}
        style={{
          backgroundSize: '200% 100%',
          boxShadow: loading ? '0 0 15px rgba(34, 197, 94, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)' : 'none',
          animation: loading ? 'shimmer 2s infinite linear, pulse-glow 2s ease-in-out infinite' : 'none',
        }}
      />
    </div>
  );
}
