import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { useCitySync } from "./CitySyncProvider";
import { CheckCircle } from "lucide-react";
import { usePower } from "@/components/PowerProvider";

// ─── Constellation Globe ───
function ConstellationGlobe({ imploding }: { imploding: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Generate icosahedron wireframe vertices
  const { positions, linePositions } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.8, 1);
    const posArray = geo.attributes.position.array as Float32Array;
    const positions = new Float32Array(posArray.length);
    positions.set(posArray);

    // Create line edges
    const edges = new THREE.EdgesGeometry(geo);
    const linePositions = edges.attributes.position.array as Float32Array;

    return { positions, linePositions };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    if (imploding) {
      // Implode: scale down and spin fast
      groupRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), 0.08);
      groupRef.current.rotation.y += 0.15;
    } else {
      groupRef.current.rotation.y = t * 0.15;
      groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    }
  });

  // Gold color
  const goldColor = new THREE.Color().setHSL(43 / 360, 0.72, 0.52);
  const goldGlow = new THREE.Color().setHSL(43 / 360, 0.8, 0.6);

  return (
    <group ref={groupRef}>
      {/* Wireframe lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={goldColor} transparent opacity={0.35} />
      </lineSegments>

      {/* Vertex points (stars) */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={goldGlow}
          size={0.06}
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

// ─── Ping Rings ───
function PingRings({ count }: { count: number }) {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ringsRef.current) return;
    ringsRef.current.children.forEach((ring, i) => {
      const t = state.clock.elapsedTime;
      const scale = 1 + ((t * 0.5 + i * 0.8) % 3);
      ring.scale.set(scale, scale, scale);
      (ring as any).material && ((ring as any).material.opacity = Math.max(0, 1 - scale / 3) * 0.3);
    });
  });

  const goldColor = new THREE.Color().setHSL(43 / 360, 0.72, 0.52);

  return (
    <group ref={ringsRef}>
      {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.9, 2.0, 64]} />
          <meshBasicMaterial
            color={goldColor}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Main Scanning Screen ───
export function ScanningTheStars() {
  const { isScanning, scanComplete, nodesFound, currentCity, theme } = useCitySync();
  const power = usePower();

  if (!isScanning) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
        style={{ background: `hsl(${theme.background})` }}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* 3D Globe */}
        <div className="w-64 h-64 relative">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            style={{ background: "transparent" }}
          >
            <ambientLight intensity={0.5} />
            <ConstellationGlobe imploding={scanComplete} />
            <PingRings count={nodesFound.length} />
          </Canvas>

          {/* Post-implode gold star */}
          <AnimatePresence>
            {scanComplete && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <div className="h-12 w-12 rounded-full gradient-gold glow-gold-strong flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary-foreground" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Title */}
        <motion.h2
          className="font-display text-xl font-bold mt-6 mb-2"
          style={{ color: `hsl(${theme.foreground})` }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {scanComplete ? (currentCity || "Connected") : "Scanning the Stars"}
        </motion.h2>

        <motion.p
          className="text-sm mb-6"
          style={{ color: `hsl(${theme.mutedForeground})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {scanComplete
            ? `${theme.name} theme activated`
            : "Finding your constellation..."}
        </motion.p>

        {/* Node discovery list */}
        <div className="space-y-2 w-48">
          {nodesFound.map((node, i) => (
            <motion.div
              key={node}
              className="flex items-center gap-2 text-xs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <motion.div
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: `hsl(${theme.primary})` }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.5 }}
              />
              <span style={{ color: `hsl(${theme.mutedForeground})` }}>{node}</span>
              <CheckCircle
                className="h-3 w-3 ml-auto"
                style={{ color: `hsl(${theme.primary})` }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
