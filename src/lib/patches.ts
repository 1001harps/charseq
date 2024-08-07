export const DEFAULT_OCTAVE = 5;
export const DEFAULT_VOLUME = 0xc;
export const DEFAULT_BPM = 120;

export type PatternStep =
  | {
      type: "NOTE";
      note: number;
    }
  | {
      type: "REST";
    };

export const note = (note: number): PatternStep => ({ type: "NOTE", note });
export const rest = (): PatternStep => ({ type: "REST" });

export interface ChannelSettings {
  octave: number;
  volume: number;
}

export const channelSettings = (
  octave: number = DEFAULT_OCTAVE,
  volume: number = DEFAULT_VOLUME
): ChannelSettings => ({ octave, volume });

export interface PatchSettings {
  bpm: number;
}

export const patchSettings = (bpm: number = DEFAULT_BPM): PatchSettings => ({
  bpm,
});

export interface Pattern {
  channel: number;
  settings: ChannelSettings;
  steps: PatternStep[];
}

export interface Patch {
  patterns: Pattern[];
  settings: PatchSettings;
}
