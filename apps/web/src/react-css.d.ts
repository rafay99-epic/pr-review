// CSS custom properties (`--delay`, `--i`) are valid inline styles; this lets them be passed
// without casting.
import "react";

declare module "react" {
  interface CSSProperties {
    [property: `--${string}`]: string | number;
  }
}
