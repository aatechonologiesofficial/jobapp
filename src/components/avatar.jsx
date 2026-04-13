import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

function AvatarModel({ phase }) {
  const groupRef = useRef()
  const glowRef = useRef()
  const { scene } = useGLTF('/avatar.glb')

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.03 - 0.2
      if (phase === 'checking') {
        groupRef.current.rotation.x = Math.min(groupRef.current.rotation.x + 0.008, 0.12)
        groupRef.current.rotation.y = Math.sin(t * 1.5) * 0.03
      } else {
        groupRef.current.rotation.x = Math.max(groupRef.current.rotation.x - 0.01, 0)
        groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.08
      }
    }
    if (glowRef.current) {
      if (phase === 'answering') {
        glowRef.current.scale.setScalar(1 + Math.sin(t * 8) * 0.15)
        glowRef.current.material.opacity = 0.3 + Math.sin(t * 6) * 0.2
      } else {
        glowRef.current.scale.setScalar(1)
        glowRef.current.material.opacity = 0
      }
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1.3} position={[0, 0, 0]} />
      <mesh ref={glowRef} position={[0, 1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.03, 8, 32]} />
        <meshStandardMaterial color="#C89E53" emissive="#C89E53" emissiveIntensity={3} transparent opacity={0} />
      </mesh>
    </group>
  )
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="#C89E53" wireframe />
    </mesh>
  )
}

export default function Avatar({ message, phase, keyword, location, onSpeechEnd }) {
  const [speaking, setSpeaking] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const [currentPhase, setCurrentPhase] = useState('idle')
  const [terminalLines, setTerminalLines] = useState([])

  useEffect(() => {
    if (phase) setCurrentPhase(phase)
  }, [phase])

  // Terminal animation
  useEffect(() => {
    if (phase !== 'checking') {
      setTerminalLines([])
      return
    }

    const lines = [
      '> Initializing search...',
      '> Finding jobs for Commander...',
      `> Scanning: "${keyword || 'all'}"`,
      `> Location: ${location || 'India'}`,
      '> Connecting APIs...',
      '> Filtering results...',
      '> Checking trust scores...',
      '> Verifying data...',
      '> Compiling results...',
      '> COMPLETE ✓',
    ]

    let index = 0
    setTerminalLines([])
    const interval = setInterval(() => {
      if (index < lines.length) {
        setTerminalLines(prev => [...prev, lines[index]])
        index++
      } else {
        clearInterval(interval)
      }
    }, 250)

    return () => clearInterval(interval)
  }, [phase, keyword, location])

  // Speaking when answering
  useEffect(() => {
    if (message && phase === 'answering') {
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
        setCurrentPhase('idle')
        if (onSpeechEnd) onSpeechEnd()
      }
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    }
  }, [message, phase])

  // Speak when checking
  useEffect(() => {
    if (phase === 'checking') {
      setDisplayText('')
      const utterance = new SpeechSynthesisUtterance('Finding jobs for you, Commander')
      utterance.rate = 1.1
      utterance.pitch = 0.9
      utterance.volume = 1
      const voices = window.speechSynthesis.getVoices()
      const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
        || voices.find(v => v.lang.startsWith('en'))
      if (englishVoice) utterance.voice = englishVoice
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    }
  }, [phase])

  return (
    <div className="avatar-container">
      <div className="avatar-3d" style={{ position: 'relative' }}>
        <Canvas camera={{ position: [0, 0.5, 5], fov: 30 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 5, 3]} intensity={1.5} color="#ffffff" />
          <directionalLight position={[-2, 3, 2]} intensity={0.6} color="#E6CFA1" />
          <pointLight position={[0, 2, 3]} intensity={0.8} color="#C89E53" />
          <Suspense fallback={<LoadingFallback />}>
            <AvatarModel phase={currentPhase} />
          </Suspense>
        </Canvas>

        {/* Terminal overlay inside avatar box */}
        {currentPhase === 'checking' && (
          <div className="terminal-overlay">
            <div className="terminal-mini">
              <div className="terminal-mini-header">
                <span className="td red"></span>
                <span className="td yellow"></span>
                <span className="td green"></span>
                <span className="terminal-mini-title">SEARCH</span>
              </div>
              <div className="terminal-mini-body">
                {terminalLines.map((line, i) => (
                  <div key={i} className="tl">{line}</div>
                ))}
                <span className="tc">█</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {displayText && currentPhase !== 'checking' && (
        <div className="avatar-speech">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {speaking && (
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                <span style={{ width: '4px', height: '12px', background: '#C89E53', borderRadius: '2px', animation: 'wave 0.5s ease-in-out infinite' }}></span>
                <span style={{ width: '4px', height: '18px', background: '#C89E53', borderRadius: '2px', animation: 'wave 0.5s ease-in-out 0.1s infinite' }}></span>
                <span style={{ width: '4px', height: '10px', background: '#C89E53', borderRadius: '2px', animation: 'wave 0.5s ease-in-out 0.2s infinite' }}></span>
                <span style={{ width: '4px', height: '16px', background: '#C89E53', borderRadius: '2px', animation: 'wave 0.5s ease-in-out 0.3s infinite' }}></span>
              </div>
            )}
            <p>{displayText}</p>
          </div>
        </div>
      )}
    </div>
  )
}