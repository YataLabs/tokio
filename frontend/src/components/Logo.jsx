export default function Logo({ size = 40, showText = true, className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="midGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        {/* Rounded square background */}
        <rect width="64" height="64" rx="16" fill="url(#midGradient)" />
        {/* Stylized 'M' mark - left leg */}
        <path
          d="M14 48V18L24 28L32 18L40 28L50 18V48"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Small accent diamond */}
        <rect x="29" y="38" width="6" height="6" rx="1" fill="#22d3ee" />
      </svg>
      {showText && (
        <span className="text-2xl font-bold text-tokio-text tracking-tight">
          To<span className="text-tokio-blue-light">kio</span>
        </span>
      )}
    </div>
  );
}
