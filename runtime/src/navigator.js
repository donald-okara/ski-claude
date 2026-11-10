// Pure slide/step navigation. `pos` is { slide, step }, both counted from 0.
// `stepCounts[i]` is the number of reveal steps on slide i. Every function
// returns a new object and never mutates its input.

export function next(pos, stepCounts) {
  const { slide, step } = pos;
  if (step < (stepCounts[slide] ?? 0)) {
    return { slide, step: step + 1 };
  }
  if (slide < stepCounts.length - 1) {
    return { slide: slide + 1, step: 0 };
  }
  return { slide, step };
}

export function previous(pos, stepCounts) {
  const { slide, step } = pos;
  if (step > 0) {
    return { slide, step: step - 1 };
  }
  if (slide > 0) {
    const prev = slide - 1;
    return { slide: prev, step: stepCounts[prev] ?? 0 };
  }
  return { slide, step };
}

export function goTo(index, stepCounts) {
  if (stepCounts.length === 0 || !Number.isInteger(index)) {
    return null;
  }
  const slide = Math.min(Math.max(index, 0), stepCounts.length - 1);
  return { slide, step: 0 };
}
