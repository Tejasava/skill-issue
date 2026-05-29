import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function Particles({ count = 500 }) {
  const mesh = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
      mesh.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#3B82F6" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function FloatingShape({ position, color, size = 1 }: { position: [number, number, number]; color: string; size?: number }) {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.3;
      mesh.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={mesh} position={position} scale={size}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial color={color} transparent opacity={0.3} distort={0.4} speed={2} roughness={0.2} />
      </mesh>
    </Float>
  );
}

function Torus({ position, color }: { position: [number, number, number]; color: string }) {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.5;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={1.5} floatIntensity={1.5}>
      <mesh ref={mesh} position={position}>
        <torusGeometry args={[0.8, 0.3, 16, 32]} />
        <MeshDistortMaterial color={color} transparent opacity={0.25} distort={0.3} speed={3} />
      </mesh>
    </Float>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#3B82F6" />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="#8B5CF6" />
        <pointLight position={[0, 5, -5]} intensity={0.4} color="#06B6D4" />

        <FloatingShape position={[-3, 1, -2]} color="#3B82F6" size={0.8} />
        <FloatingShape position={[3, -1, -1]} color="#8B5CF6" size={0.6} />
        <FloatingShape position={[1, 2, -3]} color="#06B6D4" size={0.5} />
        <Torus position={[-2, -2, -2]} color="#8B5CF6" />
        <Torus position={[3, 2, -3]} color="#3B82F6" />

        <Particles count={600} />
      </Canvas>
    </div>
  );
}
