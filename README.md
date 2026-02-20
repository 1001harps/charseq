text based midi sequencer

### usage:

play pattern: `charseq 1:x-xx-x`

play file: `charseq play ./patches/demo.txt`

get json for patch: `charseq parse ./patches/demo.txt`

### writing sequence files

Sequence files (called *patches*) are plain text. Each non-empty, non-comment line describes either:

- a pattern line: `<channel>:<steps>`
- per-channel settings: `*<channel>:<settings>`
- global patch settings: `**:<settings>`

Examples live in `./patches`.

#### pattern lines

`<channel>` is a single hexadecimal digit (`0`–`f`) identifying the MIDI channel. If no colon is present, the channel defaults to `0`. `<steps>` is a string of characters:

- `0`–`f`: play note `0`–`15` relative to the channel octave.
- `x`: alias for note `0`.
- `-`: rest.

Patterns can be separated by newlines or `/`. If you omit the channel after a `/`, the steps continue the previous pattern’s channel. All patterns in the patch will be advanced together; the longest pattern length determines the loop length.

#### per-channel settings

Lines starting with `*` apply settings to an existing pattern: `*<channel>:<octave><volume>`. Octave and volume are hexadecimal digits. Use `-` to leave the default unchanged (defaults are octave `5`, volume `c`).

```
*0:1a   # channel 0, octave 1, volume 0xa
*0:-8   # keep default octave, set volume to 0x8
```

The settings take effect after the corresponding pattern is parsed.

#### global patch settings

Lines starting with `**` configure the whole patch. The first two hex digits set the BPM. For example `**:79` translates to `0x79` (`121` BPM). Any unspecified field falls back to the default (`120` BPM).

#### comments and whitespace

Whitespace is ignored and lines beginning with `//` are treated as comments. This makes it easy to annotate files:

```
// two channels sharing the same rhythm
0:x-xx-x
1:5-77-5
```
