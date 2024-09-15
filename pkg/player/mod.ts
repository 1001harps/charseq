import type { Patch } from "../shared/types.ts";
import { clamp } from "../shared/math.ts";

type TriggerEvent = {
  channel: number;
  note: number;
  velocity: number;
};

export class Player {
  patch: Patch;
  currentStep = 0;
  sequenceLength: number;

  constructor(patch: Patch) {
    this.patch = patch;
    // use length of longest pattern
    this.sequenceLength = Math.max(
      ...patch.patterns.map((x) => x.steps.length),
    );
  }

  tick(): TriggerEvent[] {
    const events: TriggerEvent[] = [];

    const patterns = this.patch.patterns;

    for (const p of patterns) {
      const i = this.currentStep % p.steps.length;

      const step = p.steps[i];
      if (step.type === "NOTE") {
        const note = p.settings.octave * 12 + step.note;
        const clampedNote = clamp(note, 0, 127);

        events.push({
          channel: p.channel,
          note: clampedNote,
          velocity: p.settings.volume,
        });
      }
    }

    this.currentStep++;
    if (this.currentStep >= this.sequenceLength) {
      this.currentStep = 0;
    }

    return events;
  }
}
