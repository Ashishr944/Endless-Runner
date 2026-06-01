import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending } from 'three';

export function SpeedLines({ speed }) {
  const group = useRef();
  const lines = useMemo(
    () => Array.from({ length: 58 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 8,
      y: 0.18 + Math.random() * 3.7,
      z: -8 - Math.random() * 60,
      color: Math.random() > 0.5 ? '#12f7ff' : '#ff42e8',
      length: 2.2 + Math.random() * 4.8,
    })),
    [],
  );

  useFrame((_, dt) => {
    if (!group.current) return;
    group.current.children.forEach((line) => {
      line.position.z += dt * (speed + 34);
      if (line.position.z > 7) line.position.z = -70 - Math.random() * 20;
      line.material.opacity = Math.min(0.72, 0.22 + speed / 70);
    });
  });

  return (
    <group ref={group}>
      {lines.map((line) => (
        <mesh key={line.id} position={[line.x, line.y, line.z]}>
          <boxGeometry args={[0.025, 0.025, line.length]} />
          <meshBasicMaterial color={line.color} transparent opacity={0.45} blending={AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}
