import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { CHUNK_LENGTH } from '../game/constants.js';
import { materials } from './Materials.jsx';

export function CorridorChunk({ chunk }) {
  const group = useRef();
  const ribs = useMemo(() => [-8, -4, 0, 4, 8], []);
  useFrame((state) => {
    if (!group.current) return;
    group.current.position.z = chunk.z;
    group.current.children.forEach((child, index) => {
      if (child.userData.pulse) child.scale.y = 1 + Math.sin(state.clock.elapsedTime * 3 + chunk.phase + index) * 0.04;
    });
  });

  return (
    <group ref={group} position={[0, 0, chunk.z]}>
      <mesh receiveShadow position={[0, -0.08, 0]} material={materials.floor}>
        <boxGeometry args={[8.2, 0.2, CHUNK_LENGTH]} />
      </mesh>
      <mesh receiveShadow position={[-4.25, 2, 0]} rotation={[0, 0, -0.1]} material={materials.wall}>
        <boxGeometry args={[0.35, 4.4, CHUNK_LENGTH]} />
      </mesh>
      <mesh receiveShadow position={[4.25, 2, 0]} rotation={[0, 0, 0.1]} material={materials.wall}>
        <boxGeometry args={[0.35, 4.4, CHUNK_LENGTH]} />
      </mesh>
      <mesh position={[0, 4.18, 0]} material={materials.wall}>
        <boxGeometry args={[8.2, 0.22, CHUNK_LENGTH]} />
      </mesh>

      {ribs.map((z, i) => (
        <group key={`${chunk.id}-rib-${i}`} position={[0, 0, z]}>
          <mesh userData={{ pulse: true }} position={[-4.02, 2, 0]} material={i % 2 ? materials.cyan : materials.magenta}>
            <boxGeometry args={[0.12, 3.7, 0.12]} />
          </mesh>
          <mesh userData={{ pulse: true }} position={[4.02, 2, 0]} material={i % 2 ? materials.magenta : materials.cyan}>
            <boxGeometry args={[0.12, 3.7, 0.12]} />
          </mesh>
          <mesh position={[0, 4.05, 0]} material={materials.cyan}>
            <boxGeometry args={[7.1, 0.08, 0.1]} />
          </mesh>
          {(chunk.index + i) % 3 === 0 && (
            <mesh position={[0, 2.25, -0.04]} material={i % 2 ? materials.themeAmber : materials.themeViolet}>
              <boxGeometry args={[0.08, 1.4, 0.08]} />
            </mesh>
          )}
        </group>
      ))}

      <mesh position={[-2.45, 0.02, 0]} material={materials.cyan}>
        <boxGeometry args={[0.04, 0.04, CHUNK_LENGTH]} />
      </mesh>
      <mesh position={[2.45, 0.02, 0]} material={materials.magenta}>
        <boxGeometry args={[0.04, 0.04, CHUNK_LENGTH]} />
      </mesh>
      <mesh position={[0, 0.03, -CHUNK_LENGTH * 0.28]} material={chunk.theme.name === 'reactor' ? materials.themeAmber : materials.themeViolet}>
        <boxGeometry args={[6.4, 0.035, 0.12]} />
      </mesh>
    </group>
  );
}
