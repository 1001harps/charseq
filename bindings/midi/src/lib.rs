use deno_bindgen::deno_bindgen;
extern crate portmidi as pm;

#[deno_bindgen]
pub struct Midi {
    context: pm::PortMidi,
}

#[deno_bindgen]
impl Midi {
    #[constructor]
    pub fn new() -> Midi {
        let context = pm::PortMidi::new().unwrap();

        Midi { context }
    }

    pub fn note_on(&self, channel: u8, note: u8) {
        let id = self.context.default_output_device_id().unwrap();

        let mut out_port = self
            .context
            .device(id)
            .and_then(|dev| self.context.output_port(dev, 1024))
            .unwrap();

        let note_on = pm::MidiMessage {
            status: 0x90 + channel,
            data1: note,
            data2: 100,
            data3: 0,
        };

        let _ = out_port.write_message(note_on);
    }

    pub fn note_off(&self, channel: u8, note: u8) {
        let id = self.context.default_output_device_id().unwrap();

        let mut out_port = self
            .context
            .device(id)
            .and_then(|dev| self.context.output_port(dev, 1024))
            .unwrap();

        let note_off = pm::MidiMessage {
            status: 0x80 + channel,
            data1: note,
            data2: 100,
            data3: 0,
        };

        let _ = out_port.write_message(note_off);
    }
}
