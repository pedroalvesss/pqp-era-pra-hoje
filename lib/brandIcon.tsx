import { ImageResponse } from "next/og";

// hex porque o renderizador de ImageResponse não entende oklch
export const BRAND_HEX = { bg: "#181210", paper: "#fdf3ef", accent: "#f57050" };

/** Marca 1b em PNG. `padded` deixa margem pra ícone maskable do Android. */
export function brandIcon(size: number, padded = false) {
  const s = padded ? size * 0.8 : size;
  const u = s / 32;
  return new ImageResponse(
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: padded ? BRAND_HEX.bg : "transparent",
      }}
    >
      <div
        style={{
          width: s,
          height: s,
          borderRadius: padded ? 0 : 8 * u,
          background: BRAND_HEX.paper,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 10 * u,
            background: BRAND_HEX.accent,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: `0 ${8.6 * u}px`,
          }}
        >
          <div style={{ width: 2.8 * u, height: 2.8 * u, borderRadius: 99, background: BRAND_HEX.bg }} />
          <div style={{ width: 2.8 * u, height: 2.8 * u, borderRadius: 99, background: BRAND_HEX.bg }} />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: BRAND_HEX.bg,
            fontSize: 17 * u,
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          ?
        </div>
      </div>
    </div>,
    { width: size, height: size },
  );
}
