import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

function StylishAvatar({ speaking }) {
  const groupRef = useRef()
  const headRef = useRef()
  const mouthRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.03
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.08
    }
    if (headRef.current) {
      headRef.current.rotation.z = Math.sin(t * 1.5) * 0.03
    }
    if (mouthRef.current) {
      if (speaking) {
        mouthRef.current.scale.y = 0.5 + Math.sin(t * 14) * 0.5
      } else {
        mouthRef.current.scale.y = 0.6
      }
    }
  })

  return (
    <group ref={groupRef}>
      {/* Shoes */}
      <mesh position={[-0.12, -1.45, 0.05]}>
        <boxGeometry args={[0.14, 0.06, 0.25]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.12, -1.45, 0.05]}>
        <boxGeometry args={[0.14, 0.06, 0.25]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.1, -1.05, 0]}>
        <capsuleGeometry args={[0.07, 0.5, 8, 8]} />
        <meshStandardMaterial color="#f0eff4" roughness={0.4} />
      </mesh>
      <mesh position={[0.1, -1.05, 0]}>
        <capsuleGeometry args={[0.07, 0.5, 8, 8]} />
        <meshStandardMaterial color="#f0eff4" roughness={0.4} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, -0.5, 0]}>
        <capsuleGeometry args={[0.22, 0.4, 8, 16]} />
        <meshStandardMaterial color="#f0eff4" roughness={0.3} />
      </mesh>

      {/* Tie */}
      <mesh position={[0, -0.45, 0.2]}>
        <boxGeometry args={[0.06, 0.25, 0.02]} />
        <meshStandardMaterial color="#7c6cf0" emissive="#7c6cf0" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, -0.32, 0.21]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#7c6cf0" emissive="#7c6cf0" emissiveIntensity={0.4} />
      </mesh>

      {/* Buttons */}
      {[-0.48, -0.58, -0.68].map((y, i) => (
        <mesh key={i} position={[0, y, 0.22]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color="#d8d6e0" metalness={0.8} />
        </mesh>
      ))}

      {/* Left Arm */}
      <mesh position={[-0.3, -0.45, 0]}>
        <capsuleGeometry args={[0.065, 0.35, 8, 8]} />
        <meshStandardMaterial color="#f0eff4" roughness={0.3} />
      </mesh>
      <mesh position={[-0.3, -0.7, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#c8956c" roughness={0.6} />
      </mesh>

      {/* Right Arm */}
      <mesh position={[0.3, -0.45, 0]}>
        <capsuleGeometry args={[0.065, 0.35, 8, 8]} />
        <meshStandardMaterial color="#f0eff4" roughness={0.3} />
      </mesh>
      <mesh position={[0.3, -0.7, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#c8956c" roughness={0.6} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.08, 8]} />
        <meshStandardMaterial color="#c8956c" roughness={0.6} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, -0.05, 0]}>
        <mesh>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#c8956c" roughness={0.55} />
        </mesh>

        {/* Hair */}
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.185, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
        </mesh>

        {/* Eyebrows */}
        <mesh position={[-0.07, 0.06, 0.16]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.06, 0.012, 0.01]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[0.07, 0.06, 0.16]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.06, 0.012, 0.01]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.065, 0.02, 0.165]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.065, 0.02, 0.185]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshStandardMaterial color="#2a4a7f" />
        </mesh>
        <mesh position={[-0.065, 0.02, 0.195]}>
          <sphereGeometry args={[0.007, 8, 8]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0.065, 0.02, 0.165]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.065, 0.02, 0.185]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshStandardMaterial color="#2a4a7f" />
        </mesh>
        <mesh position={[0.065, 0.02, 0.195]}>
          <sphereGeometry args={[0.007, 8, 8]} />
          <meshStandardMaterial color="#000000" />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.02, 0.18]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#c8956c" roughness={0.55} />
        </mesh>

        {/* Mouth */}
        <mesh ref={mouthRef} position={[0, -0.07, 0.17]}>
          <boxGeometry args={[0.06, 0.015, 0.01]} />
          <meshStandardMaterial color="#b06060" />
        </mesh>

        {/* Ears */}
        <mesh position={[-0.18, 0, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#c8956c" roughness={0.6} />
        </mesh>
        <mesh position={[0.18, 0, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#c8956c" roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

export default function Avatar({ message, onSpeechEnd }) {
  const [speaking, setSpeaking] = useState(false)
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    if (message) {
      setDisplayText(message)
      setSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 1
      utterance.pitch = 0.9
      utterance.volume = 1
      const voices = window.speechSynthesis.getVoices()
      const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
        || voices.find(v => v.lang.startsWith('en'))
      if (englishVoice) utterance.voice = englishVoice
      utterance.onend = () => {
        setSpeaking(false)
        if (onSpeechEnd) onSpeechEnd()
      }
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    }
  }, [message])

  return (
    <div className="avatar-container">
      <div className="avatar-3d">
        <Canvas camera={{ position: [0, -0.3, 2.5], fov: 40 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 5, 3]} intensity={1.2} color="#ffffff" />
          <directionalLight position={[-2, 3, 2]} intensity={0.6} color="#a0c4ff" />
          <pointLight position={[0, 2, 3]} intensity={0.8} color="#7c6cf0" />
          <StylishAvatar speaking={speaking} />
        </Canvas>
      </div>
      {displayText && (
        <div className="avatar-speech">
          <p>{displayText}</p>
        </div>
      )}
    </div>
  )
}