import React, { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html, Sky } from '@react-three/drei';
import * as THREE from 'three';

// Enhanced CSS with better visuals
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

* {
  box-sizing: border-box;
}

body, html {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.farm-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.farm-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  color: #fff;
  padding: 24px 32px;
  z-index: 10;
  border-bottom: 3px solid #4CAF50;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.farm-header h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.farm-header p {
  margin: 0;
  font-size: 14px;
  opacity: 0.85;
  color: #a5d6a7;
  font-weight: 500;
}

.controls-info {
  position: absolute;
  bottom: 24px;
  left: 24px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
  color: #fff;
  padding: 20px 24px;
  border-radius: 16px;
  z-index: 10;
  border: 2px solid #4CAF50;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  font-size: 13px;
  transition: all 0.3s ease;
}

.controls-info:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

.controls-info h3 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #4CAF50;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
  padding: 6px 0;
}

.control-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.farm-legend {
  position: absolute;
  top: 120px;
  right: 24px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
  color: #fff;
  padding: 20px 24px;
  border-radius: 16px;
  z-index: 10;
  border: 2px solid #4CAF50;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  min-width: 220px;
  transition: all 0.3s ease;
}

.farm-legend:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

.farm-legend h3 {
  margin: 0 0 16px;
  font-size: 16px;
  color: #4CAF50;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 10px 0;
  font-size: 13px;
  font-weight: 500;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: default;
}

.legend-item:hover {
  background: rgba(76, 175, 80, 0.15);
  transform: translateX(4px);
}

.legend-icon {
  font-size: 20px;
  width: 28px;
  text-align: center;
}

.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  color: #fff;
  background: rgba(0, 0, 0, 0.8);
  padding: 40px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-screen p {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.label-3d {
  background: rgba(0, 0, 0, 0.95);
  color: #fff;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  border: 2px solid #4CAF50;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  pointer-events: none;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.label-3d.cow {
  border-color: #FF6B6B;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.4);
}

.label-3d.goat {
  border-color: #4ECDC4;
  box-shadow: 0 4px 20px rgba(78, 205, 196, 0.4);
}

.label-3d.hen {
  border-color: #FFD93D;
  box-shadow: 0 4px 20px rgba(255, 217, 61, 0.4);
}

.label-3d.fish {
  border-color: #6C5CE7;
  box-shadow: 0 4px 20px rgba(108, 92, 231, 0.4);
}

.stats {
  position: absolute;
  bottom: 24px;
  right: 24px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
  color: #fff;
  padding: 20px 24px;
  border-radius: 16px;
  z-index: 10;
  border: 2px solid #4CAF50;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  min-width: 240px;
  transition: all 0.3s ease;
}

.stats:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

.stats h3 {
  margin: 0 0 16px;
  font-size: 16px;
  color: #4CAF50;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  font-size: 13px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(76, 175, 80, 0.2);
  font-weight: 500;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
}

.stat-val {
  font-weight: 700;
  color: #4CAF50;
  font-size: 14px;
}

.time-display {
  position: absolute;
  top: 120px;
  left: 24px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
  color: #fff;
  padding: 16px 20px;
  border-radius: 16px;
  z-index: 10;
  border: 2px solid #FFD93D;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  font-size: 24px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  min-width: 180px;
  text-align: center;
}

@media (max-width: 768px) {
  .farm-header h1 {
    font-size: 20px;
  }
  
  .farm-header p {
    font-size: 12px;
  }
  
  .controls-info,
  .farm-legend,
  .stats {
    padding: 16px;
    font-size: 11px;
  }
  
  .time-display {
    font-size: 18px;
    padding: 12px 16px;
  }
}
`;

if (!document.getElementById('farm-styles')) {
    const style = document.createElement('style');
    style.id = 'farm-styles';
    style.textContent = css;
    document.head.appendChild(style);
}

const Ground = ({ size = 180 }) => (
    <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[size, size, 80, 80]} />
            <meshStandardMaterial color="#4a7c4e" roughness={0.95} />
        </mesh>
        {Array.from({ length: 40 }).map((_, i) => (
            <mesh
                key={i}
                rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}
                position={[(Math.random() - 0.5) * size * 0.85, 0.01, (Math.random() - 0.5) * size * 0.85]}
                receiveShadow
            >
                <circleGeometry args={[2 + Math.random() * 3, 12]} />
                <meshStandardMaterial color="#5a9c5e" />
            </mesh>
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <planeGeometry args={[7, size]} />
            <meshStandardMaterial color="#a89070" roughness={0.98} />
        </mesh>
    </group>
);

const SolarPanel = ({ position, rotation = [0, 0, 0] }) => (
    <group position={position} rotation={rotation}>
        <mesh castShadow>
            <boxGeometry args={[3, 0.08, 2.5]} />
            <meshStandardMaterial color="#1a1a3e" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.4, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.8, 6]} />
            <meshStandardMaterial color="#888" />
        </mesh>
    </group>
);

const Cow = ({ position }) => {
    const ref = useRef();
    useFrame((s) => {
        if (ref.current) ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.3) * 0.1;
    });
    return (
        <group ref={ref} position={position}>
            <mesh position={[0, 1.2, 0]} castShadow>
                <boxGeometry args={[1.8, 1.4, 3]} />
                <meshStandardMaterial color="#fff" roughness={0.8} />
            </mesh>
            {[[0.5, 1.5, 0.5], [-0.5, 1.3, -0.8], [0.3, 1.6, -0.3]].map((p, i) => (
                <mesh key={i} position={p} castShadow>
                    <sphereGeometry args={[0.35, 12, 12]} />
                    <meshStandardMaterial color="#2d2d2d" />
                </mesh>
            ))}
            <mesh position={[0, 1.5, 1.8]} castShadow>
                <boxGeometry args={[1, 1, 1.2]} />
                <meshStandardMaterial color="#f5f5f5" />
            </mesh>
            <mesh position={[0, 1.2, 2.5]} castShadow>
                <boxGeometry args={[0.8, 0.5, 0.6]} />
                <meshStandardMaterial color="#ffc0cb" />
            </mesh>
            {[-0.6, 0.6].map((x, i) => (
                <mesh key={i} position={[x, 2, 1.8]} rotation={[0, 0, i ? 0.3 : -0.3]} castShadow>
                    <boxGeometry args={[0.3, 0.6, 0.1]} />
                    <meshStandardMaterial color="#f5f5f5" />
                </mesh>
            ))}
            {[-0.4, 0.4].map((x, i) => (
                <mesh key={i} position={[x, 2.3, 1.6]} rotation={[0.2, i ? 0.3 : -0.3, 0]} castShadow>
                    <coneGeometry args={[0.08, 0.5, 6]} />
                    <meshStandardMaterial color="#e8dcc0" />
                </mesh>
            ))}
            {[[-0.6, 0, 1], [0.6, 0, 1], [-0.6, 0, -1], [0.6, 0, -1]].map((p, i) => (
                <mesh key={i} position={p} castShadow>
                    <cylinderGeometry args={[0.2, 0.18, 1.2, 8]} />
                    <meshStandardMaterial color="#f5f5f5" />
                </mesh>
            ))}
            <mesh position={[0, 0.5, -0.5]} castShadow>
                <sphereGeometry args={[0.4, 12, 12]} />
                <meshStandardMaterial color="#ffc0cb" />
            </mesh>
            <mesh position={[0, 1.3, -1.8]} rotation={[0.5, 0, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.08, 1.2, 6]} />
                <meshStandardMaterial color="#f5f5f5" />
            </mesh>
        </group>
    );
};

const Goat = ({ position }) => {
    const ref = useRef();
    useFrame((s) => {
        if (ref.current) ref.current.position.y = position[1] + Math.sin(s.clock.elapsedTime * 2 + position[0]) * 0.05;
    });
    return (
        <group ref={ref} position={position}>
            <mesh position={[0, 0.8, 0]} castShadow>
                <boxGeometry args={[1, 0.9, 1.5]} />
                <meshStandardMaterial color="#d4c4a8" roughness={0.9} />
            </mesh>
            <mesh position={[0, 1, 1]} castShadow>
                <boxGeometry args={[0.6, 0.7, 0.8]} />
                <meshStandardMaterial color="#d4c4a8" />
            </mesh>
            <mesh position={[0, 0.8, 1.5]} castShadow>
                <boxGeometry args={[0.4, 0.3, 0.4]} />
                <meshStandardMaterial color="#c4b498" />
            </mesh>
            {[-0.25, 0.25].map((x, i) => (
                <mesh key={i} position={[x, 1.5, 0.8]} rotation={[0.3, i ? 0.4 : -0.4, 0]} castShadow>
                    <coneGeometry args={[0.06, 0.6, 6]} />
                    <meshStandardMaterial color="#3a3a3a" />
                </mesh>
            ))}
            {[-0.35, 0.35].map((x, i) => (
                <mesh key={i} position={[x, 1.2, 1.1]} rotation={[0, 0, i ? 0.5 : -0.5]} castShadow>
                    <boxGeometry args={[0.15, 0.4, 0.05]} />
                    <meshStandardMaterial color="#d4c4a8" />
                </mesh>
            ))}
            {[[-0.35, 0, 0.5], [0.35, 0, 0.5], [-0.35, 0, -0.5], [0.35, 0, -0.5]].map((p, i) => (
                <mesh key={i} position={p} castShadow>
                    <cylinderGeometry args={[0.12, 0.1, 0.8, 6]} />
                    <meshStandardMaterial color="#c4b498" />
                </mesh>
            ))}
            <mesh position={[0, 0.5, 1.5]} castShadow>
                <coneGeometry args={[0.1, 0.3, 6]} />
                <meshStandardMaterial color="#a89878" />
            </mesh>
        </group>
    );
};

const Chicken = ({ position }) => {
    const ref = useRef();
    useFrame((s) => {
        if (ref.current) {
            const t = s.clock.elapsedTime + position[0];
            ref.current.rotation.y = Math.sin(t * 1.5) * 0.3;
            ref.current.position.y = position[1] + Math.abs(Math.sin(t * 3)) * 0.08;
        }
    });
    return (
        <group ref={ref} position={position}>
            <mesh position={[0, 0.35, 0]} castShadow>
                <sphereGeometry args={[0.35, 12, 12]} />
                <meshStandardMaterial color="#f5f5f5" />
            </mesh>
            <mesh position={[0, 0.6, 0.3]} castShadow>
                <sphereGeometry args={[0.18, 12, 12]} />
                <meshStandardMaterial color="#fff" />
            </mesh>
            <mesh position={[0, 0.55, 0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <coneGeometry args={[0.06, 0.12, 6]} />
                <meshStandardMaterial color="#ff9800" />
            </mesh>
            <mesh position={[0, 0.75, 0.3]} castShadow>
                <boxGeometry args={[0.1, 0.15, 0.08]} />
                <meshStandardMaterial color="#f00" />
            </mesh>
            {[-0.25, 0.25].map((x, i) => (
                <mesh key={i} position={[x, 0.35, 0]} rotation={[0, 0, i ? 0.3 : -0.3]} castShadow>
                    <boxGeometry args={[0.15, 0.25, 0.4]} />
                    <meshStandardMaterial color="#e8e8e8" />
                </mesh>
            ))}
            {[-0.12, 0.12].map((x, i) => (
                <mesh key={i} position={[x, 0.05, 0.05]} castShadow>
                    <cylinderGeometry args={[0.03, 0.03, 0.25, 6]} />
                    <meshStandardMaterial color="#ff9800" />
                </mesh>
            ))}
            <mesh position={[0, 0.45, -0.35]} rotation={[0.5, 0, 0]} castShadow>
                <boxGeometry args={[0.25, 0.08, 0.3]} />
                <meshStandardMaterial color="#f5f5f5" />
            </mesh>
        </group>
    );
};

const Fish = ({ position }) => {
    const ref = useRef();
    useFrame((s) => {
        if (ref.current) {
            const t = s.clock.elapsedTime * 2 + position[0] * 0.5;
            ref.current.position.x = position[0] + Math.sin(t) * 0.3;
            ref.current.position.z = position[2] + Math.cos(t * 0.7) * 0.3;
            ref.current.rotation.y = Math.atan2(Math.cos(t * 0.7), -Math.sin(t));
        }
    });
    return (
        <group ref={ref} position={position}>
            <mesh castShadow>
                <boxGeometry args={[0.3, 0.15, 0.5]} />
                <meshStandardMaterial color="#ff6b35" metalness={0.6} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, -0.3]} rotation={[0, 0.3, 0]} castShadow>
                <boxGeometry args={[0.02, 0.15, 0.15]} />
                <meshStandardMaterial color="#ff8855" />
            </mesh>
        </group>
    );
};

const CowFarm = ({ position }) => {
    const cows = useMemo(() => Array.from({ length: 12 }, (_, i) => [
        position[0] - 6 + (i % 3) * 6,
        0.6,
        position[2] - 4 + Math.floor(i / 3) * 3
    ]), [position]);

    return (
        <group position={position}>
            <mesh position={[0, 4, 0]} castShadow receiveShadow>
                <boxGeometry args={[26, 8, 18]} />
                <meshStandardMaterial color="#e8dfd0" roughness={0.9} />
            </mesh>
            <mesh position={[0, 8.5, 0]} castShadow>
                <boxGeometry args={[28, 1, 20]} />
                <meshStandardMaterial color="#8b0000" metalness={0.3} />
            </mesh>
            {[-8, -4, 0, 4, 8].map((x, i) => (
                <SolarPanel key={i} position={[x, 9.2, 0]} rotation={[-0.2, 0, 0]} />
            ))}
            <mesh position={[0, 9.5, 0]} castShadow>
                <boxGeometry args={[28, 0.8, 2]} />
                <meshStandardMaterial color="#6b0000" />
            </mesh>
            {[-13, 13].map((x, i) => (
                <mesh key={i} position={[x, 5, 0]}>
                    <boxGeometry args={[0.5, 6, 16]} />
                    <meshStandardMaterial color="#87CEEB" transparent opacity={0.3} />
                </mesh>
            ))}
            <mesh position={[0, 0.1, 0]} receiveShadow>
                <boxGeometry args={[25, 0.2, 17]} />
                <meshStandardMaterial color="#bdbdbd" />
            </mesh>
            {Array.from({ length: 4 }).map((_, i) => (
                <mesh key={i} position={[-6 + i * 4, 0.25, 0]} receiveShadow>
                    <boxGeometry args={[3.5, 0.08, 16]} />
                    <meshStandardMaterial color="#2d2d2d" />
                </mesh>
            ))}
            <mesh position={[0, 0.8, 8]} castShadow>
                <boxGeometry args={[24, 0.6, 1.5]} />
                <meshStandardMaterial color="#808080" metalness={0.4} />
            </mesh>
            {[-8, 0, 8].map((x, i) => (
                <group key={i} position={[x, 1, -8]}>
                    <mesh castShadow>
                        <cylinderGeometry args={[0.3, 0.3, 0.8, 12]} />
                        <meshStandardMaterial color="#4682B4" metalness={0.6} />
                    </mesh>
                </group>
            ))}
            <mesh position={[18, 2.5, 0]} castShadow>
                <boxGeometry args={[8, 5, 10]} />
                <meshStandardMaterial color="#f5f5f5" />
            </mesh>
            <mesh position={[18, 5.3, 0]} castShadow>
                <boxGeometry args={[9, 0.6, 11]} />
                <meshStandardMaterial color="#4682B4" metalness={0.3} />
            </mesh>
            {[-2, 0, 2].map((z, i) => (
                <mesh key={i} position={[18, 1.2, z]} castShadow>
                    <boxGeometry args={[1.5, 2.4, 1.5]} />
                    <meshStandardMaterial color="#888" metalness={0.8} />
                </mesh>
            ))}
            {cows.map((p, i) => (
                <Cow key={i} position={p} />
            ))}
            <Html position={[0, 12, 0]} center>
                <div className="label-3d cow">🐄 Modern Dairy - Automated Milking</div>
            </Html>
        </group>
    );
};

const GoatFarm = ({ position }) => {
    const goats = useMemo(() => Array.from({ length: 15 }, () => [
        position[0] + (Math.random() - 0.5) * 12,
        0.4,
        position[2] + (Math.random() - 0.5) * 12
    ]), [position]);

    return (
        <group position={position}>
            <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[18, 5, 12]} />
                <meshStandardMaterial color="#d4c4a8" roughness={0.85} />
            </mesh>
            <mesh position={[0, 5.5, 0]} rotation={[0, 0, 0.12]} castShadow>
                <boxGeometry args={[19, 0.5, 13]} />
                <meshStandardMaterial color="#2d5a27" metalness={0.2} />
            </mesh>
            {[-4, 0, 4].map((x, i) => (
                <SolarPanel key={i} position={[x, 6.2, 0]} rotation={[-0.25, 0, 0]} />
            ))}
            {[-9, 9].map((x, i) => (
                <mesh key={i} position={[x, 2.5, 0]}>
                    <boxGeometry args={[0.3, 4, 11]} />
                    <meshStandardMaterial color="#87CEEB" transparent opacity={0.25} />
                </mesh>
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
                <mesh key={i} position={[-8 + i * 1.4, 0.15, 0]} receiveShadow>
                    <boxGeometry args={[0.25, 0.3, 10]} />
                    <meshStandardMaterial color="#8B7355" />
                </mesh>
            ))}
            <mesh position={[0, 0.5, 5]} castShadow>
                <boxGeometry args={[14, 0.8, 1.2]} />
                <meshStandardMaterial color="#A0522D" />
            </mesh>
            {goats.map((p, i) => (
                <Goat key={i} position={p} />
            ))}
            <Html position={[0, 8, 0]} center>
                <div className="label-3d goat">🐐 Goat Farm - Ventilated System</div>
            </Html>
        </group>
    );
};

const PoultryFarm = ({ position }) => {
    const chickens = useMemo(() => Array.from({ length: 30 }, () => [
        position[0] + (Math.random() - 0.5) * 18,
        0.6,
        position[2] + (Math.random() - 0.5) * 10
    ]), [position]);

    return (
        <group position={position}>
            <mesh position={[0, 3, 0]} castShadow receiveShadow>
                <boxGeometry args={[20, 6, 12]} />
                <meshStandardMaterial color="#f5f5f5" />
            </mesh>
            <mesh position={[0, 6.5, 0]} castShadow>
                <boxGeometry args={[21, 0.8, 13]} />
                <meshStandardMaterial color="#2d5a27" metalness={0.3} />
            </mesh>
            {[-6, -2, 2, 6].map((x, i) => (
                <SolarPanel key={i} position={[x, 7.2, 0]} rotation={[-0.2, 0, 0]} />
            ))}
            {[-3, 0, 3].map((x, i) => (
                <mesh key={i} position={[x, 6.8, 0]}>
                    <boxGeometry args={[2, 0.3, 13.5]} />
                    <meshStandardMaterial color="#87CEEB" transparent opacity={0.5} />
                </mesh>
            ))}
            {[-6, -3, 0, 3, 6].map((x, i) => (
                <mesh key={i} position={[x, 3, 6.05]}>
                    <boxGeometry args={[2.5, 4, 0.1]} />
                    <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
                </mesh>
            ))}
            <mesh position={[0, 0.1, 0]} receiveShadow>
                <boxGeometry args={[19, 0.2, 11]} />
                <meshStandardMaterial color="#c9b896" />
            </mesh>
            {Array.from({ length: 6 }).map((_, i) => (
                <mesh key={i} position={[-8 + i * 3.2, 0.8, -4]} castShadow>
                    <boxGeometry args={[0.8, 1.6, 2]} />
                    <meshStandardMaterial color="#d4a574" />
                </mesh>
            ))}
            <mesh position={[11, 1.2, 0]} castShadow>
                <boxGeometry args={[2, 0.6, 8]} />
                <meshStandardMaterial color="#ff6b35" />
            </mesh>
            {chickens.map((p, i) => (
                <Chicken key={i} position={p} />
            ))}
            <Html position={[0, 9, 0]} center>
                <div className="label-3d hen">🐔 Poultry - Cage-Free Automated</div>
            </Html>
        </group>
    );
};

const FishFarm = ({ position }) => {
    const fishes = useMemo(() => Array.from({ length: 40 }, () => [
        position[0] + (Math.random() - 0.5) * 10,
        -0.3 + Math.random() * 0.5,
        position[2] + (Math.random() - 0.5) * 12
    ]), [position]);

    const WaterSurface = () => {
        const ref = useRef();
        useFrame((s) => {
            if (ref.current) ref.current.position.y = -0.3 + Math.sin(s.clock.elapsedTime * 2) * 0.05;
        });
        return (
            <mesh ref={ref} position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[12, 14]} />
                <meshStandardMaterial color="#0077be" transparent opacity={0.85} metalness={0.4} roughness={0.1} />
            </mesh>
        );
    };

    return (
        <group position={position}>
            {[0, 15].map((x, i) => (
                <group key={i} position={[x - 7.5, 0, 0]}>
                    <mesh position={[0, 0.3, 0]} castShadow>
                        <boxGeometry args={[13, 1.5, 15]} />
                        <meshStandardMaterial color="#8B7355" />
                    </mesh>
                    <WaterSurface />
                    <mesh position={[6.3, 0.5, 0]} castShadow>
                        <cylinderGeometry args={[0.2, 0.2, 14, 8]} />
                        <meshStandardMaterial color="#1e88e5" />
                    </mesh>
                </group>
            ))}
            {[0, 1].map((i) => (
                <group key={i} position={[i * 15 - 7.5, 0, -8.5]}>
                    <mesh position={[0, 1.5, 0]} castShadow>
                        <cylinderGeometry args={[0.6, 0.8, 2, 12]} />
                        <meshStandardMaterial color="#ff9800" metalness={0.5} />
                    </mesh>
                </group>
            ))}
            <mesh position={[0, 1, 8]} castShadow>
                <boxGeometry args={[2, 1.5, 1]} />
                <meshStandardMaterial color="#37474f" />
            </mesh>
            <mesh position={[0, 1.5, 8.51]} castShadow>
                <boxGeometry args={[1.2, 0.8, 0.05]} />
                <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[10, 1.5, 0]} castShadow>
                <boxGeometry args={[4, 3, 4]} />
                <meshStandardMaterial color="#eceff1" />
            </mesh>
            <mesh position={[10, 3.3, 0]} castShadow>
                <boxGeometry args={[4.5, 0.6, 4.5]} />
                <meshStandardMaterial color="#4682B4" />
            </mesh>
            <SolarPanel position={[10, 4, 0]} rotation={[-0.3, 0, 0]} />
            {fishes.map((p, i) => (
                <Fish key={i} position={p} />
            ))}
            <Html position={[0, 6, 0]} center>
                <div className="label-3d fish">🐟 Aquaculture - Smart System</div>
            </Html>
        </group>
    );
};

const Tree = ({ position, type = 'pine' }) =>
    type === 'palm' ? (
        <group position={position}>
            <mesh position={[0, 2, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.3, 4, 6]} />
                <meshStandardMaterial color="#5d4037" />
            </mesh>
            {[0, 72, 144, 216, 288].map((a, i) => {
                const r = (a * Math.PI) / 180;
                return (
                    <mesh key={i} position={[Math.cos(r) * 0.5, 4, Math.sin(r) * 0.5]} rotation={[0.5, r, 0]} castShadow>
                        <boxGeometry args={[0.1, 2.5, 0.8]} />
                        <meshStandardMaterial color="#2e7d32" />
                    </mesh>
                );
            })}
        </group>
    ) : (
        <group position={position}>
            <mesh position={[0, 1.2, 0]} castShadow>
                <cylinderGeometry args={[0.25, 0.35, 2.4, 6]} />
                <meshStandardMaterial color="#5d4037" />
            </mesh>
            <mesh position={[0, 3.5, 0]} castShadow>
                <coneGeometry args={[1.8, 3, 8]} />
                <meshStandardMaterial color="#2e7d32" />
            </mesh>
            <mesh position={[0, 4.8, 0]} castShadow>
                <coneGeometry args={[1.3, 2.5, 8]} />
                <meshStandardMaterial color="#388e3c" />
            </mesh>
        </group>
    );

const Scene = () => (
    <>
        <ambientLight intensity={0.4} />
        <directionalLight
            position={[80, 60, 40]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={200}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
        />
        <directionalLight position={[-50, 30, -30]} intensity={0.3} />
        <Sky sunPosition={[100, 50, 100]} inclination={0.6} azimuth={0.25} turbidity={8} rayleigh={2} />
        <Ground size={180} />
        <CowFarm position={[-40, 0, 0]} />
        <GoatFarm position={[10, 0, -10]} />
        <PoultryFarm position={[-40, 0, 40]} />
        <FishFarm position={[30, 0, 30]} />
        {[[-50, 0, 25], [-55, 0, 10], [50, 0, 30], [55, 0, 5], [-20, 0, 40], [0, 0, 42], [25, 0, 38]].map((p, i) => (
            <Tree key={i} position={p} type={i % 3 ? 'pine' : 'palm'} />
        ))}
        <mesh position={[0, 0.75, 50]} castShadow>
            <boxGeometry args={[120, 1.5, 0.2]} />
            <meshStandardMaterial color="#78909c" />
        </mesh>
        <mesh position={[0, 0.75, -50]} castShadow>
            <boxGeometry args={[120, 1.5, 0.2]} />
            <meshStandardMaterial color="#78909c" />
        </mesh>
        <mesh position={[-60, 0.75, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
            <boxGeometry args={[100, 1.5, 0.2]} />
            <meshStandardMaterial color="#78909c" />
        </mesh>
        <mesh position={[60, 0.75, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
            <boxGeometry args={[100, 1.5, 0.2]} />
            <meshStandardMaterial color="#78909c" />
        </mesh>
        <mesh position={[0, 1.5, 50.2]} castShadow>
            <boxGeometry args={[10, 3, 0.4]} />
            <meshStandardMaterial color="#4caf50" />
        </mesh>
        {[-5.5, 5.5].map((x, i) => (
            <mesh key={i} position={[x, 2, 50.2]} castShadow>
                <boxGeometry args={[0.6, 4, 0.6]} />
                <meshStandardMaterial color="#5d4037" />
            </mesh>
        ))}
    </>
);

const Loader = () => (
    <Html center>
        <div className="loading-screen">
            <div className="spinner" />
            <p>Loading 3D Farm...</p>
        </div>
    </Html>
);

export default function Farm3DVisualization() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="farm-container">
            <div className="farm-header">
                <h1>🌾 Ultra-Realistic Smart Livestock Farm 3D</h1>
                <p>Commercial-Grade Modern Indian Farm with IoT Integration</p>
            </div>

            <div className="time-display">
                ⏰ {time.toLocaleTimeString()}
            </div>

            <div className="controls-info">
                <h3>🎮 Controls</h3>
                <div className="control-row">
                    <span className="control-icon">🖱️</span>
                    <span>Drag to Rotate</span>
                </div>
                <div className="control-row">
                    <span className="control-icon">🔍</span>
                    <span>Scroll to Zoom</span>
                </div>
                <div className="control-row">
                    <span className="control-icon">✋</span>
                    <span>Right-Click to Pan</span>
                </div>
            </div>

            <div className="farm-legend">
                <h3>🏢 Farm Zones</h3>
                <div className="legend-item">
                    <span className="legend-icon">🐄</span>
                    <span>Dairy Farm</span>
                </div>
                <div className="legend-item">
                    <span className="legend-icon">🐐</span>
                    <span>Goat Farm</span>
                </div>
                <div className="legend-item">
                    <span className="legend-icon">🐔</span>
                    <span>Poultry Farm</span>
                </div>
                <div className="legend-item">
                    <span className="legend-icon">🐟</span>
                    <span>Fish Farm</span>
                </div>
                <div className="legend-item">
                    <span className="legend-icon">☀️</span>
                    <span>Solar Powered</span>
                </div>
                <div className="legend-item">
                    <span className="legend-icon">📹</span>
                    <span>IoT Monitored</span>
                </div>
            </div>

            <div className="stats">
                <h3>📊 Farm Statistics</h3>
                <div className="stat-row">
                    <span className="stat-label">Cows:</span>
                    <span className="stat-val">12 Animals</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Goats:</span>
                    <span className="stat-val">15 Animals</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Chickens:</span>
                    <span className="stat-val">30 Birds</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Fish:</span>
                    <span className="stat-val">40+ Stock</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Solar Panels:</span>
                    <span className="stat-val">15 Units</span>
                </div>
            </div>

            <Canvas shadows>
                <Suspense fallback={<Loader />}>
                    <PerspectiveCamera makeDefault position={[80, 50, 80]} fov={45} />
                    <OrbitControls
                        enablePan
                        enableZoom
                        enableRotate
                        minDistance={30}
                        maxDistance={200}
                        maxPolarAngle={Math.PI / 2.1}
                        target={[0, 0, 0]}
                    />
                    <Scene />
                </Suspense>
            </Canvas>
        </div>
    );
}