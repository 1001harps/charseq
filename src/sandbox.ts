import { SamplePlayerDevice } from "@9h/lib";
import { parsePatch } from "./lib/parser.ts";
import { WebPlayer } from "./lib/web-player.ts";

const patch = `
0:x---x---
1:---x--x-
2:--xx
d:------e--e----e---c--a
e:ffaecfaf
f:0--0--0-3--3--3-a--a--a-5--5--5-

**:82
// *e:-0
// *d:-0
// *f:4e

`;

const initDevices = async (context: AudioContext) => {
  const channels: SamplePlayerDevice[] = [];
  channels[0] = new SamplePlayerDevice(["samples/bd.wav"]);
  channels[1] = new SamplePlayerDevice(["samples/sd.wav"]);
  channels[2] = new SamplePlayerDevice(["samples/hh.wav"]);
  channels[13] = new SamplePlayerDevice(["samples/epiano.wav"]);
  channels[14] = new SamplePlayerDevice(["samples/marimba.wav"]);
  channels[15] = new SamplePlayerDevice(["samples/bass.wav"]);

  await Promise.all(channels.map((c) => async () => await c.init(context)));

  return channels;
};

const startButtonElement = document.querySelector("#start-button")!;
startButtonElement.addEventListener("click", async () => {
  const parsedPatch = parsePatch(patch);
  if (!parsedPatch.ok) {
    throw `error parsing patch: ${parsedPatch.error}`;
  }

  const context = new AudioContext();
  const channels = await initDevices(context);
  const player = new WebPlayer({ context, patch: parsedPatch.value });

  player.addEventListener((e) => {
    if (e.type === "note_trigger") {
      const device = channels[e.channel];
      if (!device) return;

      device.trigger(e.note, e.timestamp);
    }
  });

  player.start();
});
