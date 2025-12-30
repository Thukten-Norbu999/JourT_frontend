export default function LogoJourT({ width = 160, className = "" }) {
  return (
    <svg
      width={width}
      height={(width * 120) / 400}
      viewBox="0 0 400 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g transform="translate(20, 20)">
        <path d="M45 10 V60" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" />

        <path
          d="M45 60 C45 85 25 85 15 75"
          stroke="#F59E0B"
          strokeWidth="8"
          strokeLinecap="round"
        />

        <path
          d="M45 10 L65 10 L65 30"
          stroke="#F59E0B"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M45 10 L65 30"
          stroke="#F59E0B"
          strokeWidth="8"
          strokeLinecap="round"
        />

        <rect x="25" y="55" width="6" height="10" rx="2" fill="#3B82F6" />
        <rect x="35" y="45" width="6" height="20" rx="2" fill="#3B82F6" />
      </g>

      <g transform="translate(110, 82)">
        <text
          x="0"
          y="0"
          fontFamily="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
          fontWeight="700"
          fontSize="64"
          fill="#F3F4F6"
        >
          Jour
        </text>

        <text
          x="142"
          y="0"
          fontFamily="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
          fontWeight="700"
          fontSize="64"
          fill="#F59E0B"
        >
          T
        </text>
      </g>
    </svg>
  );
}
