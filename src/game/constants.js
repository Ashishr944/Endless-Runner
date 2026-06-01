export const LANES = [-2.45, 0, 2.45];
export const LANE_COUNT = LANES.length;
export const CHUNK_LENGTH = 18;
export const ACTIVE_CHUNKS = 10;
export const START_SPEED = 16;
export const MAX_SPEED = 38;
export const GRAVITY = 38;
export const JUMP_VELOCITY = 14.6;
export const SLIDE_TIME = 0.62;
export const SHIELD_TIME = 8;
export const MULTIPLIER_TIME = 9;
export const BURST_TIME = 5.5;
export const COUNTDOWN_TIME = 3;
export const COMBO_WINDOW = 2.2;

export const CONTROL_MAP = [
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['ArrowUp', 'KeyW', 'Space'] },
  { name: 'slide', keys: ['ArrowDown', 'KeyS'] },
];

export const OBSTACLE_TYPES = ['lowBarrier', 'highBarrier', 'movingHazard', 'laserGate'];
export const PICKUP_TYPES = ['coin', 'shield', 'multiplier', 'burst'];
