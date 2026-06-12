/**
 * Procedural Audio Engine for Project Panipat 1761
 * Generates period-appropriate atmospheric soundtracks using the Web Audio API without requiring bulky external media assets.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private rhythmGain: GainNode | null = null;
  private pluckGain: GainNode | null = null;
  
  private currentScene: 'campaign' | 'battle' | 'menu' = 'menu';
  private campaignTrack: 'yaman_darbar' | 'deccan_march' | 'silence' = 'yaman_darbar';
  private battleTrack: 'panipat_anthem' | 'gardi_drill' | 'silence' = 'panipat_anthem';
  
  private isRunning: boolean = false;
  private intervalId: any = null;
  private stepCounter: number = 0;
  
  // Audio state buffers
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    // Load persisted configurations
    this.campaignTrack = (localStorage.getItem('panipat_soundtrack_campaign') as any) || 'yaman_darbar';
    this.battleTrack = (localStorage.getItem('panipat_soundtrack_battle') as any) || 'panipat_anthem';
    
    // Auto-setup interaction handlers
    if (typeof window !== 'undefined') {
      const handleUserGesture = () => {
        this.init();
        window.removeEventListener('click', handleUserGesture);
        window.removeEventListener('keydown', handleUserGesture);
      };
      window.addEventListener('click', handleUserGesture);
      window.addEventListener('keydown', handleUserGesture);
    }
  }

  public init() {
    if (this.ctx) return;
    
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      // Master volume
      this.masterGain = this.ctx.createGain();
      const savedVolume = localStorage.getItem('panipat_master_volume');
      const volumeFloat = savedVolume !== null ? parseFloat(savedVolume) : 0.45;
      this.masterGain.gain.setValueAtTime(volumeFloat, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Sub-gains
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.droneGain.connect(this.masterGain);

      this.rhythmGain = this.ctx.createGain();
      this.rhythmGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.rhythmGain.connect(this.masterGain);

      this.pluckGain = this.ctx.createGain();
      this.pluckGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.pluckGain.connect(this.masterGain);

      // Generate noise buffer for snare instruments
      const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      this.isRunning = true;
      this.startScheduler();
      this.startContinuousDrone();
      
      console.log('🔊 Panipat Procedural Audio Engine initialized successfully!');
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  // Set top-level volume
  public setVolume(vol: number) {
    localStorage.setItem('panipat_master_volume', vol.toString());
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.1);
    }
  }

  public getVolume(): number {
    const vol = localStorage.getItem('panipat_master_volume');
    return vol !== null ? parseFloat(vol) : 0.45;
  }

  // Change tracks
  public setCampaignTrack(track: 'yaman_darbar' | 'deccan_march' | 'silence') {
    this.campaignTrack = track;
    localStorage.setItem('panipat_soundtrack_campaign', track);
    this.updateTracksState();
  }

  public getCampaignTrack() {
    return this.campaignTrack;
  }

  public setBattleTrack(track: 'panipat_anthem' | 'gardi_drill' | 'silence') {
    this.battleTrack = track;
    localStorage.setItem('panipat_soundtrack_battle', track);
    this.updateTracksState();
  }

  public getBattleTrack() {
    return this.battleTrack;
  }

  // Inform which scene player is entering
  public setScene(scene: 'campaign' | 'battle' | 'menu') {
    this.currentScene = scene;
    this.init(); // ensure active context
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.updateTracksState();
  }

  public getScene() {
    return this.currentScene;
  }

  private updateTracksState() {
    if (!this.ctx || !this.droneGain || !this.rhythmGain) return;
    
    const now = this.ctx.currentTime;
    const currentTrack = this.currentScene === 'battle' ? this.battleTrack : this.campaignTrack;

    if (currentTrack === 'silence') {
      this.droneGain.gain.linearRampToValueAtTime(0.0, now + 1.2);
      this.rhythmGain.gain.linearRampToValueAtTime(0.0, now + 1.2);
    } else if (currentTrack === 'yaman_darbar') {
      // Soft ambient drones and plucks
      this.droneGain.gain.linearRampToValueAtTime(0.35, now + 1.5);
      this.rhythmGain.gain.linearRampToValueAtTime(0.0, now + 1.0); // No drums in Darbar
    } else if (currentTrack === 'deccan_march') {
      // Low rhythmic drones + marching drums
      this.droneGain.gain.linearRampToValueAtTime(0.20, now + 2.0);
      this.rhythmGain.gain.linearRampToValueAtTime(0.40, now + 1.5);
    } else if (currentTrack === 'panipat_anthem') {
      // Intensely heavy war drums + horns
      this.droneGain.gain.linearRampToValueAtTime(0.25, now + 1.0);
      this.rhythmGain.gain.linearRampToValueAtTime(0.70, now + 1.0);
    } else if (currentTrack === 'gardi_drill') {
      // Snare drills + steady marches
      this.droneGain.gain.linearRampToValueAtTime(0.15, now + 1.5);
      this.rhythmGain.gain.linearRampToValueAtTime(0.65, now + 1.0);
    }
  }

  /**
   * Generates a persistent Tanpura/Indian classic drone in the background.
   */
  private startContinuousDrone() {
    if (!this.ctx || !this.droneGain) return;

    // We build 3 oscillators for a wealthy classical microtonal chord.
    // Yaman Raga central pitches: Sa (C2 = ~65.4Hz), Pa (G2 = ~98.0Hz), and Ma# (F#2 = ~92.5Hz)
    const pitches = [65.4, 98.0, 92.5]; 
    
    pitches.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const pGain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      // Slow warm triangle waves
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
      
      // Detune slightly for high warmth
      osc.detune.setValueAtTime((idx - 1) * 7, this.ctx!.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx!.currentTime);

      // Low volume modulation (LFO-like sweep) to give organic feel
      pGain.gain.setValueAtTime(0.05, this.ctx!.currentTime);
      
      osc.connect(filter);
      filter.connect(pGain);
      pGain.connect(this.droneGain!);

      osc.start();

      // slow volume swaying
      this.modulateGainContinuously(pGain, 0.02, 0.08, 4 + idx * 3);
    });
  }

  private modulateGainContinuously(node: GainNode, min: number, max: number, duration: number) {
    if (!this.ctx) return;
    const run = () => {
      if (!this.ctx || !node) return;
      const now = this.ctx.currentTime;
      const targetVal = min + Math.random() * (max - min);
      node.gain.linearRampToValueAtTime(targetVal, now + duration);
      setTimeout(run, duration * 1000);
    };
    run();
  }

  /**
   * Internal scheduler looping at 140BPM (marching speed) to trigger rhythmic plucks & kettle drums.
   */
  private startScheduler() {
    const tempoBPM = 135;
    const beatIntervalMs = (60 / tempoBPM) * 1000 * 0.5; // Eighth notes

    const tick = () => {
      if (!this.isRunning || !this.ctx) return;
      
      // Make sure context was not suspended by autoplay policies
      if (this.ctx.state === 'running') {
        const activeTrack = this.currentScene === 'battle' ? this.battleTrack : this.campaignTrack;
        this.stepCounter++;
        this.processSequentialBeat(activeTrack, this.stepCounter);
      }
      
      this.intervalId = setTimeout(tick, beatIntervalMs);
    };
    
    tick();
  }

  private processSequentialBeat(track: string, step: number) {
    if (track === 'silence') return;

    if (track === 'yaman_darbar') {
      // Soft, tranquil, mystical Sitar pluck melodies at steps
      // Sitar scale: Yaman (C4, E4, F#4, G4, B4, C5)
      const sitarScale = [261.63, 329.63, 369.99, 392.00, 493.88, 523.25];
      if (step % 16 === 0 || (step % 24 === 6 && Math.random() > 0.4)) {
        const freqSelected = sitarScale[Math.floor(Math.random() * sitarScale.length)];
        this.synthesizeSitarPluck(freqSelected);
      }
    } else if (track === 'deccan_march') {
      // Authentic rhythmic war-tambourines & low Indian kettle-drum (Nagada) thumps
      // 4/4 beats: Thump on 1 and 9 (of 16) with subtle offbeat snaps
      const subStep = step % 16;
      if (subStep === 0 || subStep === 8) {
        this.synthesizeNagadaHeavyDrum(60, 0.4); // strong drum
      } else if (subStep === 4 || subStep === 12) {
        this.synthesizeNagadaHeavyDrum(75, 0.18); // medium tap
      } else if (subStep % 2 === 1 && Math.random() > 0.3) {
        this.synthesizeMilitarySnare(0.03, 1000); // subtle metallic snap
      }
    } else if (track === 'panipat_anthem') {
      // Ultra-intense heavy battlefield battle cries.
      // Rapid drumrolls and heavy bass kettle drums
      const subStep = step % 8;
      if (subStep === 0) {
        this.synthesizeNagadaHeavyDrum(45, 0.75); // double heavy deep kick
        if (Math.random() > 0.6) this.synthesizeWarHornBrassAlarm();
      } else if (subStep === 3 || subStep === 6) {
        this.synthesizeNagadaHeavyDrum(52, 0.35);
      } else if (subStep === 2 || subStep === 4 || subStep === 7) {
        // rapid snare/shrapnel rolls
        this.synthesizeMilitarySnare(0.08, 1800);
      }
    } else if (track === 'gardi_drill') {
      // European styled drill marches using strict snare drum beats (Ibrahim Khan Gardi custom)
      const subStep = step % 16;
      if (subStep === 0) {
        this.synthesizeNagadaHeavyDrum(80, 0.5); // uniform marching step
      }
      
      // Strict drumroll cadence
      // Step: 1-1-3 roll (tat  tat  tarara-tat)
      const drumCadence = [0, 4, 8, 9, 10, 12];
      if (drumCadence.includes(subStep)) {
        this.synthesizeMilitarySnare(0.07, 1200);
      }
    }
  }

  /**
   * Synthesizes an authentic Indian Sitar Pluck using sub-harmonic string resonance.
   */
  private synthesizeSitarPluck(frequency: number) {
    if (!this.ctx || !this.pluckGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator(); // jawari (resonance) mimic
    const pluckGainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, now);

    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(frequency * 2.01, now); // slightly detuned octave for buzz (jawari)

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 1.5);

    pluckGainNode.gain.setValueAtTime(0.0, now);
    pluckGainNode.gain.linearRampToValueAtTime(0.18, now + 0.02);
    pluckGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(pluckGainNode);
    pluckGainNode.connect(this.pluckGain);

    osc.start(now);
    subOsc.start(now);
    
    osc.stop(now + 2.5);
    subOsc.stop(now + 2.5);
  }

  /**
   * Generates a deep, resonance-loaded Kettle Drum / Nagada thump, using pitch sweep.
   */
  private synthesizeNagadaHeavyDrum(baseFreq: number, intensity: number) {
    if (!this.ctx || !this.rhythmGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const drumGainNode = this.ctx.createGain();

    osc.type = 'sine';
    // Deep pitch drop mimicking stretching leather membrane
    osc.frequency.setValueAtTime(baseFreq * 2.2, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.12);

    drumGainNode.gain.setValueAtTime(intensity, now);
    drumGainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(drumGainNode);
    drumGainNode.connect(this.rhythmGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * Synthesizes a militaristic Snare Drum roll using Bandpass-filtered random noise.
   */
  private synthesizeMilitarySnare(duration: number, bandpassFreq: number) {
    if (!this.ctx || !this.noiseBuffer || !this.rhythmGain) return;

    const now = this.ctx.currentTime;
    const noiseNode = this.ctx.createBufferSource();
    const bufferGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    noiseNode.buffer = this.noiseBuffer;

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(bandpassFreq, now);
    filter.Q.setValueAtTime(1.5, now);

    bufferGain.gain.setValueAtTime(0.08, now);
    bufferGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseNode.connect(filter);
    filter.connect(bufferGain);
    bufferGain.connect(this.rhythmGain);

    noiseNode.start(now);
    noiseNode.stop(now + duration + 0.05);
  }

  /**
   * Synthesizes a thundering war-cry horn (Tutari/Bhugal) simulating flat overtones.
   */
  private synthesizeWarHornBrassAlarm() {
    if (!this.ctx || !this.rhythmGain) return;

    const now = this.ctx.currentTime;
    // Two detuned oscillators for absolute majestic unison spread
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const hornGainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(105, now); // low G/Ab war alarm
    osc1.frequency.linearRampToValueAtTime(118, now + 0.6); // slide upwards

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(106.5, now);
    osc2.frequency.linearRampToValueAtTime(119.5, now + 0.6);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.linearRampToValueAtTime(750, now + 0.3); // open throat of the horn
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.95);

    hornGainNode.gain.setValueAtTime(0.0, now);
    hornGainNode.gain.linearRampToValueAtTime(0.24, now + 0.15); // fade in
    hornGainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.25); // slow echo decay

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(hornGainNode);
    hornGainNode.connect(this.rhythmGain);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 1.3);
    osc2.stop(now + 1.3);
  }

  public playNagada() {
    this.init();
    if (this.ctx && this.rhythmGain) {
      this.synthesizeNagadaHeavyDrum(55, 0.85);
    }
  }

  public playSnare() {
    this.init();
    if (this.ctx && this.rhythmGain) {
      this.synthesizeMilitarySnare(0.12, 1400);
    }
  }

  public playHorn() {
    this.init();
    if (this.ctx && this.rhythmGain) {
      this.synthesizeWarHornBrassAlarm();
    }
  }

  public playClash() {
    this.init();
    if (!this.ctx || !this.rhythmGain || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
    
    oscGain.gain.setValueAtTime(0.15, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    
    osc.connect(oscGain);
    oscGain.connect(this.rhythmGain);
    osc.start(now);
    osc.stop(now + 0.2);

    const noiseNode = this.ctx.createBufferSource();
    const noiseGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    noiseNode.buffer = this.noiseBuffer;
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4000, now);
    
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    noiseNode.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.rhythmGain);
    
    noiseNode.start(now);
    noiseNode.stop(now + 0.12);
  }

  public playExplosion() {
    this.init();
    if (!this.ctx || !this.rhythmGain || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
    
    oscGain.gain.setValueAtTime(0.9, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    osc.connect(oscGain);
    oscGain.connect(this.rhythmGain);
    osc.start(now);
    osc.stop(now + 0.55);

    const noiseNode = this.ctx.createBufferSource();
    const noiseGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    noiseNode.buffer = this.noiseBuffer;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, now);
    
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    
    noiseNode.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.rhythmGain);
    
    noiseNode.start(now);
    noiseNode.stop(now + 0.65);
  }

  /**
   * Destroys any active timer or interval loop.
   */
  public shutdown() {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }
}

export const panipatAudioEngine = new AudioEngine();
