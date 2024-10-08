import { parsePatch } from "./pkg/parser/mod.ts";
import { Player } from "./pkg/player/mod.ts";
import type { Patch } from "./pkg/shared/types.ts";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { Midi } from "./bindings/midi/mod.ts";

const flags = parseArgs(Deno.args, {
  string: ["bpm"],
});

const applyBpmArg = (patchBpm: number): number => {
  if (!flags.bpm) return patchBpm;

  const bpm = parseInt(flags.bpm);
  if (isNaN(bpm)) {
    console.error(`${flags.bpm} is not a valid bpm`);
    Deno.exit(1);
  }

  return bpm;
};

const exitWithUsageError = () => {
  console.log(`usage: charseq <pattern>`);
  Deno.exit(1);
};

const trig = (midi: Midi, channel: number, note: number) => {
  midi.note_on(channel, note);
  setTimeout(() => midi.note_off(channel, note), 40);
};

const playPatch = (patch: Patch) => {
  const player = new Player(patch);

  const bpm = applyBpmArg(patch.settings.bpm);
  const noteDivision = 4;
  const intervalMs = (60 * 1000) / bpm / noteDivision;

  const midi = new Midi();

  setInterval(() => {
    const events = player.tick();

    events.forEach((e) => {
      trig(midi, e.channel, e.note);
    });
  }, intervalMs);
};

const parse = (source: string) => {
  const patchResult = parsePatch(source);

  if (!patchResult.ok) {
    console.error(`failed to parse patch: ${patchResult.error}`);
    Deno.exit(1);
  }

  return patchResult.value;
};

const parseFile = async (filename: string) => {
  const source = await Deno.readTextFile(filename);
  return parse(source);
};

const [arg0, arg1] = Deno.args;

if (!arg0) {
  exitWithUsageError();
}

if (arg0 === "parse") {
  if (!arg1) exitWithUsageError();

  const patch = await parseFile(arg1);
  console.log(JSON.stringify(patch));
} else if (arg0 === "play") {
  if (!arg1) exitWithUsageError();

  const patch = await parseFile(arg1);
  playPatch(patch);
} else {
  const patch = parse(arg0);
  playPatch(patch);
}
