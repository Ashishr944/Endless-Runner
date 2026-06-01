import { LANES } from './constants.js';

export function obstacleHitsPlayer(obstacle, player) {
  const laneX = obstacle.type === 'movingHazard' ? obstacle.x ?? LANES[obstacle.lane] : LANES[obstacle.lane];
  const laneDistance = Math.abs(laneX - player.x);
  const zDistance = Math.abs(obstacle.z);
  if (laneDistance > 0.92 || zDistance > obstacle.hitDepth) return false;

  if (obstacle.type === 'lowBarrier') return player.y < 0.95;
  if (obstacle.type === 'highBarrier') return !player.sliding || player.slideTimer < 0.08;
  if (obstacle.type === 'laserGate') return player.y < 1.45 && !player.sliding;
  return player.y < 1.65;
}

export function pickupHitsPlayer(pickup, player) {
  return Math.abs(LANES[pickup.lane] - player.x) < 1.05 && Math.abs(pickup.z) < 1.12 && Math.abs(pickup.y - (player.y + 0.9)) < 1.35;
}
