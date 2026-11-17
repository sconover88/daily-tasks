import { ImageResponse } from "next/og";

/** The app icon: a white check on the near-black action colour. Used for every icon size. */
export function renderIcon(size: number, { rounded = false }: { rounded?: boolean } = {}) {
  const stroke = Math.round(size * 0.09);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2563eb",
          borderRadius: rounded ? size * 0.22 : 0,
        }}
      >
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="#fcfcfd"
            strokeWidth={(stroke / (size * 0.5)) * 24}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
