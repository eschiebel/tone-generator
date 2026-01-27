import "./style.css";
import { AudioEngine } from "./audioEngine.ts";
import { NOTE_NAMES, buildNoteString, noteToFrequencyHz } from "./music.ts";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
	throw new Error("Missing #app element");
}

const engine = new AudioEngine();

function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}

function toFixedSmart(n: number): string {
	if (n >= 100) return n.toFixed(1);
	if (n >= 10) return n.toFixed(2);
	return n.toFixed(3);
}

const DEFAULT_OCTAVE = 3;

app.innerHTML = `
  <main class="page">
    <header class="header">
      <h1 class="title">Tone Generator</h1>
      <p class="subtitle">Choose a note (e.g. C3) and play it.</p>
    </header>

    <section class="panel" aria-label="Tone controls">
      <div class="grid">
        <label class="field">
          <span class="label">Note</span>
          <div class="note-row">
            <select id="noteName" class="control" aria-label="Note name"></select>
            <select id="octave" class="control" aria-label="Octave"></select>
            <input id="noteText" class="control" inputmode="text" autocomplete="off" spellcheck="false" aria-label="Note text" />
          </div>
          <span class="hint">Accepted: C3, F#4, Bb2</span>
        </label>

        <label class="field">
          <span class="label">Volume</span>
          <input id="volume" class="control" type="range" min="0" max="1" step="0.01" />
          <span id="volumeLabel" class="hint"></span>
        </label>
      </div>

      <div class="actions">
        <button id="play-toggle" type="button" class="primary">Play</button>
        <div class="readout" role="status" aria-live="polite">
          <div><span class="readout-label">Frequency</span> <span id="freq">—</span></div>
        </div>
      </div>

      <div id="error" class="error" role="alert" aria-live="assertive"></div>
    </section>
  </main>
`;

function requireElement<T extends Element>(
	selector: string,
	guard: (el: Element) => el is T,
): T {
	const el = document.querySelector(selector);
	if (!el || !guard(el)) {
		throw new Error(`Missing required element: ${selector}`);
	}
	return el;
}

const noteNameEl = requireElement(
	"#noteName",
	(el): el is HTMLSelectElement => el instanceof HTMLSelectElement,
);
const octaveEl = requireElement(
	"#octave",
	(el): el is HTMLSelectElement => el instanceof HTMLSelectElement,
);
const noteTextEl = requireElement(
	"#noteText",
	(el): el is HTMLInputElement => el instanceof HTMLInputElement,
);
const volumeEl = requireElement(
	"#volume",
	(el): el is HTMLInputElement => el instanceof HTMLInputElement,
);
const volumeLabelEl = requireElement(
	"#volumeLabel",
	(el): el is HTMLSpanElement => el instanceof HTMLSpanElement,
);
const playEl = requireElement(
	"#play-toggle",
	(el): el is HTMLButtonElement => el instanceof HTMLButtonElement,
);
const freqEl = requireElement(
	"#freq",
	(el): el is HTMLSpanElement => el instanceof HTMLSpanElement,
);
const errorEl = requireElement(
	"#error",
	(el): el is HTMLDivElement => el instanceof HTMLDivElement,
);

const OCTAVES = Array.from({ length: 9 }, (_, i) => i);

for (const n of NOTE_NAMES) {
	const opt = document.createElement("option");
	opt.value = n;
	opt.textContent = n;
	noteNameEl.appendChild(opt);
}

for (const o of OCTAVES) {
	const opt = document.createElement("option");
	opt.value = String(o);
	opt.textContent = String(o);
	octaveEl.appendChild(opt);
}

noteNameEl.value = "C";
octaveEl.value = String(DEFAULT_OCTAVE);
noteTextEl.value = buildNoteString(
	noteNameEl.value as (typeof NOTE_NAMES)[number],
	DEFAULT_OCTAVE,
);
volumeEl.value = "0.8";

function setError(message: string): void {
	errorEl.textContent = message;
	errorEl.style.display = message ? "block" : "none";
}

function setReadout(parsed: { frequencyHz: number } | null): void {
	if (!parsed) {
		freqEl.textContent = "—";
		return;
	}

	freqEl.textContent = `${toFixedSmart(parsed.frequencyHz)} Hz`;
}

function syncPlayButtonLabel(): void {
	playEl.textContent = engine.isPlaying ? "Stop" : "Play";
}

function refreshVolumeLabel(): void {
	const v = clamp(Number.parseFloat(volumeEl.value), 0, 1);
	volumeLabelEl.textContent = `${Math.round(v * 100)}%`;
}

function getParsedFromText(): {
	canonical: string;
	midi: number;
	frequencyHz: number;
} | null {
	try {
		const parsed = noteToFrequencyHz(noteTextEl.value);
		setError("");
		setReadout(parsed);
		return parsed;
	} catch (e) {
		const message = e instanceof Error ? e.message : "Invalid note";
		setError(message);
		setReadout(null);
		return null;
	}
}

function syncTextFromSelects(): void {
	const octave = Number.parseInt(octaveEl.value, 10);
	noteTextEl.value = buildNoteString(
		noteNameEl.value as (typeof NOTE_NAMES)[number],
		octave,
	);
	getParsedFromText();
}

function syncSelectsFromText(): void {
	const parsed = getParsedFromText();
	if (!parsed) return;

	const match = /^(?<name>[A-G]#?)(?<octave>-?\d+)$/.exec(parsed.canonical);
	if (!match?.groups) return;

	noteNameEl.value = match.groups.name;
	octaveEl.value = match.groups.octave;
}

noteNameEl.addEventListener("change", () => {
	syncTextFromSelects();
	if (engine.isPlaying) {
		const parsed = getParsedFromText();
		if (parsed) engine.update({ frequencyHz: parsed.frequencyHz });
	}
});

octaveEl.addEventListener("change", () => {
	syncTextFromSelects();
	if (engine.isPlaying) {
		const parsed = getParsedFromText();
		if (parsed) engine.update({ frequencyHz: parsed.frequencyHz });
	}
});

noteTextEl.addEventListener("input", () => {
	syncSelectsFromText();
	if (engine.isPlaying) {
		const parsed = getParsedFromText();
		if (parsed) engine.update({ frequencyHz: parsed.frequencyHz });
	}
});

volumeEl.addEventListener("input", () => {
	refreshVolumeLabel();
	if (engine.isPlaying) {
		engine.update({ volume: clamp(Number.parseFloat(volumeEl.value), 0, 1) });
	}
});

playEl.addEventListener("click", async () => {
	if (engine.isPlaying) {
		engine.stop();
		syncPlayButtonLabel();
		return;
	}

	const parsed = getParsedFromText();
	if (!parsed) return;

	await engine.start({
		frequencyHz: parsed.frequencyHz,
		waveform: "sine",
		volume: clamp(Number.parseFloat(volumeEl.value), 0, 1),
	});
	syncPlayButtonLabel();
});

window.addEventListener("keydown", (e) => {
	if (e.key === " ") {
		e.preventDefault();
		playEl.click();
	}
});

syncPlayButtonLabel();

refreshVolumeLabel();
getParsedFromText();
