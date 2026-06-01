import { Canvas } from '@react-three/fiber';
import { KeyboardControls, PerformanceMonitor, Stars } from '@react-three/drei';
import { useMemo, useState } from 'react';
import { GameScene } from './components/GameScene.jsx';
import { HUD } from './components/HUD.jsx';
import { AudioSystem } from './systems/AudioSystem.js';
import { CONTROL_MAP } from './game/constants.js';

export default function App() {
  const [quality, setQuality] = useState(1);
  const [snapshot, setSnapshot] = useState(null);
  const audio = useMemo(() => new AudioSystem(), []);

  return (
    <KeyboardControls map={CONTROL_MAP}>
      <main className="app-shell">
        <Canvas
          shadows
          camera={{ position: [0, 3.4, 7], fov: 63, near: 0.1, far: 180 }}
          dpr={[1, Math.min(2, window.devicePixelRatio || 1) * quality]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#050711']} />
          <fog attach="fog" args={['#050711', 18, 96]} />
          <ambientLight intensity={0.18} color="#7db7ff" />
          <Stars radius={90} depth={28} count={quality > 0.75 ? 1100 : 520} factor={3} fade speed={0.65} />
          <PerformanceMonitor onDecline={() => setQuality(0.75)} onIncline={() => setQuality(1)} />
          <GameScene audio={audio} onSnapshot={setSnapshot} />
        </Canvas>
        <HUD snapshot={snapshot} audio={audio} />
      </main>
    </KeyboardControls>
  );
}
