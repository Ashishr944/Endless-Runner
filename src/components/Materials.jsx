import { MeshStandardMaterial } from 'three';

export const materials = {
  floor: new MeshStandardMaterial({ color: '#07121f', roughness: 0.72, metalness: 0.35 }),
  wall: new MeshStandardMaterial({ color: '#0a1023', roughness: 0.66, metalness: 0.45 }),
  cyan: new MeshStandardMaterial({ color: '#13f7ff', emissive: '#08b8ff', emissiveIntensity: 2.7, roughness: 0.25 }),
  magenta: new MeshStandardMaterial({ color: '#ff42e8', emissive: '#ff1bc8', emissiveIntensity: 2.6, roughness: 0.25 }),
  amber: new MeshStandardMaterial({ color: '#ffd166', emissive: '#ff8a00', emissiveIntensity: 1.8, roughness: 0.2 }),
  red: new MeshStandardMaterial({ color: '#ff355d', emissive: '#ff174b', emissiveIntensity: 2.4, roughness: 0.28 }),
  themeAmber: new MeshStandardMaterial({ color: '#ffd166', emissive: '#ffb300', emissiveIntensity: 2.2, roughness: 0.22 }),
  themeViolet: new MeshStandardMaterial({ color: '#8d6cff', emissive: '#6f4cff', emissiveIntensity: 2.1, roughness: 0.24 }),
  player: new MeshStandardMaterial({ color: '#e9fbff', emissive: '#2bdfff', emissiveIntensity: 0.55, roughness: 0.36, metalness: 0.2 }),
  shield: new MeshStandardMaterial({ color: '#87fff9', emissive: '#46ffef', emissiveIntensity: 1.8, transparent: true, opacity: 0.28 }),
  trail: new MeshStandardMaterial({ color: '#7df9ff', emissive: '#1ff8ff', emissiveIntensity: 2.2, transparent: true, opacity: 0.22, depthWrite: false }),
};
