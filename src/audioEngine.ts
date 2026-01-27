export type Waveform = OscillatorType;

type StartOptions = {
	frequencyHz: number;
	waveform: Waveform;
	volume: number;
};

export class AudioEngine {
	private ctx: AudioContext | null = null;
	private oscillator: OscillatorNode | null = null;
	private gain: GainNode | null = null;

	get isPlaying(): boolean {
		return this.oscillator !== null;
	}

	private ensureContext(): AudioContext {
		if (this.ctx) return this.ctx;

		const Ctx =
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext })
				.webkitAudioContext;
		this.ctx = new Ctx();
		return this.ctx;
	}

	async start(options: StartOptions): Promise<void> {
		const ctx = this.ensureContext();

		if (ctx.state === "suspended") {
			await ctx.resume();
		}

		this.stop();

		const oscillator = ctx.createOscillator();
		oscillator.type = options.waveform;
		oscillator.frequency.value = options.frequencyHz;

		const gain = ctx.createGain();
		gain.gain.value = Math.max(0, Math.min(1, options.volume));

		oscillator.connect(gain);
		gain.connect(ctx.destination);

		oscillator.start();

		this.oscillator = oscillator;
		this.gain = gain;
	}

	update(options: Partial<StartOptions>): void {
		if (!this.ctx || !this.oscillator || !this.gain) return;

		if (options.waveform) {
			this.oscillator.type = options.waveform;
		}

		if (
			typeof options.frequencyHz === "number" &&
			Number.isFinite(options.frequencyHz)
		) {
			this.oscillator.frequency.setValueAtTime(
				options.frequencyHz,
				this.ctx.currentTime,
			);
		}

		if (typeof options.volume === "number" && Number.isFinite(options.volume)) {
			const v = Math.max(0, Math.min(1, options.volume));
			this.gain.gain.setValueAtTime(v, this.ctx.currentTime);
		}
	}

	stop(): void {
		if (this.oscillator) {
			try {
				this.oscillator.stop();
			} catch {
				// ignore
			}
			try {
				this.oscillator.disconnect();
			} catch {
				// ignore
			}
		}

		if (this.gain) {
			try {
				this.gain.disconnect();
			} catch {
				// ignore
			}
		}

		this.oscillator = null;
		this.gain = null;
	}
}
