import { parsePatch } from "./parser";
import { Patch, channelSettings, rest, note, patchSettings } from "./patches";

describe("parser", () => {
  describe("patterns", () => {
    test("parses empty patch", () => {
      const patch = "";
      const parsedPatch = parsePatch(patch);
      if (!parsedPatch.ok) {
        throw `error parsing patch: ${parsedPatch.error}`;
      }

      const expectedPatch: Patch = {
        patterns: [],
        settings: patchSettings(),
      };

      expect(parsedPatch.value).toMatchObject(expectedPatch);
    });

    test("parses commented out line", () => {
      const patch = "// 0:-";
      const parsedPatch = parsePatch(patch);
      if (!parsedPatch.ok) {
        throw `error parsing patch: ${parsedPatch.error}`;
      }

      const expectedPatch: Patch = {
        patterns: [],
        settings: patchSettings(),
      };

      expect(parsedPatch.value).toMatchObject(expectedPatch);
    });

    test("parses rest step", () => {
      const patch = "0:-";
      const parsedPatch = parsePatch(patch);
      if (!parsedPatch.ok) {
        throw `error parsing patch: ${parsedPatch.error}`;
      }

      const expectedPatch: Patch = {
        patterns: [
          {
            channel: 0,
            settings: channelSettings(),
            steps: [rest()],
          },
        ],
        settings: patchSettings(),
      };

      expect(parsedPatch.value).toMatchObject(expectedPatch);
    });

    test("parses note step", () => {
      const patch = "0:8";
      const parsedPatch = parsePatch(patch);
      if (!parsedPatch.ok) {
        throw `error parsing patch: ${parsedPatch.error}`;
      }

      const expectedPatch: Patch = {
        patterns: [{ channel: 0, settings: channelSettings(), steps: [note(8)] }],
        settings: patchSettings(),
      };

      expect(parsedPatch.value).toMatchObject(expectedPatch);
    });

    test("parses 'x' step as note 0", () => {
      const patch = "0:x";
      const parsedPatch = parsePatch(patch);
      if (!parsedPatch.ok) {
        throw `error parsing patch: ${parsedPatch.error}`;
      }

      const expectedPatch: Patch = {
        patterns: [{ channel: 0, settings: channelSettings(), steps: [note(0)] }],
        settings: patchSettings(),
      };

      expect(parsedPatch.value).toMatchObject(expectedPatch);
    });

    test("parses multi step patch", () => {
      const patch = "5:1--2-3---4-";
      const parsedPatch = parsePatch(patch);
      if (!parsedPatch.ok) {
        throw `error parsing patch: ${parsedPatch.error}`;
      }

      const expectedSteps = [
        note(1),
        rest(),
        rest(),
        note(2),
        rest(),
        note(3),
        rest(),
        rest(),
        rest(),
        note(4),
        rest(),
      ];

      const expectedPatch: Patch = {
        patterns: [{ channel: 5, settings: channelSettings(), steps: expectedSteps }],
        settings: patchSettings(),
      };

      expect(parsedPatch.value).toMatchObject(expectedPatch);
    });

    test("parses multi channel multi step patch", () => {
      const patch = `
      0:1-2-3
      1:2-3-4
      2:4-5-6
      `;

      const parsedPatch = parsePatch(patch);
      if (!parsedPatch.ok) {
        throw `error parsing patch: ${parsedPatch.error}`;
      }

      const expectedPatch: Patch = {
        patterns: [
          {
            channel: 0,
            settings: channelSettings(),
            steps: [note(1), rest(), note(2), rest(), note(3)],
          },
          {
            channel: 1,
            settings: channelSettings(),
            steps: [note(2), rest(), note(3), rest(), note(4)],
          },
          {
            channel: 2,
            settings: channelSettings(),
            steps: [note(4), rest(), note(5), rest(), note(6)],
          },
        ],
        settings: patchSettings(),
      };

      expect(parsedPatch.value).toMatchObject(expectedPatch);
    });

    test("returns error for invalid channel", () => {
      const patch = "g:-";
      const parsedPatch = parsePatch(patch);
      expect(parsedPatch.ok).toBe(false);
      if (!parsedPatch.ok) {
        expect(parsedPatch.error).toContain("not a valid channel");
      }
    });
  });

  describe("settings", () => {
    test("parses patch settings", () => {
      const patch = `
      **:79
      `;
      const parsedPatch = parsePatch(patch);
      if (!parsedPatch.ok) {
        throw `error parsing patch: ${parsedPatch.error}`;
      }

      const expectedPatch: Patch = {
        patterns: [],
        settings: { bpm: 121 },
      };

      expect(parsedPatch.value).toMatchObject(expectedPatch);
    });

    test("parses channel settings", () => {
      const patch = `
      *0:1a
      0:
      `;
      const parsedPatch = parsePatch(patch);
      if (!parsedPatch.ok) {
        throw `error parsing patch: ${parsedPatch.error}`;
      }

      const expectedPatch: Patch = {
        patterns: [{ channel: 0, settings: channelSettings(1, 0xa), steps: [] }],
        settings: patchSettings(),
      };

      expect(parsedPatch.value).toMatchObject(expectedPatch);
    });

    test("returns default channel setting if skipped", () => {
      const patch = `
      *0:-a
      0:
      `;

      const parsedPatch = parsePatch(patch);
      if (!parsedPatch.ok) {
        throw `error parsing patch: ${parsedPatch.error}`;
      }

      const expectedPatch: Patch = {
        patterns: [{ channel: 0, settings: channelSettings(5, 0xa), steps: [] }],
        settings: patchSettings(),
      };

      expect(parsedPatch.value).toMatchObject(expectedPatch);
    });

    test("returns error for invalid channel setting", () => {
      const patch = `
      *0:z
      0:
      `;
      const parsedPatch = parsePatch(patch);
      expect(parsedPatch.ok).toBe(false);
      if (!parsedPatch.ok) {
        expect(parsedPatch.error).toContain("not a valid setting");
      }
    });
  });
});
