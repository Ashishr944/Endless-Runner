import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { LANES } from '../game/constants.js';
import { materials } from './Materials.jsx';

export function Obstacle({ obstacle }) {
  const ref = useRef();

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.x = obstacle.x ?? LANES[obstacle.lane];
    ref.current.position.z = obstacle.z;
    if (obstacle.type === 'laserGate') ref.current.rotation.z += dt * 3.2 * obstacle.spin;
  });

  const x = obstacle.x ?? LANES[obstacle.lane];

  if (obstacle.type === 'lowBarrier') {
    return (
      <group ref={ref} position={[x, 0.45, obstacle.z]}>
        <mesh castShadow material={materials.red}>
          <boxGeometry args={[1.45, 0.85, 0.55]} />
        </mesh>
        <pointLight color="#ff3157" intensity={2.2} distance={5} />
      </group>
    );
  }

  if (obstacle.type === 'highBarrier') {
    return (
      <group ref={ref} position={[x, 2.05, obstacle.z]}>
        <mesh castShadow material={materials.magenta}>
          <boxGeometry args={[1.55, 2.25, 0.42]} />
        </mesh>
        <mesh position={[0, -1.45, 0]} material={materials.cyan}>
          <boxGeometry args={[1.4, 0.08, 0.55]} />
        </mesh>
      </group>
    );
  }

  if (obstacle.type === 'laserGate') {
    return (
      <group ref={ref} position={[x, 1.7, obstacle.z]}>
        <mesh position={[0, 0, -0.08]} material={materials.themeViolet}>
          <torusGeometry args={[1.16, 0.018, 8, 48]} />
        </mesh>
        <mesh material={materials.red}>
          <torusGeometry args={[0.92, 0.04, 10, 48]} />
        </mesh>
        <mesh material={materials.cyan}>
          <boxGeometry args={[2.15, 0.09, 0.12]} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} material={materials.magenta}>
          <boxGeometry args={[2.15, 0.09, 0.12]} />
        </mesh>
        <pointLight color="#ff39e8" intensity={3} distance={6} />
      </group>
    );
  }

  return (
    <group ref={ref} position={[x, 1.25, obstacle.z]}>
      <mesh castShadow material={materials.amber}>
        <icosahedronGeometry args={[0.62, 1]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.red}>
        <torusGeometry args={[0.88, 0.035, 8, 42]} />
      </mesh>
      <pointLight color="#ffc04d" intensity={2.8} distance={5} />
    </group>
  );
}
