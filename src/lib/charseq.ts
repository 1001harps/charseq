import { Scheduler } from "@9h/lib";
import { clamp } from "./math";
import { parsePatch } from "./parser";
import { AsyncResult, Err, Ok } from "./types";
import { EventListener } from "./events";

interface CharSeqOptions {
  context?: AudioContext;
}

type CharSeqEvent = {
  type: "note_trigger";
  channel: number;
  note: number;
  velocity: number;
  timestamp: number;
};

export class CharSeq extends EventListener<CharSeqEvent> {
  currentStep = 0;
  context: AudioContext;

  constructor({ context }: CharSeqOptions) {
    super();

    this.context = context || new AudioContext();
  }

  async playPatch(patch: string): AsyncResult<boolean, string> {
    const parsedPatch = parsePatch(patch);
    if (!parsedPatch.ok) {
      return Err(parsedPatch.error);
    }

    const onStep = (timestamp: number) => {
      const patterns = parsedPatch.value.patterns;

      // get length of longest pattern
      const sequenceLength = Math.max(...patterns.map((x) => x.steps.length));

      for (let p of patterns) {
        const i = this.currentStep % p.steps.length;

        const step = p.steps[i];
        if (step.type === "NOTE") {
          try {
            const note = p.settings.octave * 12 + step.note;
            const clampedNote = clamp(note, 0, 127);

            this.notify({
              type: "note_trigger",
              channel: p.channel,
              note: clampedNote,
              velocity: p.settings.volume,
              timestamp,
            });

            // this.output.noteTrigger(p.channel, clampedNote, timestamp, p.settings.volume);
          } catch (error) {
            console.error(error);
          }
        }
      }

      this.currentStep++;
      if (this.currentStep >= sequenceLength) {
        this.currentStep = 0;
      }
    };

    const scheduler = new Scheduler(this.context, parsedPatch.value.settings.bpm);

    scheduler.addEventListener(onStep);
    scheduler.start();

    return Ok(true);
  }
}
