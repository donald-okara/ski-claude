// Scale that fits the fixed-size slide canvas inside the viewport.

export function fitScale(viewportW, viewportH, canvasW = 1920, canvasH = 1080) {
  return Math.min(viewportW / canvasW, viewportH / canvasH);
}
