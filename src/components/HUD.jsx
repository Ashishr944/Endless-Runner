import { Gauge, Heart, Pause, Play, RotateCcw, Trophy, Volume2, VolumeX, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

const names = {
  shield: 'Shield',
  multiplier: '2x',
  burst: 'Burst',
};

export function HUD({ snapshot, audio }) {
  const [sound, setSound] = useState(false);
  const [flashScore, setFlashScore] = useState(false);
  const data = snapshot ?? {
    status: 'ready',
    countdown: 0,
    score: 0,
    highScore: 0,
    distance: 0,
    speed: 0,
    health: 3,
    coins: 0,
    combo: 0,
    comboTimer: 0,
    powerups: { shield: 0, multiplier: 0, burst: 0 },
  };
  const activePowerups = Object.entries(data.powerups).filter(([, time]) => time > 0);

  useEffect(() => {
    if (data.combo <= 1) return;
    setFlashScore(true);
    const id = window.setTimeout(() => setFlashScore(false), 160);
    return () => window.clearTimeout(id);
  }, [data.combo]);

  const restart = () => window.__NEON_RUNNER_RESTART__?.();
  const pause = () => window.__NEON_RUNNER_TOGGLE_PAUSE__?.();
  const toggleSound = () => setSound(audio.toggle());

  const title = data.status === 'gameover'
    ? 'Run Terminated'
    : data.status === 'paused'
      ? 'Paused'
      : 'Neon Corridor Runner';

  return (
    <div className={`hud status-${data.status}`}>
      <section className="topbar">
        <div className={`stat primary ${flashScore ? 'pop' : ''}`}>
          <span>Score</span>
          <strong>{data.score.toLocaleString()}</strong>
        </div>
        <div className="stat">
          <span>Distance</span>
          <strong>{data.distance}m</strong>
        </div>
        <div className="stat compact">
          <Gauge size={17} />
          <strong>{data.speed.toFixed(1)}</strong>
        </div>
        <div className="lives" aria-label="health">
          {Array.from({ length: 3 }, (_, i) => (
            <Heart key={i} size={20} fill={i < data.health ? '#ff3567' : 'transparent'} />
          ))}
        </div>
        <button className="icon-button" type="button" aria-label="toggle sound" onClick={toggleSound}>
          {sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
        <button className="icon-button" type="button" aria-label="pause" onClick={pause}>
          {data.status === 'paused' ? <Play size={20} /> : <Pause size={20} />}
        </button>
      </section>

      <section className="power-row">
        <div className="chip"><Zap size={15} /> {data.coins}</div>
        <div className="chip high"><Trophy size={15} /> {data.highScore.toLocaleString()}</div>
        {data.combo > 1 && <div className="chip combo">Combo x{data.combo}</div>}
        {activePowerups.map(([key, time]) => (
          <div className="chip active" key={key}>
            {names[key]} {time.toFixed(0)}s
            <span className="meter" style={{ transform: `scaleX(${Math.min(1, time / 9)})` }} />
          </div>
        ))}
      </section>

      {data.status === 'countdown' && (
        <div className="countdown" aria-live="polite">{data.countdown || 'GO'}</div>
      )}

      {data.status !== 'running' && data.status !== 'countdown' && (
        <section className="center-panel">
          <h1>{title}</h1>
          <p>
            {data.status === 'gameover'
              ? `Final score ${data.score.toLocaleString()} across ${data.distance}m. Best run ${data.highScore.toLocaleString()}.`
              : 'A/D or arrows switch lanes. W, Space, or swipe up jumps. S or swipe down slides.'}
          </p>
          <button type="button" className="restart" onClick={data.status === 'paused' ? pause : restart}>
            <RotateCcw size={18} />
            {data.status === 'gameover' ? 'Restart' : data.status === 'paused' ? 'Resume' : 'Start Run'}
          </button>
        </section>
      )}
    </div>
  );
}
