/**
 * @author: @dorian_baffier
 * @description: Upload Animations
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

export const UploadIllustration = () => (
  <div className="relative w-16 h-16">
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label="Upload illustration"
    >
      <title>Upload File Illustration</title>
      <circle
        cx="50"
        cy="50"
        r="45"
        className="stroke-gray-200 dark:stroke-gray-700"
        strokeWidth="2"
        strokeDasharray="4 4"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 50 50"
          to="360 50 50"
          dur="60s"
          repeatCount="indefinite"
        />
      </circle>

      <path
        d="M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z"
        className="fill-blue-100 dark:fill-blue-900/30 stroke-blue-500 dark:stroke-blue-400"
        strokeWidth="2"
      >
        <animate
          attributeName="d"
          dur="2s"
          repeatCount="indefinite"
          values="
            M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z;
            M30 38H70C75 38 75 43 75 43V68C75 73 70 73 70 73H30C25 73 25 68 25 68V43C25 38 30 38 30 38Z;
            M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z"
        />
      </path>

      <path
        d="M30 35C30 35 35 35 40 35C45 35 45 30 50 30C55 30 55 35 60 35C65 35 70 35 70 35"
        className="stroke-blue-500 dark:stroke-blue-400"
        strokeWidth="2"
        fill="none"
      />

      <g className="transform translate-y-2">
        <line
          x1="50"
          y1="45"
          x2="50"
          y2="60"
          className="stroke-blue-500 dark:stroke-blue-400"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <animate
            attributeName="y2"
            values="60;55;60"
            dur="2s"
            repeatCount="indefinite"
          />
        </line>
        <polyline
          points="42,52 50,45 58,52"
          className="stroke-blue-500 dark:stroke-blue-400"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <animate
            attributeName="points"
            values="42,52 50,45 58,52;42,47 50,40 58,47;42,52 50,45 58,52"
            dur="2s"
            repeatCount="indefinite"
          />
        </polyline>
      </g>
    </svg>
  </div>
);

export const UploadingAnimation = ({ progress }: { progress: number }) => (
  <div className="relative w-16 h-16">
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label={`Upload progress: ${Math.round(progress)}%`}
    >
      <title>Upload Progress Indicator</title>

      <defs>
        <mask id="progress-mask">
          <rect width="240" height="240" fill="black" />
          <circle
            r="120"
            cx="120"
            cy="120"
            fill="white"
            strokeDasharray={`${(progress / 100) * 754}, 754`}
            transform="rotate(-90 120 120)"
          />
        </mask>
      </defs>

      <style>
        {`
          @keyframes rotate-cw {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes rotate-ccw {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          .g-spin circle {
            transform-origin: 120px 120px;
          }
          .g-spin circle:nth-child(1) { animation: rotate-cw 8s linear infinite; }
          .g-spin circle:nth-child(2) { animation: rotate-ccw 8s linear infinite; }
          .g-spin circle:nth-child(3) { animation: rotate-cw 8s linear infinite; }
          .g-spin circle:nth-child(4) { animation: rotate-ccw 8s linear infinite; }
          .g-spin circle:nth-child(5) { animation: rotate-cw 8s linear infinite; }
          .g-spin circle:nth-child(6) { animation: rotate-ccw 8s linear infinite; }
          .g-spin circle:nth-child(7) { animation: rotate-cw 8s linear infinite; }
          .g-spin circle:nth-child(8) { animation: rotate-ccw 8s linear infinite; }
          .g-spin circle:nth-child(9) { animation: rotate-cw 8s linear infinite; }
          .g-spin circle:nth-child(10) { animation: rotate-ccw 8s linear infinite; }
          .g-spin circle:nth-child(11) { animation: rotate-cw 8s linear infinite; }
          .g-spin circle:nth-child(12) { animation: rotate-ccw 8s linear infinite; }
          .g-spin circle:nth-child(13) { animation: rotate-cw 8s linear infinite; }
          .g-spin circle:nth-child(14) { animation: rotate-ccw 8s linear infinite; }

          .g-spin circle:nth-child(2n) { animation-delay: 0.2s; }
          .g-spin circle:nth-child(3n) { animation-delay: 0.3s; }
          .g-spin circle:nth-child(5n) { animation-delay: 0.5s; }
          .g-spin circle:nth-child(7n) { animation-delay: 0.7s; }
        `}
      </style>

      <g
        className="g-spin"
        strokeWidth="10"
        strokeDasharray="18% 40%"
        mask="url(#progress-mask)"
      >
        <circle r="150" cx="120" cy="120" stroke="#FF2E7E" opacity="0.95" />
        <circle r="140" cx="120" cy="120" stroke="#FFD600" opacity="0.95" />
        <circle r="130" cx="120" cy="120" stroke="#00E5FF" opacity="0.95" />
        <circle r="120" cx="120" cy="120" stroke="#FF3D71" opacity="0.95" />
        <circle r="110" cx="120" cy="120" stroke="#4ADE80" opacity="0.95" />
        <circle r="100" cx="120" cy="120" stroke="#2196F3" opacity="0.95" />
        <circle r="90" cx="120" cy="120" stroke="#FFA726" opacity="0.95" />
        <circle r="80" cx="120" cy="120" stroke="#FF1493" opacity="0.95" />
        <circle r="70" cx="120" cy="120" stroke="#FFEB3B" opacity="0.95" />
        <circle r="60" cx="120" cy="120" stroke="#00BCD4" opacity="0.95" />
        <circle r="50" cx="120" cy="120" stroke="#FF4081" opacity="0.95" />
        <circle r="40" cx="120" cy="120" stroke="#76FF03" opacity="0.95" />
        <circle r="30" cx="120" cy="120" stroke="#448AFF" opacity="0.95" />
        <circle r="20" cx="120" cy="120" stroke="#FF3D00" opacity="0.95" />
      </g>
    </svg>
  </div>
);
