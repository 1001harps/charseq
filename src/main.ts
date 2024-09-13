import { SamplePlayerDevice } from "@9h/lib";
import { CharSeq } from "./lib/index.ts";

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

const startButtonElement = document.querySelector("#start-button")!;
startButtonElement.addEventListener("click", async () => {
  const context = new AudioContext();

  const channels: SamplePlayerDevice[] = [];
  channels[0] = new SamplePlayerDevice(["samples/bd.wav"]);
  channels[1] = new SamplePlayerDevice(["samples/sd.wav"]);
  channels[2] = new SamplePlayerDevice(["samples/hh.wav"]);
  channels[13] = new SamplePlayerDevice(["samples/epiano.wav"]);
  channels[14] = new SamplePlayerDevice(["samples/marimba.wav"]);
  channels[15] = new SamplePlayerDevice(["samples/bass.wav"]);

  channels.forEach((c) => c.init(context));

  const seq = new CharSeq({ context });

  seq.addEventListener((e) => {
    console.log(e);
    if (e.type === "note_trigger") {
      const device = channels[e.channel];
      if (!device) return;

      device.trigger(e.note, e.timestamp);
    }
  });

  const result = await seq.playPatch(patch);
  if (!result.ok) {
    console.error(result.error);
  }
});
