import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { LANES } from '../game/constants.js';
import { materials } from './Materials.jsx';

const pickupMaterial = {
  coin: materials.amber,
  shield: materials.cyan,
  multiplier: materials.magenta,
  burst: materials.red,
};

export function Pickup({ pickup }) {
  const ref = useRef();
  useFrame((state, dt) => {
    if (!ref.current) return;
    ref.current.position.x = LANES[pickup.lane];
    ref.current.position.z = pickup.z;
    ref.current.rotation.y += dt * 3.5;
    ref.current.position.y = pickup.y + Math.sin(state.clock.elapsedTime * 4 + pickup.phase) * 0.12;
  });

  return (
    <group ref={ref} position={[LANES[pickup.lane], pickup.y, pickup.z]}>
      {pickup.type === 'coin' ? (
        <mesh material={materials.amber}>
          <torusGeometry args={[0.28, 0.08, 12, 28]} />
        </mesh>
      ) : (
        <mesh material={pickupMaterial[pickup.type]}>
          <octahedronGeometry args={[0.42, 0]} />
        </mesh>
      )}
      <pointLight color={pickup.type === 'coin' ? '#ffd166' : '#65fff7'} intensity={1.25} distance={4} />
    </group>
  );
}
