/**
 * Pure helpers of <AlgorithmStepper />: which frame to show after a control is
 * used. Kept apart from React so node tests can check them directly.
 */

export interface StepperState {
	index: number;
	playing: boolean;
}

/** Keep a frame index inside 0 … count - 1 (0 when there are no frames). */
export function clampFrame(index: number, count: number): number {
	if (count <= 0 || !Number.isFinite(index)) return 0;
	return Math.min(count - 1, Math.max(0, Math.round(index)));
}

export function forward(state: StepperState, count: number): StepperState {
	return { index: clampFrame(state.index + 1, count), playing: false };
}

export function back(state: StepperState, count: number): StepperState {
	return { index: clampFrame(state.index - 1, count), playing: false };
}

export function seek(state: StepperState, index: number, count: number): StepperState {
	return { index: clampFrame(index, count), playing: false };
}

export function resetStepper(): StepperState {
	return { index: 0, playing: false };
}

/** Play from the start when the last frame is showing; otherwise toggle. */
export function togglePlay(state: StepperState, count: number): StepperState {
	if (state.playing) return { ...state, playing: false };
	if (count <= 1) return { ...state, playing: false };
	return { index: state.index >= count - 1 ? 0 : state.index, playing: true };
}

/** One autoplay tick: advance, and stop on the last frame. */
export function playTick(state: StepperState, count: number): StepperState {
	if (!state.playing) return state;
	const index = clampFrame(state.index + 1, count);
	return { index, playing: index < count - 1 };
}
