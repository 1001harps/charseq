import { fetchSample, Sample } from "@9h/lib";

export interface OutputOptions {
  context?: AudioContext;
}

export interface Output {
  init(options: OutputOptions): Promise<void>;
  noteTrigger(channel: number, note: number, timestamp: number, volume: number): void;
}

export class SoundBankOutput implements Output {
  context: AudioContext = new AudioContext();

  sampleFiles: string[];

  constructor(sampleFiles: string[]) {
    this.sampleFiles = sampleFiles;
  }

  sampleMap: Sample[] = [];

  async init() {
    const samples = await Promise.all(
      this.sampleFiles.map(async (x) => {
        const sample = await fetchSample(this.context, x, x);
        return {
          name: sample.name,
          sample: new Sample(this.context, sample.name, sample.buffer),
        };
      })
    );

    const sampleTable: Record<string, Sample> = samples.reduce((prev, { name, sample }) => {
      return { ...prev, [name]: sample };
    }, {});

    console.log({ sampleTable });

    this.sampleMap[0] = sampleTable["samples/bd.wav"];
    this.sampleMap[1] = sampleTable["samples/sd.wav"];
    this.sampleMap[2] = sampleTable["samples/hh.wav"];
    this.sampleMap[13] = sampleTable["samples/epiano.wav"];
    this.sampleMap[14] = sampleTable["samples/marimba.wav"];
    this.sampleMap[15] = sampleTable["samples/bass.wav"];
  }

  noteTrigger(channel: number, note: number, timestamp: number, volume: number) {
    const sample = this.sampleMap[channel] as Sample;
    console.log({ sample: this.sampleMap });
    if (!sample) return;

    const gainNode = this.context.createGain();
    gainNode.gain.value = volume / 255;
    gainNode.connect(this.context.destination);

    sample.play(gainNode, note, timestamp);
  }
}
