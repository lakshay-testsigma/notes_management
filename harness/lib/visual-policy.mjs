// Opt-in visual decisions for an experienced learner. Legacy plans retain §12.
const text = value => typeof value === 'string' && value.trim().length > 0;
export const SPATIAL_VISUALS = ['Graph3D', 'VectorSpace3D'];
export const SIMULATION_VISUALS = ['ParamPlayground', 'StateMachine', 'FlowAnimation'];

export function adaptiveVisualProblems(page, kinds) {
  if (!page || typeof page !== 'object') return ['needs an outline entry'];
  const problems = [];
  if (!['basic', 'intermediate', 'advanced'].includes(page.complexity)) problems.push('needs complexity: basic, intermediate or advanced');
  if (!['supporting', 'core', 'critical'].includes(page.importance)) problems.push('needs importance: supporting, core or critical');
  if (typeof page.spatial !== 'boolean') problems.push('needs spatial: true or false for a graph or spatial mechanism');
  if (!text(page.visual_reason)) problems.push('needs visual_reason explaining the visual choice or its omission');
  if (page.visual !== null && !kinds.visual.includes(page.visual)) problems.push('visual must be null or a shared visual component from the manifest');
  const required = page.complexity !== 'basic' || page.importance === 'critical';
  if (required && !text(page.visual)) problems.push('requires a visual for an intermediate, advanced or career-critical idea');
  if (text(page.visual) && !text(page.interaction_goal)) problems.push('needs interaction_goal stating what the learner changes and predicts');
  if (page.complexity === 'advanced' && page.spatial === true && !SPATIAL_VISUALS.includes(page.visual)) {
    problems.push('an advanced spatial or graph mechanism requires Graph3D or VectorSpace3D');
  }
  if (page.complexity === 'advanced' && page.spatial === false && !SIMULATION_VISUALS.includes(page.visual)) {
    problems.push('an advanced nonspatial mechanism requires ParamPlayground, StateMachine or FlowAnimation with a visual_reason');
  }
  if (page.spatial === false && SPATIAL_VISUALS.includes(page.visual)) problems.push('3D requires a spatial or graph mechanism; use an interactive 2D simulation otherwise');
  return problems;
}
