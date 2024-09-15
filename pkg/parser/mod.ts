import type {
  ChannelSettings,
  Patch,
  PatchSettings,
  Pattern,
  PatternStep,
  Result,
} from "../shared/types.ts";
import { channelSettings, Err, Ok, patchSettings } from "../shared/types.ts";

const hexDigits = "0123456789abcdef".split("");

const parsePattern = (line: string): Result<Pattern, string> => {
  const [channelText, sequenceText] = line.includes(":")
    ? line.split(":")
    : ["0", line];

  const channel = parseInt(channelText, 16);
  if (channel.toString() === "NaN") {
    return Err(
      `parsePattern: '${channelText}' is not a valid channel, at ${line}`,
    );
  }

  const steps = sequenceText.split("").map<PatternStep>((x) => {
    if (hexDigits.includes(x)) {
      const note = parseInt(x, 16);
      return { type: "NOTE", note };
    } else if (x === "x") {
      // x is an alias for note 0
      return { type: "NOTE", note: 0 };
    }

    return { type: "REST" };
  });

  return Ok({ channel, settings: channelSettings(), steps });
};

const parsePatchSettings = (line: string): Result<PatchSettings, string> => {
  const [channelText, settingsText] = line.split(":");

  if (channelText !== "**") {
    return Err(`parsePatchSettings: invalid patch settings`);
  }

  const settings = patchSettings();

  const bpmText = settingsText.substring(0, 2);
  if (bpmText) {
    const bpm = parseInt(bpmText, 16);
    if (bpm.toString() === "NaN") {
      return Err(
        `parseChannelSettings: '${bpmText}' is not a valid setting, at ${line}, position 0`,
      );
    }

    settings.bpm = bpm;
  }

  return Ok(settings);
};

// TODO: rework as midi CCs
const parseChannelSettings = (
  line: string,
): Result<[number, ChannelSettings], string> => {
  const [channelText, settingsText] = line.split(":");

  const s = channelSettings();

  const channel = parseInt(channelText[1], 16);
  if (channel.toString() === "NaN") {
    return Err(
      `parseChannelSettings: '${channelText}' is not a valid channel, at ${line}`,
    );
  }

  const octaveText = settingsText[0];
  if (octaveText && octaveText !== "-") {
    const octave = parseInt(settingsText[0], 16);
    if (octave.toString() === "NaN") {
      return Err(
        `parseChannelSettings: '${octaveText}' is not a valid setting, at ${line}, position 0`,
      );
    }

    s.octave = octave;
  }
  const volumeText = settingsText[1];
  if (volumeText && volumeText !== "-") {
    const volume = parseInt(settingsText[1], 16);
    if (volume.toString() === "NaN") {
      return Err(
        `parseChannelSettings: '${volumeText}' is not a valid setting, at ${line}, position 1`,
      );
    }

    s.volume = volume;
  }

  return Ok([channel, s]);
};

export const parsePatch = (patchText: string): Result<Patch, string> => {
  const patch: Patch = {
    patterns: [],
    settings: patchSettings(),
  };

  const lines = patchText
    .split("\n")
    .map((x) => x.trim())
    // ignore empty string
    .filter((x) => !!x)
    // ignore commented out lines
    .filter((x) => !x.startsWith("//"));

  const parsedSettings: [number, ChannelSettings][] = [];

  for (const line of lines) {
    if (line.startsWith("**")) {
      const settingsResult = parsePatchSettings(line);

      if (settingsResult.ok) {
        patch.settings = settingsResult.value;
      } else {
        return Err(settingsResult.error);
      }

      continue;
    } else if (line.startsWith("*")) {
      const settingsResult = parseChannelSettings(line);

      if (settingsResult.ok) {
        parsedSettings.push(settingsResult.value);
      } else {
        return Err(settingsResult.error);
      }

      continue;
    }

    const patternResult = parsePattern(line);

    if (patternResult.ok) {
      patch.patterns.push(patternResult.value);
    } else {
      return Err(patternResult.error);
    }
  }

  // apply settings
  for (const [channel, settings] of parsedSettings) {
    const pattern = patch.patterns.find((x) => x.channel === channel);
    if (!pattern) continue;

    pattern.settings = settings;
  }

  return Ok(patch);
};
