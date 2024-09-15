import { EventListener } from "../shared/events.ts";
import { Scheduler } from "jsr:@9h/lib@0.0.12";
import type { Patch } from "../shared/types.ts";
import { Player } from "../player/mod.ts";

type WebPlayerEvent = {
  type: "note_trigger";
  channel: number;
  note: number;
  velocity: number;
  timestamp: number;
};

export class WebPlayer extends EventListener<WebPlayerEvent> {
  scheduler: Scheduler;

  constructor({ patch, context }: { patch: Patch; context: AudioContext }) {
    super();
    this.scheduler = new Scheduler(
      context || new AudioContext(),
      patch.settings.bpm,
    );

    const player = new Player(patch);

    this.scheduler.addEventListener((timestamp: number) => {
      const triggers = player.tick();
      triggers.forEach((event) => {
        this.notify({
          type: "note_trigger",
          timestamp,
          ...event,
        });
      });
    });
  }

  start() {
    this.scheduler.start();
  }

  stop() {
    this.scheduler.stop();
  }
}
