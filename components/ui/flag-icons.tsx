import React from 'react';

interface FlagIconProps {
  locale: string;
  className?: string;
}

export function FlagIcon({ locale, className = "w-4 h-3" }: FlagIconProps) {
  switch (locale) {
    case 'en':
      return (
        <svg
          className={className}
          viewBox="0 0 640 480"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="us-flag-clip">
              <path d="M0 0h640v480H0z" />
            </clipPath>
          </defs>
          <g clipPath="url(#us-flag-clip)">
            <path fill="#bd3d44" d="M0 0h640v480H0" />
            <path
              stroke="#fff"
              strokeWidth="37"
              d="M0 55.3h640M0 129h640M0 203h640M0 277h640M0 351h640M0 425h640"
            />
            <path fill="#192f5d" d="M0 0h364.8v258.5H0" />
            <g fill="#fff">
              <g id="us-star">
                <path d="m30.4 11 2.3 7.1h7.5l-6.1 4.4 2.3 7.1-6.1-4.4-6.1 4.4 2.3-7.1-6.1-4.4h7.5z" />
              </g>
              <use xlinkHref="#us-star" transform="translate(60.8 0)" />
              <use xlinkHref="#us-star" transform="translate(121.6 0)" />
              <use xlinkHref="#us-star" transform="translate(182.4 0)" />
              <use xlinkHref="#us-star" transform="translate(243.2 0)" />
              <use xlinkHref="#us-star" transform="translate(304 0)" />
              <use xlinkHref="#us-star" transform="translate(30.4 25.9)" />
              <use xlinkHref="#us-star" transform="translate(91.2 25.9)" />
              <use xlinkHref="#us-star" transform="translate(152 25.9)" />
              <use xlinkHref="#us-star" transform="translate(212.8 25.9)" />
              <use xlinkHref="#us-star" transform="translate(273.6 25.9)" />
              <use xlinkHref="#us-star" transform="translate(0 51.8)" />
              <use xlinkHref="#us-star" transform="translate(60.8 51.8)" />
              <use xlinkHref="#us-star" transform="translate(121.6 51.8)" />
              <use xlinkHref="#us-star" transform="translate(182.4 51.8)" />
              <use xlinkHref="#us-star" transform="translate(243.2 51.8)" />
              <use xlinkHref="#us-star" transform="translate(304 51.8)" />
              <use xlinkHref="#us-star" transform="translate(30.4 77.7)" />
              <use xlinkHref="#us-star" transform="translate(91.2 77.7)" />
              <use xlinkHref="#us-star" transform="translate(152 77.7)" />
              <use xlinkHref="#us-star" transform="translate(212.8 77.7)" />
              <use xlinkHref="#us-star" transform="translate(273.6 77.7)" />
            </g>
          </g>
        </svg>
      );
    case 'vi':
      return (
        <svg
          className={className}
          viewBox="0 0 640 480"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="vn-flag-clip">
              <path d="M0 0h640v480H0z" />
            </clipPath>
          </defs>
          <g clipPath="url(#vn-flag-clip)">
            <path fill="#da251d" d="M0 0h640v480H0z" />
            <g fill="#ff0" transform="translate(320 240) scale(160)">
              <g id="vn-star">
                <path d="M0-.3L-.2-.1H-.3L-.1 0-.3.1H-.2L0 .3.2.1H.3L.1 0 .3-.1H.2z" />
              </g>
            </g>
          </g>
        </svg>
      );
    default:
      // Fallback to a generic globe icon
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
  }
} 