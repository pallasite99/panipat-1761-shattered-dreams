import { vi, beforeAll, beforeEach } from 'vitest';

// 🔊 Robust Web Audio API Mock for Test Isolation
class MockAudioNode {
  connect = vi.fn();
  disconnect = vi.fn();
}

class MockGainNode extends MockAudioNode {
  gain = {
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
}

class MockOscillatorNode extends MockAudioNode {
  type = 'sine';
  frequency = {
    value: 440,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  detune = {
    value: 0,
    setValueAtTime: vi.fn(),
  };
  start = vi.fn();
  stop = vi.fn();
}

class MockBiquadFilterNode extends MockAudioNode {
  type = 'lowpass';
  frequency = {
    value: 350,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  Q = {
    value: 1,
    setValueAtTime: vi.fn(),
  };
}

class MockAudioBufferSourceNode extends MockAudioNode {
  buffer = null;
  start = vi.fn();
  stop = vi.fn();
}

class MockAudioContext {
  currentTime = 0;
  sampleRate = 44100;
  state = 'suspended';
  destination = {};

  createGain() {
    return new MockGainNode();
  }

  createOscillator() {
    return new MockOscillatorNode();
  }

  createBiquadFilter() {
    return new MockBiquadFilterNode();
  }

  createBufferSource() {
    return new MockAudioBufferSourceNode();
  }

  createBuffer(channels: number, size: number, rate: number) {
    return {
      numberOfChannels: channels,
      length: size,
      sampleRate: rate,
      getChannelData: () => new Float32Array(size),
    };
  }

  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
}

// Attach mocks to global context
beforeAll(() => {
  globalThis.AudioContext = MockAudioContext as any;
  (globalThis as any).webkitAudioContext = MockAudioContext as any;

  // Mock standard DOM functions that might be missing in jsdom
  if (typeof window !== 'undefined') {
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
  }
});

// Clear localStorage and mocks before each test
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
