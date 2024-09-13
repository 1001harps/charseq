import { EventListener } from "./events";
import { Patch } from "./patches";
import { Scheduler } from "@9h/lib";
import { CharSeqPlayer } from "./player";

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
    this.scheduler = new Scheduler(context || new AudioContext(), patch.settings.bpm);

    const player = new CharSeqPlayer(patch);

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
