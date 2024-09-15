import { exec } from "https://deno.land/x/exec/mod.ts";
import { parsePatch } from "./pkg/parser/mod.ts";
import { Player } from "./pkg/player/mod.ts";
import { Patch } from "./pkg/shared/types.ts";

const trig = (channel: number, note: number) => {
  exec(`mtrig ${channel} ${note}`);
};

const playPatch = (patch: Patch) => {
  const player = new Player(patch);

  const bpm = patch.settings.bpm;
  const noteDivision = 4;
  const intervalMs = (60 * 1000) / bpm / noteDivision;

  setInterval(() => {
    const events = player.tick();

    events.forEach((e) => {
      trig(e.channel + 1, e.note);
    });
  }, intervalMs);
};

const parseFile = async (filename: string) => {
  const source = await Deno.readTextFile(filename);

  const patchResult = parsePatch(source);

  if (!patchResult.ok) {
    throw `error parsing patch: ${patchResult.error}`;
  }

  return patchResult.value;
};

// command=play|parse
// <command> <filename>
// <filename> //default to paly

const [arg0, arg1] = Deno.args;

if (!arg0) {
  console.log("usage: <NAME TODO> <command> <filename>");
  Deno.exit(1);
}

if (arg0 === "parse") {
  if (!arg1) {
    console.log("usage: <NAME TODO> parse <filename>");
    Deno.exit(1);
  }

  const patch = await parseFile(arg1);
  console.log(JSON.stringify(patch));
  Deno.exit(0);
}

if (arg0 === "play") {
  if (!arg1) {
    console.log("usage: <NAME TODO> parse <filename>");
    Deno.exit(1);
  }

  const patch = await parseFile(arg1);
  playPatch(patch);
} else {
  const patch = await parseFile(arg0);
  playPatch(patch);
}
