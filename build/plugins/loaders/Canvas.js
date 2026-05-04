const CANVAS_SYSTEM = document.createElement('canvas');
const DRAW_SYSTEM = CANVAS_SYSTEM.getContext( '2d', { willReadFrequently: true } );

export { CANVAS_SYSTEM, DRAW_SYSTEM };