import { CHUNK_LENGTH, LANES, OBSTACLE_TYPES, PICKUP_TYPES } from './constants.js';

let uid = 1;

const randomFrom = (list) => list[Math.floor(Math.random() * list.length)];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function makeChunk(index, z, difficulty) {
  const theme = chooseTheme(index);
  return {
    id: `chunk-${index}`,
    index,
    z,
    theme,
    phase: Math.random() * Math.PI * 2,
    accent: theme.accent,
    obstacles: createObstacles(z, difficulty, index),
    pickups: createPickups(z, difficulty, index),
  };
}

function chooseTheme(index) {
  const themes = [
    { name: 'ion', accent: '#10f7ff', secondary: '#ff3eea', density: 1 },
    { name: 'pulse', accent: '#ff3eea', secondary: '#ffd166', density: 1.08 },
    { name: 'reactor', accent: '#ffd166', secondary: '#12f7ff', density: 0.92 },
    { name: 'eclipse', accent: '#7df9ff', secondary: '#8d6cff', density: 0.86 },
  ];
  return themes[Math.floor(index / 5) % themes.length];
}

function createObstacles(chunkZ, difficulty, index) {
  const obstacles = [];
  const spawnChance = clamp(0.34 + difficulty * 0.055, 0.34, 0.78);
  const slots = [-5.2, -10.9, -16.2];
  const maxCount = difficulty < 2.2 ? 1 : difficulty < 5.5 ? 2 : 3;
  let count = 0;
  let lastLane = -1;
  let lastType = '';

  slots.forEach((offset, slotIndex) => {
    if (count >= maxCount || Math.random() > spawnChance) return;
    const type = weightedObstacle(difficulty, slotIndex, lastType);
    const lane = chooseFairLane(lastLane, difficulty);
    lastLane = lane;
    lastType = type;
    count += 1;
    obstacles.push({
      id: `obs-${uid++}`,
      type,
      lane,
      z: chunkZ + offset,
      x: LANES[lane],
      phase: Math.random() * Math.PI * 2,
      speed: 1.6 + Math.random() * 1.4 + difficulty * 0.2,
      spin: Math.random() > 0.5 ? 1 : -1,
      hitDepth: type === 'movingHazard' ? 0.85 : 0.74,
      warning: index % 3 === 0 && slotIndex === 0,
    });
  });

  return obstacles;
}

function createPickups(chunkZ, difficulty, index) {
  const pickups = [];
  const lineChance = clamp(0.78 - difficulty * 0.018, 0.44, 0.78);
  if (Math.random() < lineChance) {
    const lane = (index + Math.floor(Math.random() * LANES.length)) % LANES.length;
    const count = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i += 1) {
      pickups.push({
        id: `pick-${uid++}`,
        type: 'coin',
        lane,
        z: chunkZ - 4.5 - i * 2.1,
        y: 1.18 + (i % 2) * 0.18,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  const powerChance = clamp(0.16 + difficulty * 0.006, 0.16, 0.28);
  if (Math.random() < powerChance) {
    pickups.push({
      id: `pick-${uid++}`,
      type: randomFrom(PICKUP_TYPES.slice(1)),
      lane: Math.floor(Math.random() * LANES.length),
      z: chunkZ - 8 - Math.random() * 7,
      y: 1.25,
      phase: Math.random() * Math.PI * 2,
    });
  }

  return pickups;
}

function weightedObstacle(difficulty, slotIndex, lastType) {
  const pool = [...OBSTACLE_TYPES];
  if (difficulty < 1.4) return randomFrom(['lowBarrier', 'highBarrier']);
  if (difficulty > 3) pool.push('movingHazard', 'laserGate');
  if (difficulty > 6) pool.push('laserGate', 'highBarrier');
  const next = randomFrom(pool);
  if (slotIndex > 0 && next === lastType && Math.random() < 0.62) return randomFrom(['lowBarrier', 'highBarrier']);
  return next;
}

function chooseFairLane(lastLane, difficulty) {
  const lanes = [0, 1, 2].sort(() => Math.random() - 0.5);
  if (difficulty < 4 && lastLane !== -1) return lanes.find((lane) => lane !== lastLane) ?? 1;
  return lanes[0];
}
