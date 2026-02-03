// utils/display.ts
// Helpers for device-pixel-ratio aware coordinate conversions.

export function toDevicePixels(coord: { x: number; y: number }, scale = 1) {
  // For DOM positioning (CSS pixels) no conversion is necessary; when integrating
  // with native canvases, multiply by scale to get device pixels.
  return { x: coord.x * scale, y: coord.y * scale };
}

export function fromDevicePixels(coord: { x: number; y: number }, scale = 1) {
  return { x: coord.x / scale, y: coord.y / scale };
}

export default { toDevicePixels, fromDevicePixels };
