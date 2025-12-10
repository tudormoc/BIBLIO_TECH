import React, { useState, useRef, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, ContactShadows } from '@react-three/drei';
import { BookConfiguration, BookPart } from './types';
import { Controls } from './components/Controls';
import { BookModel } from './components/BookModel';
import { InfoPanel } from './components/InfoPanel';
import { LoadingScreen } from './components/LoadingScreen';
import { TIMING } from './config/timing';

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [config, setConfig] = useState<BookConfiguration>({
    color: "#2c3e50",
    hasDustJacket: false,
    hasHeadbands: true,
    hasBookmark: true,
    showEndpapers: false,
    explodeView: false,
  });

  const [selectedPart, setSelectedPart] = useState<BookPart | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Memoize callbacks to prevent BookModel re-renders
  const handlePartClick = useCallback((part: BookPart) => {
    setSelectedPart(part);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - dragStartPos.current.x);
    const dy = Math.abs(e.clientY - dragStartPos.current.y);
    if (dx > 5 || dy > 5) {
      isDraggingRef.current = true;
    }
  };

  const handleBackgroundClick = () => {
    if (!isDraggingRef.current) {
      setSelectedPart(null);
    }
  };

  // Handle Canvas ready with delay to ensure models are rendered and shaders compiled
  const handleCanvasReady = () => {
    // Warm-up: trigger a selection to preload all rendering paths
    setTimeout(() => {
      setSelectedPart('cover');
      setTimeout(() => {
        setSelectedPart(null);
        setFadeOut(true);
        setTimeout(() => setIsReady(true), 500);
      }, 100);
    }, TIMING.INITIAL_LOADING);
  };

  return (
    <>
      {/* Loading screen with fade out */}
      {!isReady && (
        <div className={`transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
          <LoadingScreen />
        </div>
      )}
      
      <div className="w-full h-screen flex bg-slate-950 text-white overflow-hidden selection:bg-sky-500/30">
      
      {/* Sidebar Controls */}
      <div className="relative z-10 shadow-2xl">
        <Controls config={config} setConfig={setConfig} />
      </div>

      {/* Main 3D Canvas Area */}
      <div 
        className="flex-1 relative"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <Canvas 
          shadows 
          camera={{ position: [4, 2, 5], fov: 45 }}
          onCreated={handleCanvasReady}
        >
          <color attach="background" args={['#0f172a']} />
          
          <Suspense fallback={null}>
             {/* Lighting */}
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0ea5e9" />
            
            {/* Environment Reflection */}
            <Environment preset="city" />

            {/* Book Positioned to sit on Y = -2.2 floor */}
            {/* Book Half Height is 2.0. So center should be at -0.2 */}
            <group position={[0, -0.2, 0]}>
                <BookModel 
                    config={config} 
                    onPartClick={handlePartClick}
                    highlightedPart={selectedPart}
                />
                <ContactShadows position={[0, -2.05, 0]} opacity={0.4} scale={10} blur={2} far={4} />
            </group>

            {/* Schematic Grid Floor */}
            <Grid 
                position={[0, -2.2, 0]} 
                args={[10.5, 10.5]} 
                cellColor="#1e293b" 
                sectionColor="#334155" 
                fadeDistance={20} 
                onClick={handleBackgroundClick}
            />
            
            {/* Invisible background plane to catch clicks */}
            <mesh position={[0, 0, -5]} onClick={handleBackgroundClick}>
              <planeGeometry args={[100, 100]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
            
            <OrbitControls 
                makeDefault 
                minPolarAngle={0} 
                maxPolarAngle={Math.PI / 1.75}
                enablePan={false}
                minDistance={3}
                maxDistance={15}
            />
          </Suspense>
        </Canvas>



        {/* Info Panel Overlay */}
        <InfoPanel 
            selectedPart={selectedPart} 
            onClose={() => setSelectedPart(null)} 
        />
        
        {/* Simple Label at bottom center */}
        {!selectedPart && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700 backdrop-blur pointer-events-none animate-pulse">
                <p className="text-xs text-slate-400 font-mono">CLICK 3D MODEL TO INSPECT</p>
            </div>
        )}
      </div>
    </div>
    </>
  );
};

export default App;