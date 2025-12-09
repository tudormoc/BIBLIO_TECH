import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, ContactShadows, Loader } from '@react-three/drei';
import { BookConfiguration, BookPart } from './types';
import { Controls } from './components/Controls';
import { BookModel } from './components/BookModel';
import { InfoPanel } from './components/InfoPanel';

const App: React.FC = () => {
  const [config, setConfig] = useState<BookConfiguration>({
    color: "#2c3e50",
    hasDustJacket: false,
    hasHeadbands: true,
    hasBookmark: true,
    showEndpapers: false,
    explodeView: false,
  });

  const [selectedPart, setSelectedPart] = useState<BookPart | null>(null);

  return (
    <div className="w-full h-screen flex bg-slate-950 text-white overflow-hidden selection:bg-sky-500/30">
      
      {/* Sidebar Controls */}
      <div className="relative z-10 shadow-2xl">
        <Controls config={config} setConfig={setConfig} />
      </div>

      {/* Main 3D Canvas Area */}
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [4, 2, 5], fov: 45 }}>
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
                    onPartClick={setSelectedPart}
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
            />
            
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

        {/* Loading Overlay */}
        <Loader 
          dataInterpolation={(p) => `LOADING ASSETS ${p.toFixed(0)}%`} 
          containerStyles={{ background: 'rgba(15, 23, 42, 0.9)', zIndex: 100 }}
          innerStyles={{ width: '400px' }}
          barStyles={{ height: '4px', background: '#0ea5e9' }}
          dataStyles={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#0ea5e9' }}
        />

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
  );
};

export default App;