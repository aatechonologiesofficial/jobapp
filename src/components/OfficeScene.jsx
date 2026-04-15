import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense } from 'react'

function Desk() {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Desktop */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[2, 0.05, 1]} />
        <meshStandardMaterial color="#5C3A1E" />
      </mesh>
      {/* Legs */}
      {[[-0.9, 0.375, -0.4], [0.9, 0.375, -0.4], [-0.9, 0.375, 0.4], [0.9, 0.375, 0.4]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.05, 0.75, 0.05]} />
          <meshStandardMaterial color="#3D2410" />
        </mesh>
      ))}
    </group>
  )
}

function Monitor() {
  return (
    <group position={[0, 0.6, -0.2]}>
      {/* Screen */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.5, 0.03]} />
        <meshStandardMaterial color="#1a1a2e" emissive="#1a1a2e" emissiveIntensity={0.3} />
      </mesh>
      {/* Screen glow */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[0.75, 0.45]} />
        <meshStandardMaterial color="#0a3d62" emissive="#0a3d62" emissiveIntensity={0.8} />
      </mesh>
      {/* Stand */}
      <mesh position={[0, -0.3, 0.1]}>
        <boxGeometry args={[0.08, 0.15, 0.08]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Base */}
      <mesh position={[0, -0.38, 0.1]}>
        <boxGeometry args={[0.25, 0.02, 0.15]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  )
}

function Chair() {
  return (
    <group position={[0, -0.5, 1.2]}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.5, 0.05, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.75, -0.22]}>
        <boxGeometry args={[0.5, 0.6, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      {/* Base */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.03]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  )
}

function Keyboard() {
  return (
    <mesh position={[0, 0.28, 0.15]}>
      <boxGeometry args={[0.5, 0.02, 0.18]} />
      <meshStandardMaterial color="#2a2a2a" />
    </mesh>
  )
}

function CoffeeMug() {
  return (
    <group position={[0.7, 0.32, 0.1]}>
      <mesh>
        <cylinderGeometry args={[0.04, 0.035, 0.08, 16]} />
        <meshStandardMaterial color="#C89E53" />
      </mesh>
    </group>
  )
}

function Walls() {
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 0.5, -1.5]}>
        <planeGeometry args={[5, 3]} />
        <meshStandardMaterial color="#E8E0D4" />
      </mesh>
      {/* Floor */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 4]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      {/* Left wall */}
      <mesh position={[-2.5, 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4, 3]} />
        <meshStandardMaterial color="#DDD5C8" />
      </mesh>
    </group>
  )
}

function WindowFrame() {
  return (
    <group position={[0, 0.8, -1.48]}>
      {/* Window glass */}
      <mesh>
        <planeGeometry args={[1.2, 0.8]} />
        <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.3} transparent opacity={0.6} />
      </mesh>
      {/* Frame */}
      {[[-0.6, 0, 0], [0.6, 0, 0]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.03, 0.82, 0.02]} />
          <meshStandardMaterial color="#F5F0E8" />
        </mesh>
      ))}
      {[[0, -0.4, 0], [0, 0.4, 0], [0, 0, 0]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[1.22, 0.03, 0.02]} />
          <meshStandardMaterial color="#F5F0E8" />
        </mesh>
      ))}
    </group>
  )
}

function Plant() {
  return (
    <group position={[-1.2, -0.15, -0.8]}>
      {/* Pot */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.06, 0.12, 16]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Plant leaves */}
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#2D5A27" />
      </mesh>
    </group>
  )
}

function FloatingParticles() {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.1
    }
  })
  return (
    <group ref={ref}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[
          Math.sin(i * 0.8) * 1.5,
          Math.cos(i * 0.5) * 0.5 + 0.5,
          Math.sin(i * 1.2) * 0.5 - 0.5
        ]}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshStandardMaterial color="#C89E53" emissive="#C89E53" emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  )
}

export default function OfficeScene({ active }) {
  return (
    <div style={{
      width: '100%',
      height: '220px',
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '16px',
      border: '1px solid var(--border)',
      background: '#1a1a2e'
    }}>
      <Canvas camera={{ position: [0, 0.8, 2.5], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[2, 3, 2]} intensity={1} color="#ffffff" />
        <directionalLight position={[-1, 2, 1]} intensity={0.4} color="#E6CFA1" />
        <pointLight position={[0, 1.5, 0]} intensity={0.6} color="#FFF8DC" />
        {active && <pointLight position={[0, 0.5, 0.5]} intensity={0.3} color="#0a3d62" />}
        <Suspense fallback={null}>
          <Walls />
          <WindowFrame />
          <Desk />
          <Monitor />
          <Chair />
          <Keyboard />
          <CoffeeMug />
          <Plant />
          {active && <FloatingParticles />}
        </Suspense>
      </Canvas>
    </div>
  )
}