import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function SoftPulse() {
  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;

    if (ringRef.current) {
      ringRef.current.rotation.z = elapsed * 0.38;
      const pulse = 1 + Math.sin(elapsed * 1.9) * 0.06;
      ringRef.current.scale.setScalar(pulse);
    }

    if (coreRef.current) {
      coreRef.current.position.y = Math.sin(elapsed * 1.6) * 0.08;
      const material = coreRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.28 + ((Math.sin(elapsed * 2.1) + 1) / 2) * 0.22;
    }
  });

  return (
    <group>
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.55, 56, 56]} />
        <meshStandardMaterial
          color="#f5f5ff"
          emissive="#ffffff"
          emissiveIntensity={0.35}
          roughness={0.3}
          metalness={0.12}
          transparent
          opacity={0.94}
        />
      </mesh>

      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.3, 0.11, 32, 140]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.42}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function LoadingScene() {
  return (
    <div className="h-full w-full">
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 33, position: [0, 0, 7.5] }}
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.95} />
          <pointLight position={[3.2, 2.2, 4.8]} intensity={2.7} color="#ffe8ef" />
          <pointLight position={[-3.4, -2.8, 3.8]} intensity={2.2} color="#e6fff8" />
          <SoftPulse />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default LoadingScene;
