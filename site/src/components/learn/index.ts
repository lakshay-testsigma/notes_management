/**
 * The shared lesson components. This map is passed to `<Content components />`
 * when a lesson is rendered, which is why lesson MDX can use every name below
 * without an import and without a client directive.
 *
 * Adding a shared component: create `Name.astro` here (hydrating an island from
 * ./react if it is interactive), add it to this map, to
 * site/components.manifest.json (its kind and its prop names), and to
 * site/COMPONENTS.md. `npm run manifest:check` fails until all of them agree.
 */
import AlgorithmStepper from './AlgorithmStepper.astro';
import Chart from './Chart.astro';
import ClusterSim from './ClusterSim.astro';
import CodePlayground from './CodePlayground.astro';
import CompareView from './CompareView.astro';
import Depth from './Depth.astro';
import Diagram from './Diagram.astro';
import Experience from './Experience.astro';
import CodeWalkthrough from './CodeWalkthrough.astro';
import Figure from './Figure.astro';
import FlowAnimation from './FlowAnimation.astro';
import ProgressiveScene from './ProgressiveScene.astro';
import Graph3D from './Graph3D.astro';
import MatchPairs from './MatchPairs.astro';
import Mermaid from './Mermaid.astro';
import OrderSteps from './OrderSteps.astro';
import ParamPlayground from './ParamPlayground.astro';
import PredictReveal from './PredictReveal.astro';
import Quiz from './Quiz.astro';
import Resources from './Resources.astro';
import SequenceDiagram from './SequenceDiagram.astro';
import SortBuckets from './SortBuckets.astro';
import StateMachine from './StateMachine.astro';
import SystemDiagram from './SystemDiagram.astro';
import Timeline from './Timeline.astro';
import VectorSpace3D from './VectorSpace3D.astro';
import Video from './Video.astro';

export const lessonComponents = {
	// visual
	FlowAnimation,
	ProgressiveScene,
	SystemDiagram,
	SequenceDiagram,
	StateMachine,
	Graph3D,
	VectorSpace3D,
	Chart,
	ParamPlayground,
	CodeWalkthrough,
	Timeline,
	Mermaid,
	Diagram,
	Video,
	Experience,
	ClusterSim,
	AlgorithmStepper,
	CompareView,
	CodePlayground,
	// activity
	Quiz,
	PredictReveal,
	OrderSteps,
	MatchPairs,
	SortBuckets,
	// utility
	Resources,
	Figure,
	Depth,
};
