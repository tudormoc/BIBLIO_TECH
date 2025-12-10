import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Outlines, Edges, Text } from '@react-three/drei';
import * as THREE from 'three';
import { BookPart } from '../types';
import { bookPartsData } from '../data/bookPartsData';

interface BookModelProps {
  config: {
    color: string;
    hasDustJacket: boolean;
    hasHeadbands: boolean;
    hasBookmark: boolean;
    showEndpapers: boolean;
    explodeView: boolean;
  };
  onPartClick: (part: BookPart) => void;
  highlightedPart: BookPart | null;
}

// --- COLOR PALETTE ---
const COLORS = {
  SCHEMATIC: "#00ffff",       // Cyan for schematic lines
  PAPER: "#f5f5dc",           // Beige/Cream for pages
  RIBBON: "#820707",          // Ribbon
  BANDS: "#c0842b",           // Bands
  SPINE_LINER: "#d1d5db",     // Light Grey for the Mull/Liner
  SEWING: "#78716c",          // Stone Grey for threads
  ENDPAPER: "#f0f0f0",        // Off-white for endpapers
  PAGE_EDGES_NORMAL: "#e5e5c0",
  PAGE_EDGES_XRAY: "#d4d4d4",
  DUST_JACKET_TINT: "#22d3ee", // Cyan tint for the transparent jacket
  HIGHLIGHT: "#ff00aa"        // Pink for selection
};

// Dimensions
const BOOK_HEIGHT = 4.0;
const BOOK_WIDTH = 3.0; // Cover width
const BOOK_THICKNESS = 0.8; // Textblock thickness
const COVER_THICKNESS = 0.08;
const TEXTBLOCK_WIDTH = BOOK_WIDTH - 0.15; // Slightly recessed from cover edge

const createMarbleTextureData = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if(ctx) {
        // Marbled paper look
        ctx.fillStyle = '#eee';
        ctx.fillRect(0,0,128,128);
        
        for(let i=0; i<20; i++) {
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${Math.random()*360}, 50%, 50%, 0.5)`;
            ctx.lineWidth = Math.random() * 5;
            ctx.moveTo(0, Math.random()*128);
            ctx.bezierCurveTo(
                Math.random()*128, Math.random()*128, 
                Math.random()*128, Math.random()*128, 
                128, Math.random()*128
            );
            ctx.stroke();
        }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
};

const BookModelComponent: React.FC<BookModelProps> = ({ config, onPartClick, highlightedPart }) => {
  const groupRef = useRef<THREE.Group>(null);
  const spineRef = useRef<THREE.Group>(null);
  const bandsRef = useRef<THREE.Group>(null);
  const frontCoverRef = useRef<THREE.Group>(null);
  const backCoverRef = useRef<THREE.Group>(null);
  
  // Independent refs for Dust Jacket parts to follow their parents
  const jacketFrontRef = useRef<THREE.Group>(null);
  const jacketBackRef = useRef<THREE.Group>(null);
  const jacketSpineRef = useRef<THREE.Group>(null);

  // Memoize textures to improve performance and prevent re-generation on render
  const marbleTexture = useMemo(() => createMarbleTextureData(), []);

  // Animation for explode view
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const targetExpansion = config.explodeView ? 1 : 0;
    const lerpSpeed = 4 * delta;

    // --- MAIN BOOK PARTS ---

    // Animate Front Cover Z+
    let frontZ = (BOOK_THICKNESS/2 + COVER_THICKNESS/2);
    if (frontCoverRef.current) {
        frontZ += (targetExpansion * 1.5);
        frontCoverRef.current.position.z = THREE.MathUtils.lerp(frontCoverRef.current.position.z, frontZ, lerpSpeed);
    }

    // Animate Back Cover Z-
    let backZ = -(BOOK_THICKNESS/2 + COVER_THICKNESS/2);
    if (backCoverRef.current) {
        backZ -= (targetExpansion * 1.5);
        backCoverRef.current.position.z = THREE.MathUtils.lerp(backCoverRef.current.position.z, backZ, lerpSpeed);
    }

    // Animate Spine X- (Move away from textblock)
    let spineX = -(TEXTBLOCK_WIDTH/2) - COVER_THICKNESS/2;
    if (spineRef.current) {
        spineX -= (targetExpansion * 1.5);
        spineRef.current.position.x = THREE.MathUtils.lerp(spineRef.current.position.x, spineX, lerpSpeed);
    }

    // Animate Bands X- (Move halfway between textblock and spine)
    if (bandsRef.current) {
        bandsRef.current.position.x = THREE.MathUtils.lerp(
            bandsRef.current.position.x, 
            (-(TEXTBLOCK_WIDTH/2) + 0.05) - (targetExpansion * 0.8), 
            lerpSpeed
        );
    }

    // --- DUST JACKET FOLLOWING LOGIC ---
    
    // Jacket Front follows Front Cover Z + slight offset
    if (jacketFrontRef.current) {
        jacketFrontRef.current.position.z = THREE.MathUtils.lerp(
            jacketFrontRef.current.position.z, 
            frontZ + COVER_THICKNESS + 0.015 + (targetExpansion * 0.1), // Add extra gap when exploded
            lerpSpeed
        );
    }

    // Jacket Back follows Back Cover Z + slight offset
    if (jacketBackRef.current) {
        jacketBackRef.current.position.z = THREE.MathUtils.lerp(
            jacketBackRef.current.position.z, 
            backZ - (COVER_THICKNESS + 0.015) - (targetExpansion * 0.1), 
            lerpSpeed
        );
    }

    // Jacket Spine follows Spine Board X + slight offset
    if (jacketSpineRef.current) {
         jacketSpineRef.current.position.x = THREE.MathUtils.lerp(
            jacketSpineRef.current.position.x, 
            spineX - (COVER_THICKNESS/2) - 0.015 - (targetExpansion * 0.1), 
            lerpSpeed
        );
    }
  });

  // Highlighting Logic
  const getMaterialProps = (partName: BookPart) => {
    const isSelected = highlightedPart === partName;
    const isXray = config.showEndpapers;
    
    // X-Ray Mode handling
    if (isXray) {
        if (partName === 'cover' || partName === 'spine') {
            return {
                color: isSelected ? COLORS.HIGHLIGHT : "#ffffff", // Ghostly white if not selected
                transparent: true,
                opacity: 0.1,
                roughness: 1, // Full roughness to avoid glossy reflections in X-ray
                metalness: 0,
                wireframe: true, // Wireframe for technical X-Ray look
                side: THREE.DoubleSide
            };
        }
    }

    // Normal Mode or specific overrides
    return {
      color: isSelected ? COLORS.HIGHLIGHT : config.color,
      roughness: 0.7,
      metalness: 0.1,
      transparent: false,
      opacity: 1
    };
  };

  const outlineThickness = 0.02;

  // The spine board width matches the total thickness of the book
  const SPINE_WIDTH_TOTAL = BOOK_THICKNESS + (COVER_THICKNESS * 2);

  return (
    <group ref={groupRef} rotation={[0, -Math.PI / 6, 0]}>
      
      {/* Hidden preloader for Outlines shader - prevents first-click lag */}
      <mesh visible={false}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial />
        <Outlines thickness={0.01} color="#000000" />
      </mesh>
      
      {/* --- TEXT BLOCK --- */}
      <group position={[0.05, 0, 0]} onClick={(e) => { e.stopPropagation(); onPartClick('textblock'); }}>
        <RoundedBox args={[TEXTBLOCK_WIDTH, BOOK_HEIGHT - 0.2, BOOK_THICKNESS]} radius={0.01} smoothness={2}>
          <meshStandardMaterial 
            // In X-Ray mode, use PAPER color with transparency, instead of pure white
            color={COLORS.PAPER} 
            transparent={config.showEndpapers} 
            // Increased opacity to 0.55 so we see it has color, but still see ribbon inside
            opacity={config.showEndpapers ? 0.55 : 1}
            // High roughness prevents environment reflection from blocking the view
            roughness={config.showEndpapers ? 1.0 : 0.8}
            metalness={0}
            // Disable depth write in X-ray mode so internal opaque objects (ribbon) render correctly
            depthWrite={!config.showEndpapers}
            // Ensure double sided rendering so transparency works from all angles
            side={THREE.DoubleSide}
          />
          {/* Page edge texture lines */}
          {config.showEndpapers && <Edges color={COLORS.PAGE_EDGES_XRAY} threshold={15} />}
          {!config.showEndpapers && <Edges color={COLORS.PAGE_EDGES_NORMAL} threshold={30} />}
          {highlightedPart === 'textblock' && <Outlines thickness={outlineThickness} color={COLORS.SCHEMATIC} />}
        </RoundedBox>
        
        {/* Sewing Threads (Always render but hidden by spine usually) */}
        <group position={[-(TEXTBLOCK_WIDTH/2) - 0.01, 0, 0]}>
            {/* 5 Binding stations / sewing positions */}
            {[-1.5, -0.75, 0, 0.75, 1.5].map((y, i) => (
                <mesh 
                    key={i} 
                    position={[0, y, 0]} 
                    rotation={[Math.PI/2, 0, 0]} 
                    onClick={(e) => { e.stopPropagation(); onPartClick('sewing'); }}
                >
                    {/* Rotated 90deg on X to run across the Z-axis (thickness) */}
                    <cylinderGeometry args={[0.015, 0.015, BOOK_THICKNESS - 0.1, 8]} />
                    {/* Darker stone color for visibility on white paper */}
                    <meshStandardMaterial 
                        color={highlightedPart === 'sewing' ? COLORS.HIGHLIGHT : COLORS.SEWING} 
                        emissive={highlightedPart === 'sewing' ? COLORS.HIGHLIGHT : "#000000"}
                        emissiveIntensity={highlightedPart === 'sewing' ? 2 : 0}
                    /> 
                </mesh>
            ))}
            {/* Kettle stitch connections schematic (Vertical lines connecting stations) */}
                <mesh position={[0, 0, 0]} rotation={[0,0,0]} onClick={(e) => { e.stopPropagation(); onPartClick('sewing'); }}>
                <planeGeometry args={[0.02, BOOK_HEIGHT - 0.4]} />
                <meshBasicMaterial 
                    color={highlightedPart === 'sewing' ? COLORS.HIGHLIGHT : "#a8a29e"} 
                    opacity={0.8} 
                    transparent 
                    side={THREE.DoubleSide} 
                />
            </mesh>
        </group>
      </group>

      {/* --- SPINE STRUCTURE (LINER + BANDS) --- */}
      {/* Moved into a ref group for animation */}
      {config.hasHeadbands && (
        <group ref={bandsRef} position={[-(TEXTBLOCK_WIDTH/2) + 0.05, 0, 0]}> 
            {/* Spine Liner / Mull (Square Flat Back) */}
            <mesh onClick={(e) => { e.stopPropagation(); onPartClick('spine'); }} position={[-0.055, 0, 0]}>
                 <boxGeometry args={[0.01, BOOK_HEIGHT - 0.25, BOOK_THICKNESS - 0.02]} />
                 <meshStandardMaterial color={COLORS.SPINE_LINER} transparent opacity={0.9} roughness={1} />
            </mesh>

            {/* Headband (Flat Square) */}
            <group 
                position={[-0.055, (BOOK_HEIGHT/2) - 0.11, 0]} 
                onClick={(e) => { e.stopPropagation(); onPartClick('headband'); }}
            >
                 <mesh>
                   <boxGeometry args={[0.04, 0.06, BOOK_THICKNESS - 0.02]} />
                   <meshStandardMaterial 
                        color={highlightedPart === 'headband' ? COLORS.HIGHLIGHT : COLORS.BANDS} 
                        emissive={highlightedPart === 'headband' ? COLORS.HIGHLIGHT : COLORS.BANDS}
                        // High emissive intensity to match ribbon visibility in X-ray
                        emissiveIntensity={3}
                        toneMapped={false}
                   />
                   <Outlines thickness={0.005} color={highlightedPart === 'headband' ? COLORS.SCHEMATIC : 'gray'} />
                 </mesh>
            </group>

            {/* Tailband (Flat Square) */}
            <group 
                position={[-0.055, -(BOOK_HEIGHT/2) + 0.11, 0]} 
                onClick={(e) => { e.stopPropagation(); onPartClick('tailband'); }}
            >
                 <mesh>
                   <boxGeometry args={[0.04, 0.06, BOOK_THICKNESS - 0.02]} />
                   <meshStandardMaterial 
                        color={highlightedPart === 'tailband' ? COLORS.HIGHLIGHT : COLORS.BANDS} 
                        emissive={highlightedPart === 'tailband' ? COLORS.HIGHLIGHT : COLORS.BANDS}
                        emissiveIntensity={3}
                        toneMapped={false}
                   />
                   <Outlines thickness={0.005} color={highlightedPart === 'tailband' ? COLORS.SCHEMATIC : 'gray'} />
                 </mesh>
            </group>
        </group>
      )}


      {/* --- COVER CASE --- */}

      {/* Front Board */}
      <group ref={frontCoverRef} position={[0, 0, BOOK_THICKNESS/2 + COVER_THICKNESS/2]} onClick={(e) => { e.stopPropagation(); onPartClick('cover'); }}>
        <RoundedBox args={[BOOK_WIDTH, BOOK_HEIGHT, COVER_THICKNESS]} radius={0.01} smoothness={2}>
          <meshStandardMaterial {...getMaterialProps('cover')} depthWrite={true} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
          {/* In X-Ray mode, show edges to define the board */}
          {config.showEndpapers && <Edges color="white" opacity={0.3} transparent />}
          {highlightedPart === 'cover' && <Outlines thickness={outlineThickness} color={COLORS.SCHEMATIC} />}
        </RoundedBox>
        
        {/* Endpaper Front */}
        <group position={[0, 0, -COVER_THICKNESS/2 - 0.001]}>
            <mesh onClick={(e) => {e.stopPropagation(); onPartClick('endpapers')}}>
                <planeGeometry args={[BOOK_WIDTH - 0.05, BOOK_HEIGHT - 0.05]} />
                <meshStandardMaterial 
                    color={COLORS.ENDPAPER} 
                    side={THREE.DoubleSide} 
                    transparent={config.showEndpapers} 
                    opacity={config.showEndpapers ? 0.4 : 1}
                    map={marbleTexture}
                    alphaTest={config.showEndpapers ? 0 : undefined}
                />
                {highlightedPart === 'endpapers' && <Outlines thickness={0.01} color={COLORS.SCHEMATIC} />}
            </mesh>
        </group>
      </group>

      {/* Back Board */}
      <group ref={backCoverRef} position={[0, 0, -(BOOK_THICKNESS/2 + COVER_THICKNESS/2)]} onClick={(e) => { e.stopPropagation(); onPartClick('cover'); }}>
        <RoundedBox args={[BOOK_WIDTH, BOOK_HEIGHT, COVER_THICKNESS]} radius={0.01} smoothness={2}>
          <meshStandardMaterial {...getMaterialProps('cover')} depthWrite={true} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
          {config.showEndpapers && <Edges color="white" opacity={0.3} transparent />}
          {highlightedPart === 'cover' && <Outlines thickness={outlineThickness} color={COLORS.SCHEMATIC} />}
        </RoundedBox>

         {/* Endpaper Back */}
         <group position={[0, 0, COVER_THICKNESS/2 + 0.001]}>
            <mesh onClick={(e) => {e.stopPropagation(); onPartClick('endpapers')}} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[BOOK_WIDTH - 0.05, BOOK_HEIGHT - 0.05]} />
                <meshStandardMaterial 
                    color={COLORS.ENDPAPER} 
                    side={THREE.DoubleSide} 
                    transparent={config.showEndpapers} 
                    opacity={config.showEndpapers ? 0.4 : 1}
                    map={marbleTexture}
                    alphaTest={config.showEndpapers ? 0 : undefined}
                />
                {highlightedPart === 'endpapers' && <Outlines thickness={0.01} color={COLORS.SCHEMATIC} />}
            </mesh>
        </group>
      </group>

      {/* Spine Board (Square Outer Case) */}
      <group ref={spineRef} position={[-(TEXTBLOCK_WIDTH/2) - COVER_THICKNESS/2, 0, 0]} onClick={(e) => { e.stopPropagation(); onPartClick('spine'); }}>
         {/* Square spine is just a box */}
         <mesh>
            <boxGeometry args={[COVER_THICKNESS, BOOK_HEIGHT + 0.04, SPINE_WIDTH_TOTAL]} />
            <meshStandardMaterial {...getMaterialProps('spine')} depthWrite={true} polygonOffset polygonOffsetFactor={2} polygonOffsetUnits={2} />
            {highlightedPart === 'spine' && <Outlines thickness={outlineThickness} color={COLORS.SCHEMATIC} />}
         </mesh>
      </group>


      {/* --- EXTRAS --- */}

      {/* Bookmark Ribbon */}
      {config.hasBookmark && (
        <group position={[-(TEXTBLOCK_WIDTH/2) + 0.1, (BOOK_HEIGHT/2) - 0.05, 0]} onClick={(e) => { e.stopPropagation(); onPartClick('bookmark'); }}>
           {/* Rotated on Z to tuck into the book block */}
           <mesh position={[0.101, -2.1, 0.05]} rotation={[0, 0, 0.02]} renderOrder={2}>
              <boxGeometry args={[0.15, 4.2, 0.03]} />
              <meshStandardMaterial 
                color={highlightedPart === 'bookmark' ? COLORS.HIGHLIGHT : COLORS.RIBBON} 
                side={THREE.DoubleSide} 
                transparent={false}
                opacity={1}
                // High emissive intensity and toneMapped=false ensure it burns through the ghosted textblock
                emissive={highlightedPart === 'bookmark' ? COLORS.HIGHLIGHT : COLORS.RIBBON}
                emissiveIntensity={highlightedPart === 'bookmark' ? 3 : 3}
                toneMapped={false}
                // In X-Ray mode, disable depthTest to force it to render 'through' the textblock at all angles
                depthTest={!config.showEndpapers}
              />
              {highlightedPart === 'bookmark' && <Outlines thickness={0.02} color={COLORS.SCHEMATIC} />}
           </mesh>
        </group>
      )}

      {/* Dust Jacket (Separated into independent parts for animation) */}
      {config.hasDustJacket && (
        <group onClick={(e) => {e.stopPropagation(); onPartClick('dustjacket')}}>
             
             {/* Front Jacket Panel */}
             <group ref={jacketFrontRef} position={[0, 0, (BOOK_THICKNESS/2) + COVER_THICKNESS + 0.015]}>
                <mesh>
                    <planeGeometry args={[BOOK_WIDTH, BOOK_HEIGHT + 0.02]} />
                    <meshStandardMaterial color={COLORS.DUST_JACKET_TINT} transparent opacity={0.3} side={THREE.DoubleSide} roughness={0.4} />
                    <Edges color={COLORS.DUST_JACKET_TINT} opacity={0.5} />
                </mesh>
                {/* Front Edge Wrap */}
                <mesh position={[BOOK_WIDTH/2 + 0.01, 0, -0.015]} rotation={[0, Math.PI/2, 0]}>
                    <planeGeometry args={[COVER_THICKNESS + 0.02, BOOK_HEIGHT + 0.02]} />
                    <meshStandardMaterial color={COLORS.DUST_JACKET_TINT} transparent opacity={0.3} side={THREE.DoubleSide} />
                </mesh>
                {/* Front Flap */}
                 <mesh position={[BOOK_WIDTH/2 - 0.2, 0, -(COVER_THICKNESS/2) - 0.02]} rotation={[0, 0, 0]}>
                    <planeGeometry args={[0.4, BOOK_HEIGHT + 0.01]} />
                    <meshStandardMaterial color={COLORS.DUST_JACKET_TINT} transparent opacity={0.2} side={THREE.DoubleSide} />
                 </mesh>
             </group>

             {/* Back Jacket Panel */}
             <group ref={jacketBackRef} position={[0, 0, -(BOOK_THICKNESS/2 + COVER_THICKNESS + 0.015)]}>
                 <mesh rotation={[0, Math.PI, 0]}>
                    <planeGeometry args={[BOOK_WIDTH, BOOK_HEIGHT + 0.02]} />
                    <meshStandardMaterial color={COLORS.DUST_JACKET_TINT} transparent opacity={0.3} side={THREE.DoubleSide} roughness={0.4} />
                    <Edges color={COLORS.DUST_JACKET_TINT} opacity={0.5} />
                 </mesh>
                 {/* Back Edge Wrap */}
                 <mesh position={[BOOK_WIDTH/2 + 0.01, 0, 0.015]} rotation={[0, Math.PI/2, 0]}>
                    <planeGeometry args={[COVER_THICKNESS + 0.02, BOOK_HEIGHT + 0.02]} />
                    <meshStandardMaterial color={COLORS.DUST_JACKET_TINT} transparent opacity={0.3} side={THREE.DoubleSide} />
                 </mesh>
                 {/* Back Flap */}
                 <mesh position={[BOOK_WIDTH/2 - 0.2, 0, (COVER_THICKNESS/2) + 0.02]} rotation={[0, 0, 0]}>
                    <planeGeometry args={[0.4, BOOK_HEIGHT + 0.01]} />
                    <meshStandardMaterial color={COLORS.DUST_JACKET_TINT} transparent opacity={0.2} side={THREE.DoubleSide} />
                 </mesh>
             </group>

             {/* Spine Jacket Panel */}
             <group ref={jacketSpineRef} position={[-(TEXTBLOCK_WIDTH/2) - COVER_THICKNESS - 0.015, 0, 0]}>
                 <mesh rotation={[0, -Math.PI/2, 0]}>
                    <planeGeometry args={[SPINE_WIDTH_TOTAL + 0.01, BOOK_HEIGHT + 0.02]} />
                    <meshStandardMaterial color={COLORS.DUST_JACKET_TINT} transparent opacity={0.3} side={THREE.DoubleSide} roughness={0.4} />
                    <Edges color={COLORS.DUST_JACKET_TINT} opacity={0.5} />
                 </mesh>
             </group>
             
             {highlightedPart === 'dustjacket' && <Text position={[0, 2.5, 0]} fontSize={0.2} color={COLORS.DUST_JACKET_TINT}>Dust Jacket</Text>}
        </group>
      )}

      {/* Floating Label for All Selected Parts */}
      {highlightedPart && (
        <Text position={[0, 2.5, 0]} fontSize={0.2} color={COLORS.SCHEMATIC}>
          {bookPartsData[highlightedPart]?.title || highlightedPart}
        </Text>
      )}

    </group>
  );
};


// Memoize to prevent re-renders when parent state changes
export const BookModel = React.memo(BookModelComponent);
