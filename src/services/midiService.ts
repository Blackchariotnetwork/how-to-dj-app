import { MIDIMappingItem } from '../types/dj';

type MIDICallback = (target: string, value: number) => void;

class DJMIDIService {
  private midiAccess: any = null;
  private isSupported = false;
  private mappings: MIDIMappingItem[] = [];
  private listeners: MIDICallback[] = [];
  private isLearning = false;
  private learningTarget: MIDIMappingItem['target'] | null = null;
  private onLearnCallback: ((mapping: MIDIMappingItem) => void) | null = null;

  constructor() {
    this.isSupported = typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
    this.loadMappings();
  }

  private loadMappings() {
    try {
      const stored = localStorage.getItem('tokyo_dj_midi_mappings');
      if (stored) {
        this.mappings = JSON.parse(stored);
      } else {
        // Default standard controller mappings (Pioneer DDJ / Generic MIDI)
        this.mappings = [
          { id: 'm1', target: 'crossfader', midiType: 'cc', channel: 1, controlNumber: 8 },
          { id: 'm2', target: 'deckA_play', midiType: 'note', channel: 1, controlNumber: 11 },
          { id: 'm3', target: 'deckA_cue', midiType: 'note', channel: 1, controlNumber: 12 },
          { id: 'm4', target: 'deckA_pitch', midiType: 'cc', channel: 1, controlNumber: 0 },
          { id: 'm5', target: 'deckA_low', midiType: 'cc', channel: 1, controlNumber: 4 },
          { id: 'm6', target: 'deckA_filter', midiType: 'cc', channel: 1, controlNumber: 26 },
          { id: 'm7', target: 'deckB_play', midiType: 'note', channel: 2, controlNumber: 11 },
          { id: 'm8', target: 'deckB_cue', midiType: 'note', channel: 2, controlNumber: 12 },
          { id: 'm9', target: 'deckB_pitch', midiType: 'cc', channel: 2, controlNumber: 0 },
          { id: 'm10', target: 'deckB_low', midiType: 'cc', channel: 2, controlNumber: 4 },
          { id: 'm11', target: 'deckB_filter', midiType: 'cc', channel: 2, controlNumber: 26 },
        ];
      }
    } catch {
      // Storage error
    }
  }

  public saveMappings(mappings: MIDIMappingItem[]) {
    this.mappings = mappings;
    try {
      localStorage.setItem('tokyo_dj_midi_mappings', JSON.stringify(mappings));
    } catch {
      // Storage error
    }
  }

  public getMappings(): MIDIMappingItem[] {
    return [...this.mappings];
  }

  public async connect(): Promise<{ supported: boolean; devices: string[] }> {
    if (!this.isSupported) {
      return { supported: false, devices: [] };
    }

    try {
      const nav = navigator as any;
      const access = await nav.requestMIDIAccess({ sysex: false });
      this.midiAccess = access;
      const deviceNames: string[] = [];

      access.inputs.forEach((input: any) => {
        deviceNames.push(input.name || 'Unnamed MIDI Device');
        input.onmidimessage = (e: any) => this.handleMIDIMessage(e);
      });

      access.onstatechange = () => {
        if (this.midiAccess) {
          this.midiAccess.inputs.forEach((input: any) => {
            input.onmidimessage = (e: any) => this.handleMIDIMessage(e);
          });
        }
      };

      return { supported: true, devices: deviceNames };
    } catch (err) {
      console.warn('MIDI connection error:', err);
      return { supported: false, devices: [] };
    }
  }

  private handleMIDIMessage(event: any) {
    const data = event.data;
    if (!data || data.length < 3) return;

    const status = data[0];
    const channel = (status & 0x0f) + 1;
    const command = status >> 4;
    const controlOrNote = data[1];
    const value = data[2];

    const isCC = command === 0xb; // 11 in hex is CC
    const isNoteOn = command === 0x9 && value > 0; // Note on with velocity

    // MIDI Learn Mode
    if (this.isLearning && this.learningTarget) {
      const newMapping: MIDIMappingItem = {
        id: `map-${Date.now()}`,
        target: this.learningTarget,
        midiType: isCC ? 'cc' : 'note',
        channel,
        controlNumber: controlOrNote,
      };

      // Replace existing mapping for this target
      this.mappings = this.mappings.filter((m) => m.target !== this.learningTarget);
      this.mappings.push(newMapping);
      this.saveMappings(this.mappings);

      if (this.onLearnCallback) {
        this.onLearnCallback(newMapping);
      }
      this.isLearning = false;
      this.learningTarget = null;
      return;
    }

    // Match with mappings
    const matched = this.mappings.find((m) => {
      if (m.channel !== channel) return false;
      if (m.controlNumber !== controlOrNote) return false;
      if (m.midiType === 'cc' && !isCC) return false;
      if (m.midiType === 'note' && !isNoteOn) return false;
      return true;
    });

    if (matched) {
      const normalizedValue = isCC ? value / 127 : 1;
      this.notifyListeners(matched.target, normalizedValue);
    }
  }

  public startLearning(target: MIDIMappingItem['target'], onMapped: (mapping: MIDIMappingItem) => void) {
    this.isLearning = true;
    this.learningTarget = target;
    this.onLearnCallback = onMapped;
  }

  public cancelLearning() {
    this.isLearning = false;
    this.learningTarget = null;
    this.onLearnCallback = null;
  }

  public addListener(callback: MIDICallback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(target: string, value: number) {
    this.listeners.forEach((cb) => cb(target, value));
  }
}

export const midiService = new DJMIDIService();
