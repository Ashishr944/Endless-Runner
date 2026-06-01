import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { materials } from './Materials.jsx';

export function Player({ player, powerups, invulnerable = 0 }) {
  const group = useRef();
  const torso = useRef();
  const trail = useRef();

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.position.set(player.x, player.y, 0);
    group.current.rotation.z = (player.x - player.targetX) * -0.13;
    group.current.scale.y = player.sliding ? 0.52 : 1 + Math.sin(t * 16) * 0.025;
    group.current.scale.x = player.sliding ? 1.14 : 1;
    group.current.visible = invulnerable <= 0 || Math.sin(t * 42) > -0.15;
    if (torso.current) torso.current.rotation.x = player.sliding ? Math.PI / 2.8 : Math.sin(t * 14) * 0.05;
    if (trail.current) {
      trail.current.scale.z = 1 + Math.min(1.6, player.speed / 20);
      trail.current.material.opacity = powerups.burst > 0 ? 0.45 : 0.22;
    }
  });

  return (
    <group ref={group}>
      <group ref={torso} position={[0, 0.95, 0]}>
        <mesh castShadow material={materials.player}>
          <capsuleGeometry args={[0.36, 1.02, 8, 18]} />
        </mesh>
        <mesh position={[0, 0.82, 0]} material={materials.cyan}>
          <sphereGeometry args={[0.28, 18, 18]} />
        </mesh>
        <mesh position={[0, 0.83, -0.25]} material={materials.magenta}>
          <boxGeometry args={[0.46, 0.08, 0.06]} />
        </mesh>
      </group>
      <mesh position={[-0.24, 0.34, 0]} rotation={[0.3, 0, 0.2]} material={materials.player}>
        <capsuleGeometry args={[0.1, 0.48, 6, 10]} />
      </mesh>
      <mesh position={[0.24, 0.34, 0]} rotation={[-0.25, 0, -0.2]} material={materials.player}>
        <capsuleGeometry args={[0.1, 0.48, 6, 10]} />
      </mesh>
      <mesh ref={trail} position={[0, 0.9, 1.1]} rotation={[Math.PI / 2, 0, 0]} material={materials.trail}>
        <coneGeometry args={[0.46, 3.2, 18, 1, true]} />
      </mesh>
      {powerups.shield > 0 && (
        <mesh material={materials.shield}>
          <sphereGeometry args={[1.05, 32, 18]} />
        </mesh>
      )}
      <pointLight position={[0, 1.4, 0.6]} color="#5cf8ff" intensity={2.2} distance={6} />
    </group>
  );
}
