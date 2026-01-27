export const NOTE_NAMES = [
	"C",
	"C#",
	"D",
	"D#",
	"E",
	"F",
	"F#",
	"G",
	"G#",
	"A",
	"A#",
	"B",
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

const NOTE_TO_SEMITONE: Record<string, number> = {
	C: 0,
	"C#": 1,
	DB: 1,
	D: 2,
	"D#": 3,
	EB: 3,
	E: 4,
	F: 5,
	"F#": 6,
	GB: 6,
	G: 7,
	"G#": 8,
	AB: 8,
	A: 9,
	"A#": 10,
	BB: 10,
	B: 11,
};

export type ParsedNote = {
	canonical: string;
	midi: number;
	frequencyHz: number;
};

export function noteToFrequencyHz(note: string, a4Hz = 440): ParsedNote {
	const trimmed = note.trim();
	const match =
		/^(?<letter>[A-Ga-g])(?<accidental>[#bB]?)(?<octave>-?\d+)$/.exec(trimmed);

	if (!match?.groups) {
		throw new Error("Invalid note format. Examples: C3, F#4, Bb2");
	}

	const letter = match.groups.letter.toUpperCase();
	const accidentalRaw = match.groups.accidental;
	const accidental = accidentalRaw === "b" ? "B" : accidentalRaw;
	const octave = Number.parseInt(match.groups.octave, 10);

	if (!Number.isFinite(octave)) {
		throw new Error("Invalid octave");
	}

	const key = `${letter}${accidental}`.toUpperCase();
	const semitone = NOTE_TO_SEMITONE[key];

	if (semitone === undefined) {
		throw new Error("Invalid note name");
	}

	const midi = (octave + 1) * 12 + semitone;
	const frequencyHz = a4Hz * 2 ** ((midi - 69) / 12);

	const canonical = `${NOTE_NAMES[semitone]}${octave}`;

	return {
		canonical,
		midi,
		frequencyHz,
	};
}

export function buildNoteString(noteName: NoteName, octave: number): string {
	return `${noteName}${octave}`;
}
