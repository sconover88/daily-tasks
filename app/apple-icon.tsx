import { renderIcon } from "@/lib/icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS rounds the corners itself, so the square is left square.
export default function AppleIcon() {
  return renderIcon(180);
}
