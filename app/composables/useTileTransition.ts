export type TransitionPhase = "idle" | "covering" | "covered" | "uncovering";

export type PatternName =
  | "diamond"
  | "horizontal-wipe"
  | "vertical-wipe"
  | "radial"
  | "random";

/* ──────────────────────────────────────────────
   Pattern generators
   Each returns a flat number[] of brightness values (0-255),
   one per tile in row-major order.
   Darker (0) = animates first, lighter (255) = animates last.
   ────────────────────────────────────────────── */

function diamondPattern(cols: number, rows: number): number[] {
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;
  const maxDist = cx + cy;
  const values: number[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const dist = Math.abs(c - cx) + Math.abs(r - cy);
      values.push(Math.round((dist / maxDist) * 255));
    }
  }
  return values;
}

function horizontalWipePattern(cols: number, rows: number): number[] {
  const values: number[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      values.push(Math.round((c / (cols - 1)) * 255));
    }
  }
  return values;
}

function verticalWipePattern(cols: number, rows: number): number[] {
  const values: number[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      values.push(Math.round((r / (rows - 1)) * 255));
    }
  }
  return values;
}

function radialPattern(cols: number, rows: number): number[] {
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);
  const values: number[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const dx = c - cx;
      const dy = r - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      values.push(Math.round((dist / maxDist) * 255));
    }
  }
  return values;
}

function randomPattern(cols: number, rows: number): number[] {
  const values: number[] = [];
  for (let i = 0; i < cols * rows; i++) {
    values.push(Math.round(Math.random() * 255));
  }
  return values;
}

const patternGenerators: Record<
  PatternName,
  (cols: number, rows: number) => number[]
> = {
  diamond: diamondPattern,
  "horizontal-wipe": horizontalWipePattern,
  "vertical-wipe": verticalWipePattern,
  radial: radialPattern,
  random: randomPattern,
};

/* ──────────────────────────────────────────────
   Composable
   ────────────────────────────────────────────── */

export interface TileTransitionOptions {
  cols?: number;
  rows?: number;
  pattern?: PatternName;
  duration?: number;
  spread?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useTileTransition(options: TileTransitionOptions = {}) {
  const cols = computed(() => options.cols ?? 20);
  const rows = computed(() => options.rows ?? 12);
  const pattern = computed(() => options.pattern ?? "diamond");
  const duration = computed(() => options.duration ?? 800);
  const spread = computed(() => options.spread ?? 0.6);

  const phase = ref<TransitionPhase>("idle");
  const coverDelays = ref<number[]>([]);
  const uncoverDelays = ref<number[]>([]);
  const tileDuration = computed(() => duration.value * (1 - spread.value));

  const prefersReducedMotion = computed(() => {
    if (!import.meta.client) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  function computeDelays() {
    const generate = patternGenerators[pattern.value];
    const brightness = generate(cols.value, rows.value);
    const maxDelay = duration.value * spread.value;

    coverDelays.value = brightness.map((b) => (b / 255) * maxDelay);
    uncoverDelays.value = brightness.map((b) => ((255 - b) / 255) * maxDelay);
  }

  // Recompute when params change
  watch([cols, rows, pattern, duration, spread], computeDelays, {
    immediate: true,
  });

  async function transition(swapContent: () => void): Promise<void> {
    if (phase.value !== "idle") return;

    if (prefersReducedMotion.value) {
      swapContent();
      return;
    }

    // Cover
    phase.value = "covering";
    await sleep(duration.value);

    // Swap content while fully covered
    phase.value = "covered";
    swapContent();
    await nextTick();

    // Uncover
    phase.value = "uncovering";
    await sleep(duration.value);

    phase.value = "idle";
  }

  return {
    phase: readonly(phase),
    coverDelays: readonly(coverDelays),
    uncoverDelays: readonly(uncoverDelays),
    tileDuration,
    cols,
    rows,
    transition,
  };
}
