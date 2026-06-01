import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MathUtils, Vector3 } from 'three';
import {
  ACTIVE_CHUNKS,
  BURST_TIME,
  CHUNK_LENGTH,
  COMBO_WINDOW,
  COUNTDOWN_TIME,
  GRAVITY,
  JUMP_VELOCITY,
  LANES,
  MAX_SPEED,
  MULTIPLIER_TIME,
  SHIELD_TIME,
  SLIDE_TIME,
  START_SPEED,
} from '../game/constants.js';
import { obstacleHitsPlayer, pickupHitsPlayer } from '../game/collision.js';
import { makeChunk } from '../game/generation.js';
import { useSwipeControls } from '../hooks/useSwipeControls.js';
import { CorridorChunk } from './CorridorChunk.jsx';
import { Obstacle } from './Obstacle.jsx';
import { Pickup } from './Pickup.jsx';
import { Player } from './Player.jsx';
import { SpeedLines } from './SpeedLines.jsx';

const tempLook = new Vector3();
function initialChunks() {
  return Array.from({ length: ACTIVE_CHUNKS }, (_, index) => makeChunk(index, -index * CHUNK_LENGTH, 0));
}

function baseGame(status = 'ready') {
  return {
    status,
    countdown: COUNTDOWN_TIME,
    lane: 1,
    targetLane: 1,
    x: 0,
    targetX: 0,
    y: 0,
    vy: 0,
    sliding: false,
    slideTimer: 0,
    health: 3,
    score: 0,
    distance: 0,
    speed: START_SPEED,
    coins: 0,
    combo: 0,
    comboTimer: 0,
    difficulty: 0,
    impactShake: 0,
    powerups: { shield: 0, multiplier: 0, burst: 0 },
  };
}

export function GameScene({ audio, onSnapshot }) {
  const { camera, gl } = useThree();
  const [chunks, setChunks] = useState(initialChunks);
  const chunksRef = useRef(chunks);
  const nextChunkIndex = useRef(ACTIVE_CHUNKS);
  const [, getKeys] = useKeyboardControls();
  const lastKeys = useRef({});
  const emitTimer = useRef(0);
  const invulnerable = useRef(0);
  const highScore = useRef(Number(localStorage.getItem('neon-runner-high-score') || 0));
  const game = useRef(baseGame());

  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.setClearColor('#050711');
  }, [gl]);

  const publish = useCallback(() => {
    const g = game.current;
    onSnapshot({
      status: g.status,
      countdown: Math.ceil(Math.max(0, g.countdown)),
      score: Math.floor(g.score),
      highScore: highScore.current,
      distance: Math.floor(g.distance),
      speed: g.speed,
      health: g.health,
      coins: g.coins,
      combo: g.combo,
      comboTimer: g.comboTimer,
      powerups: { ...g.powerups },
    });
  }, [onSnapshot]);

  const beginCountdown = useCallback(() => {
    const fresh = initialChunks();
    chunksRef.current = fresh;
    setChunks(fresh);
    nextChunkIndex.current = ACTIVE_CHUNKS;
    invulnerable.current = 1.6;
    game.current = baseGame('countdown');
    audio.start();
    audio.countdown();
    publish();
  }, [audio, publish]);

  const togglePause = useCallback(() => {
    const g = game.current;
    if (g.status === 'running' || g.status === 'countdown') {
      g.status = 'paused';
      audio.setIntensity(0);
    } else if (g.status === 'paused') {
      g.status = 'countdown';
      g.countdown = Math.min(2, Math.max(1, g.countdown || 2));
      audio.start();
    } else if (g.status === 'ready') {
      beginCountdown();
      return;
    }
    publish();
  }, [audio, beginCountdown, publish]);

  useEffect(() => {
    window.__NEON_RUNNER_RESTART__ = beginCountdown;
    window.__NEON_RUNNER_TOGGLE_PAUSE__ = togglePause;
    publish();
    return () => {
      delete window.__NEON_RUNNER_RESTART__;
      delete window.__NEON_RUNNER_TOGGLE_PAUSE__;
    };
  }, [beginCountdown, publish, togglePause]);

  function switchLane(direction) {
    const g = game.current;
    if (g.status === 'ready' || g.status === 'gameover') {
      beginCountdown();
      return;
    }
    if (g.status !== 'running') return;
    const nextLane = MathUtils.clamp(g.targetLane + direction, 0, 2);
    if (nextLane === g.targetLane) return;
    g.targetLane = nextLane;
    g.lane = nextLane;
    g.targetX = LANES[nextLane];
    g.impactShake = Math.max(g.impactShake, 0.045);
  }

  function jump() {
    const g = game.current;
    if (g.status === 'ready' || g.status === 'gameover') {
      beginCountdown();
      return;
    }
    if (g.status !== 'running' || g.y > 0.12) return;
    g.vy = JUMP_VELOCITY;
    g.sliding = false;
    g.slideTimer = 0;
    audio.jump();
  }

  function slide() {
    const g = game.current;
    if (g.status === 'ready' || g.status === 'gameover') {
      beginCountdown();
      return;
    }
    if (g.status !== 'running') return;
    g.sliding = true;
    g.slideTimer = SLIDE_TIME;
    if (g.y > 0.05) g.vy = Math.min(g.vy, -15);
    audio.slide();
  }

  const actions = useMemo(() => ({
    left: () => switchLane(-1),
    right: () => switchLane(1),
    jump,
    slide,
  }), []);

  useSwipeControls(actions);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.033);
    const g = game.current;
    const keys = getKeys();
    if (keys.left && !lastKeys.current.left) switchLane(-1);
    if (keys.right && !lastKeys.current.right) switchLane(1);
    if (keys.jump && !lastKeys.current.jump) jump();
    if (keys.slide && !lastKeys.current.slide) slide();
    lastKeys.current = keys;

    if (g.status === 'countdown') {
      g.countdown -= dt;
      if (g.countdown <= 0) {
        g.status = 'running';
        audio.go();
      }
    } else if (g.status === 'running') {
      tickGame(dt, state.clock.elapsedTime);
    }

    g.impactShake = MathUtils.damp(g.impactShake, 0, 5.5, dt);
    const shake = g.impactShake * Math.sin(state.clock.elapsedTime * 95);
    const fovTarget = 63 + MathUtils.clamp((g.speed - START_SPEED) * 0.68, 0, 12);
    camera.fov = MathUtils.damp(camera.fov, fovTarget, 3.8, dt);
    camera.position.x = MathUtils.damp(camera.position.x, g.x * 0.38 + shake * 0.35, 5.8, dt);
    camera.position.y = MathUtils.damp(camera.position.y, 3.25 + g.y * 0.09 + Math.abs(shake) * 0.2, 4.8, dt);
    camera.position.z = MathUtils.damp(camera.position.z, 7.05 - Math.min(0.45, (g.speed - START_SPEED) * 0.02), 5, dt);
    tempLook.set(g.x * 0.6 + shake * 0.2, 1.28 + g.y * 0.1, -9.5);
    camera.lookAt(tempLook);
    camera.updateProjectionMatrix();

    emitTimer.current += dt;
    if (emitTimer.current > 0.08) {
      emitTimer.current = 0;
      publish();
    }

    function tickGame(step, elapsed) {
      g.distance += g.speed * step;
      g.difficulty = g.distance / 175;
      const burstBonus = g.powerups.burst > 0 ? 8.5 : 0;
      const speedTarget = Math.min(MAX_SPEED, START_SPEED + g.difficulty * 1.85 + burstBonus);
      g.speed = MathUtils.damp(g.speed, speedTarget, 0.58, step);
      audio.setIntensity(MathUtils.clamp((g.speed - START_SPEED) / (MAX_SPEED - START_SPEED), 0, 1));

      const multiplier = (g.powerups.multiplier > 0 ? 2 : 1) * (1 + Math.min(g.combo, 20) * 0.025);
      g.score += g.speed * step * 8.5 * multiplier;
      g.comboTimer = Math.max(0, g.comboTimer - step);
      if (g.comboTimer === 0) g.combo = 0;
      invulnerable.current = Math.max(0, invulnerable.current - step);

      Object.keys(g.powerups).forEach((key) => {
        g.powerups[key] = Math.max(0, g.powerups[key] - step);
      });

      g.x = MathUtils.damp(g.x, g.targetX, 18, step);
      g.vy -= GRAVITY * step;
      g.y = Math.max(0, g.y + g.vy * step);
      if (g.y === 0 && g.vy < 0) g.vy = 0;
      if (g.slideTimer > 0) g.slideTimer -= step;
      else g.sliding = false;

      let changed = false;
      const current = chunksRef.current;
      for (const chunk of current) {
        chunk.z += g.speed * step;
        for (const obstacle of chunk.obstacles) {
          obstacle.z += g.speed * step;
          if (obstacle.type === 'movingHazard') {
            obstacle.phase += step * obstacle.speed;
            obstacle.x = MathUtils.damp(obstacle.x ?? LANES[obstacle.lane], LANES[Math.round(1 + Math.sin(obstacle.phase) * 0.95)], 8, step);
          }
        }
        for (const pickup of chunk.pickups) pickup.z += g.speed * step;

        const obstacleCount = chunk.obstacles.length;
        chunk.obstacles = chunk.obstacles.filter((obstacle) => {
          if (obstacle.z > 7.5) return false;
          if (obstacleHitsPlayer(obstacle, g)) {
            handleCollision();
            return false;
          }
          return true;
        });
        const pickupCount = chunk.pickups.length;
        chunk.pickups = chunk.pickups.filter((pickup) => {
          if (pickup.z > 7.5) return false;
          if (pickupHitsPlayer(pickup, g)) {
            collectPickup(pickup);
            return false;
          }
          return true;
        });
        changed = changed || obstacleCount !== chunk.obstacles.length || pickupCount !== chunk.pickups.length;
      }

      const kept = current.filter((chunk) => chunk.z < CHUNK_LENGTH * 1.25);
      if (kept.length !== current.length) changed = true;
      while (kept.length < ACTIVE_CHUNKS) {
        const farthest = kept.reduce((min, chunk) => Math.min(min, chunk.z), 0);
        kept.push(makeChunk(nextChunkIndex.current, farthest - CHUNK_LENGTH, g.difficulty));
        nextChunkIndex.current += 1;
        changed = true;
      }

      chunksRef.current = kept;
      if (changed || elapsed % 0.5 < step) setChunks([...kept]);
    }

    function handleCollision() {
      if (invulnerable.current > 0) return;
      g.combo = 0;
      g.comboTimer = 0;
      g.impactShake = 0.5;
      if (g.powerups.shield > 0) {
        g.powerups.shield = 0;
        invulnerable.current = 0.95;
        audio.collision(true);
        return;
      }
      g.health -= 1;
      invulnerable.current = 1.15;
      audio.collision(false);
      if (g.health <= 0) {
        g.status = 'gameover';
        g.health = 0;
        highScore.current = Math.max(highScore.current, Math.floor(g.score));
        localStorage.setItem('neon-runner-high-score', String(highScore.current));
        audio.gameOver();
      }
    }

    function collectPickup(pickup) {
      g.combo += 1;
      g.comboTimer = COMBO_WINDOW;
      if (pickup.type === 'coin') {
        g.coins += 1;
        g.score += (g.powerups.multiplier > 0 ? 210 : 105) + Math.min(g.combo, 25) * 9;
      }
      if (pickup.type === 'shield') g.powerups.shield = SHIELD_TIME;
      if (pickup.type === 'multiplier') g.powerups.multiplier = MULTIPLIER_TIME;
      if (pickup.type === 'burst') g.powerups.burst = BURST_TIME;
      audio.pickup(pickup.type, g.combo);
    }
  });

  const g = game.current;

  return (
    <>
      <hemisphereLight args={['#9beaff', '#050711', 0.62]} />
      <directionalLight
        position={[2.4, 7, 4]}
        intensity={2.35}
        color="#d8fbff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0, 3.2, 5]} intensity={2.6} color="#ff4df0" distance={13} />
      <pointLight position={[-3.4, 2.1, -9]} intensity={1.7} color="#12f7ff" distance={12} />
      <SpeedLines speed={g.speed} />
      {chunks.map((chunk) => (
        <CorridorChunk key={chunk.id} chunk={chunk} />
      ))}
      {chunks.flatMap((chunk) => chunk.obstacles).map((obstacle) => (
        <Obstacle key={obstacle.id} obstacle={obstacle} />
      ))}
      {chunks.flatMap((chunk) => chunk.pickups).map((pickup) => (
        <Pickup key={pickup.id} pickup={pickup} />
      ))}
      <Player player={g} powerups={g.powerups} invulnerable={invulnerable.current} />
      <EffectComposer multisampling={0} disableNormalPass>
        <Bloom intensity={1.28} luminanceThreshold={0.18} luminanceSmoothing={0.2} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.72} />
      </EffectComposer>
    </>
  );
}
