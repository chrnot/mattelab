import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shapes, 
  Trash2, 
  Plus, 
  RotateCw, 
  Trophy, 
  HelpCircle, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Expand, 
  RefreshCw,
  Sparkles,
  BookmarkCheck,
  Undo
} from 'lucide-react';

// --- Interfaces & Types ---

interface Block {
  x: number;
  y: number;
  z: number;
  color: string;
}

interface TargetLevel {
  id: number;
  name: string;
  description: string;
  blocks: Block[];
}

type Mode = 'projection' | 'measurement';
type ActiveTool = 'add' | 'delete';

// Color Palette for blocks
const BLOCK_COLORS = [
  '#4f46e5', // Indigo
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
];

// Predefined target structures for "Från ritning till verklighet" (Läge A)
const TARGET_LEVELS: TargetLevel[] = [
  {
    id: 1,
    name: "Enkel Trappa",
    description: "Bygg en klassisk liten trappa med 3 steg. En bra start för att förstå vyer!",
    blocks: [
      { x: 1, y: 2, z: 0, color: '#4f46e5' },
      { x: 2, y: 2, z: 0, color: '#4f46e5' },
      { x: 3, y: 2, z: 0, color: '#4f46e5' },
      { x: 1, y: 2, z: 1, color: '#f59e0b' },
      { x: 2, y: 2, z: 1, color: '#f59e0b' },
      { x: 1, y: 2, z: 2, color: '#10b981' },
    ]
  },
  {
    id: 2,
    name: "L-formad Hörnmur",
    description: "En vinklad struktur som ser likadan ut från framsidan och sidan, men annorlunda ovanifrån.",
    blocks: [
      { x: 1, y: 1, z: 0, color: '#8b5cf6' },
      { x: 1, y: 2, z: 0, color: '#8b5cf6' },
      { x: 1, y: 3, z: 0, color: '#8b5cf6' },
      { x: 2, y: 1, z: 0, color: '#8b5cf6' },
      { x: 3, y: 1, z: 0, color: '#8b5cf6' },
      { x: 1, y: 1, z: 1, color: '#06b6d4' },
      { x: 1, y: 2, z: 1, color: '#06b6d4' },
      { x: 2, y: 1, z: 1, color: '#06b6d4' },
      { x: 1, y: 1, z: 2, color: '#ef4444' },
    ]
  },
  {
    id: 3,
    name: "Triumfbåge",
    description: "Bygg en tunnel/båge med ett hål i mitten. Granska hur hålet visas i vyerna.",
    blocks: [
      { x: 1, y: 2, z: 0, color: '#4f46e5' },
      { x: 1, y: 2, z: 1, color: '#4f46e5' },
      { x: 3, y: 2, z: 0, color: '#4f46e5' },
      { x: 3, y: 2, z: 1, color: '#4f46e5' },
      { x: 1, y: 2, z: 2, color: '#f59e0b' },
      { x: 2, y: 2, z: 2, color: '#10b981' },
      { x: 3, y: 2, z: 2, color: '#f59e0b' },
    ]
  },
  {
    id: 4,
    name: "Det Dolda Tomrummet",
    description: "Ett ihåligt bygge som utmanar din förståelse för dolda klossar bakom andra klossar.",
    blocks: [
      { x: 1, y: 1, z: 0, color: '#8b5cf6' },
      { x: 2, y: 1, z: 0, color: '#8b5cf6' },
      { x: 3, y: 1, z: 0, color: '#8b5cf6' },
      { x: 1, y: 2, z: 0, color: '#8b5cf6' },
      // (2,2,0) is hollow!
      { x: 3, y: 2, z: 0, color: '#8b5cf6' },
      { x: 1, y: 3, z: 0, color: '#8b5cf6' },
      { x: 2, y: 3, z: 0, color: '#8b5cf6' },
      { x: 3, y: 3, z: 0, color: '#8b5cf6' },
      { x: 2, y: 2, z: 1, color: '#ef4444' } // Top cover
    ]
  },
  {
    id: 5,
    name: "Symmetriskt Kors",
    description: "Ett jämnt kors med ett centralt torn. Perfekt utmaning för tredimensionell balans.",
    blocks: [
      { x: 2, y: 2, z: 0, color: '#10b981' },
      { x: 1, y: 2, z: 0, color: '#06b6d4' },
      { x: 3, y: 2, z: 0, color: '#06b6d4' },
      { x: 2, y: 1, z: 0, color: '#06b6d4' },
      { x: 2, y: 3, z: 0, color: '#06b6d4' },
      { x: 2, y: 2, z: 1, color: '#f59e0b' },
      { x: 2, y: 2, z: 2, color: '#4f46e5' },
    ]
  }
];

// Presets for "Begränsningsarea & Volym" (Läge B)
const LAB_B_PRESETS = [
  {
    name: "Rensa Arbetsyta",
    blocks: []
  },
  {
    name: "Kompakt Kub 2x2x2",
    blocks: [
      { x: 2, y: 2, z: 0, color: '#4f46e5' },
      { x: 3, y: 2, z: 0, color: '#4f46e5' },
      { x: 2, y: 3, z: 0, color: '#4f46e5' },
      { x: 3, y: 3, z: 0, color: '#4f46e5' },
      { x: 2, y: 2, z: 1, color: '#f59e0b' },
      { x: 3, y: 2, z: 1, color: '#f59e0b' },
      { x: 2, y: 3, z: 1, color: '#f59e0b' },
      { x: 3, y: 3, z: 1, color: '#f59e0b' },
    ]
  },
  {
    name: "Liggande Balk 1x4",
    blocks: [
      { x: 1, y: 2, z: 0, color: '#8b5cf6' },
      { x: 2, y: 2, z: 0, color: '#8b5cf6' },
      { x: 3, y: 2, z: 0, color: '#8b5cf6' },
      { x: 4, y: 2, z: 0, color: '#8b5cf6' },
    ]
  },
  {
    name: "Enkel Stenbro",
    blocks: [
      { x: 1, y: 2, z: 0, color: '#06b6d4' },
      { x: 1, y: 2, z: 1, color: '#06b6d4' },
      { x: 3, y: 2, z: 0, color: '#06b6d4' },
      { x: 3, y: 2, z: 1, color: '#06b6d4' },
      { x: 1, y: 2, z: 2, color: '#ef4444' },
      { x: 2, y: 2, z: 2, color: '#ef4444' },
      { x: 3, y: 2, z: 2, color: '#ef4444' },
    ]
  }
];

const Architect: React.FC = () => {
  // General Labs Settings
  const [mode, setMode] = useState<Mode>('projection');
  const [selectedColor, setSelectedColor] = useState<string>('#4f46e5');
  const [activeTool, setActiveTool] = useState<ActiveTool>('add');
  
  // 3D Blocks Layout State
  const [blocks, setBlocks] = useState<Block[]>(TARGET_LEVELS[0].blocks);
  const [historyBlocks, setHistoryBlocks] = useState<Block[][]>([]);
  
  // Projection Target level
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  
  // Interactive Measurement Settings (Mode B)
  const [showBoundaryHighlight, setShowBoundaryHighlight] = useState<boolean>(false);
  const [clickedFaceSequence, setClickedFaceSequence] = useState<string[]>([]);
  const [isExploded, setIsExploded] = useState<boolean>(false);

  // 3D View Rotational Angles
  const [yaw, setYaw] = useState<number>(35); // Horizontal rotation in degrees
  const [pitch, setPitch] = useState<number>(35); // Vertical tilt in degrees
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const startRotation = useRef({ yaw: 35, pitch: 35 });

  // Hover Preview Block
  const [hoveredFace, setHoveredFace] = useState<{ x: number; y: number; z: number; direction: string; faceKey: string } | null>(null);
  const [hoveredFloor, setHoveredFloor] = useState<{ x: number; y: number } | null>(null);

  // --- Reset/Level Sync ---
  useEffect(() => {
    if (mode === 'projection') {
      // Set blocks to the current level target
      setBlocks([]); // Start with a clear slate so they have to build it
      setClickedFaceSequence([]);
      setShowBoundaryHighlight(false);
      setIsExploded(false);
    } else {
      // Set blocks to compact unit block preset
      setBlocks(LAB_B_PRESETS[1].blocks);
      setClickedFaceSequence([]);
    }
    setHistoryBlocks([]);
  }, [mode, currentLevelIdx]);

  const currentLevel = TARGET_LEVELS[currentLevelIdx];

  // Helper to save history for Undo
  const pushToHistory = (newBlocks: Block[]) => {
    setHistoryBlocks(prev => [...prev.slice(-20), blocks]); // Max 20 steps
  };

  const handleUndo = () => {
    if (historyBlocks.length > 0) {
      const prev = historyBlocks[historyBlocks.length - 1];
      setBlocks(prev);
      setHistoryBlocks(prevHistory => prevHistory.slice(0, -1));
    }
  };

  // --- 3D Projection Calculations ---
  
  const projectPoint = (px: number, py: number, pz: number, explodedOffset = 0) => {
    // Core parameters
    const svgWidth = 540;
    const svgHeight = 440;
    const scale = 36;

    // Displacement if structure is exploded (separated) to help counting volume
    const shift = explodedOffset;
    const cx = px - 2.0 + (px - 2.0) * shift;
    const cy = py - 2.0 + (py - 2.0) * shift;
    const cz = pz - 1.5 + (pz - 1.5) * shift;

    // Convert degrees to radians
    const yawRad = (yaw * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;

    // 1. Rotate around Z-axis (Yaw)
    const x1 = cx * Math.cos(yawRad) - cy * Math.sin(yawRad);
    const y1 = cx * Math.sin(yawRad) + cy * Math.cos(yawRad);
    const z1 = cz;

    // 2. Rotate around X-axis (Pitch / Tilt)
    const x2 = x1;
    const y2 = y1 * Math.cos(pitchRad) - z1 * Math.sin(pitchRad);
    const z2 = y1 * Math.sin(pitchRad) + z1 * Math.cos(pitchRad); // camera depth

    // Project coordinates onto 2D screen coordinate system (centered)
    const u = svgWidth / 2 + x2 * scale;
    const v = svgHeight / 2 - y2 * scale;

    return { u, v, depth: z2 };
  };

  // Check if a block face points towards the camera (Backface culling)
  const isFaceVisible = (nx: number, ny: number, nz: number) => {
    const yawRad = (yaw * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;

    // Rotate normal vector
    const n1x = nx * Math.cos(yawRad) - ny * Math.sin(yawRad);
    const n1y = nx * Math.sin(yawRad) + ny * Math.cos(yawRad);
    const n1z = nz;

    const n2y = n1y * Math.cos(pitchRad) - n1z * Math.sin(pitchRad);
    const n2z = n1y * Math.sin(pitchRad) + n1z * Math.cos(pitchRad);

    // In this orientation, layers face towards the camera if camera space depth is positive
    return n2z > 0;
  };

  // --- Rotated Drag Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    startRotation.current = { yaw, pitch };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;

    setYaw((startRotation.current.yaw - dx * 0.6) % 360);
    setPitch(Math.max(15, Math.min(80, startRotation.current.pitch + dy * 0.4)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Basic Mobile Touch Support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      startRotation.current = { yaw, pitch };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartPos.current.x;
    const dy = e.touches[0].clientY - dragStartPos.current.y;

    setYaw((startRotation.current.yaw - dx * 0.6) % 360);
    setPitch(Math.max(15, Math.min(80, startRotation.current.pitch + dy * 0.4)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // --- Interaction Logics: Placing & Removing ---

  const findBlockAt = (x: number, y: number, z: number) => {
    return blocks.find(b => b.x === x && b.y === y && b.z === z) || null;
  };

  const handleBlockClick = (x: number, y: number, z: number, direction: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (showBoundaryHighlight && mode === 'measurement') {
      // Toggle face counted list in measurement challenge
      const faceKey = `${x},${y},${z},${direction}`;
      setClickedFaceSequence(prev => {
        if (prev.includes(faceKey)) {
          return prev.filter(f => f !== faceKey);
        } else {
          return [...prev, faceKey];
        }
      });
      return;
    }

    if (activeTool === 'delete') {
      // Remove block
      pushToHistory(blocks);
      setBlocks(prev => prev.filter(b => !(b.x === x && b.y === y && b.z === z)));
      // Reset clicked faces pointing to this block
      setClickedFaceSequence(prev => prev.filter(f => !f.startsWith(`${x},${y},${z},`)));
    } else {
      // Add adjacent block
      let targetX = x;
      let targetY = y;
      let targetZ = z;

      switch (direction) {
        case 'top': targetZ += 1; break;
        case 'bottom': targetZ -= 1; break;
        case 'front': targetY += 1; break;
        case 'back': targetY -= 1; break;
        case 'right': targetX += 1; break;
        case 'left': targetX -= 1; break;
      }

      // Keep within comfortable bounds
      if (
        targetX >= 0 && targetX < 5 &&
        targetY >= 0 && targetY < 5 &&
        targetZ >= 0 && targetZ < 5
      ) {
        if (!findBlockAt(targetX, targetY, targetZ)) {
          pushToHistory(blocks);
          const newBlock: Block = {
            x: targetX,
            y: targetY,
            z: targetZ,
            color: selectedColor
          };
          setBlocks(prev => [...prev, newBlock]);
        }
      }
    }
  };

  const handleFloorClick = (fx: number, fy: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTool === 'delete') return;

    if (!findBlockAt(fx, fy, 0)) {
      pushToHistory(blocks);
      setBlocks(prev => [...prev, { x: fx, y: fy, z: 0, color: selectedColor }]);
    }
  };

  // --- Real-Time Mathematical Projections ---

  const currentProjections = useMemo(() => {
    const top = Array(5).fill(0).map(() => Array(5).fill(false));
    const front = Array(5).fill(0).map(() => Array(5).fill(false));
    const side = Array(5).fill(0).map(() => Array(5).fill(false));

    blocks.forEach(b => {
      if (b.x >= 0 && b.x < 5 && b.y >= 0 && b.y < 5 && b.z >= 0 && b.z < 5) {
        top[b.x][b.y] = true;
        front[b.x][b.z] = true;
        side[b.y][b.z] = true;
      }
    });

    return { top, front, side };
  }, [blocks]);

  const targetProjections = useMemo(() => {
    const top = Array(5).fill(0).map(() => Array(5).fill(false));
    const front = Array(5).fill(0).map(() => Array(5).fill(false));
    const side = Array(5).fill(0).map(() => Array(5).fill(false));

    currentLevel.blocks.forEach(b => {
      if (b.x >= 0 && b.x < 5 && b.y >= 0 && b.y < 5 && b.z >= 0 && b.z < 5) {
        top[b.x][b.y] = true;
        front[b.x][b.z] = true;
        side[b.y][b.z] = true;
      }
    });

    return { top, front, side };
  }, [currentLevel]);

  // View state validations
  const isTopViewMatch = useMemo(() => {
    for (let x = 0; x < 5; ++x) {
      for (let y = 0; y < 5; ++y) {
        if (currentProjections.top[x][y] !== targetProjections.top[x][y]) return false;
      }
    }
    return true;
  }, [currentProjections.top, targetProjections.top]);

  const isFrontViewMatch = useMemo(() => {
    for (let x = 0; x < 5; ++x) {
      for (let z = 0; z < 5; ++z) {
        if (currentProjections.front[x][z] !== targetProjections.front[x][z]) return false;
      }
    }
    return true;
  }, [currentProjections.front, targetProjections.front]);

  const isSideViewMatch = useMemo(() => {
    for (let y = 0; y < 5; ++y) {
      for (let z = 0; z < 5; ++z) {
        if (currentProjections.side[y][z] !== targetProjections.side[y][z]) return false;
      }
    }
    return true;
  }, [currentProjections.side, targetProjections.side]);

  const isAllViewsMatched = isTopViewMatch && isFrontViewMatch && isSideViewMatch;

  // --- Volume & boundary surface area calculations ---

  const volume = blocks.length;

  // Calculates which faces are actually outer faces (not connected to adjacent block)
  const outerFaces = useMemo(() => {
    const list: Array<{ x: number; y: number; z: number; direction: string; isInteractive: boolean }> = [];

    blocks.forEach(b => {
      const directions = [
        { dir: 'top', nx: 0, ny: 0, nz: 1, dx: 0, dy: 0, dz: 1 },
        { dir: 'bottom', nx: 0, ny: 0, nz: -1, dx: 0, dy: 0, dz: -1 },
        { dir: 'front', nx: 0, ny: 1, nz: 0, dx: 0, dy: 1, dz: 0 },
        { dir: 'back', nx: 0, ny: -1, nz: 0, dx: 0, dy: -1, dz: 0 },
        { dir: 'right', nx: 1, ny: 0, nz: 0, dx: 1, dy: 0, dz: 0 },
        { dir: 'left', nx: -1, ny: 0, nz: 0, dx: -1, dy: 0, dz: 0 },
      ];

      directions.forEach(({ dir, nx, ny, nz, dx, dy, dz }) => {
        // Check if neighbor exists
        const hasNeighbor = findBlockAt(b.x + dx, b.y + dy, b.z + dz);
        if (!hasNeighbor) {
          list.push({
            x: b.x,
            y: b.y,
            z: b.z,
            direction: dir,
            isInteractive: isFaceVisible(nx, ny, nz)
          });
        }
      });
    });

    return list;
  }, [blocks, yaw, pitch]);

  const totalBoundaryAreaCount = useMemo(() => {
    // Count exact outer faces (excluding coordinate boundaries, etc - purely relative neighbors)
    let total = 0;
    blocks.forEach(b => {
      const neighbors = [
        findBlockAt(b.x + 1, b.y, b.z),
        findBlockAt(b.x - 1, b.y, b.z),
        findBlockAt(b.x, b.y + 1, b.z),
        findBlockAt(b.x, b.y - 1, b.z),
        findBlockAt(b.x, b.y, b.z + 1),
        findBlockAt(b.x, b.y, b.z - 1),
      ];
      const activeNeighbors = neighbors.filter(Boolean).length;
      total += (6 - activeNeighbors);
    });
    return total;
  }, [blocks]);

  // --- Element Prep for Depth-Ordered Painter's Algorithm rendering ---

  const renderElements = useMemo(() => {
    const list: Array<{
      type: 'block-face' | 'preview-face';
      block: Block;
      direction: string;
      polyPoints: Array<{ u: number; v: number }>;
      centerProjected: { u: number; v: number };
      depth: number;
      faceKey: string;
      isOuter: boolean;
    }> = [];

    const shiftFactor = isExploded ? 0.35 : 0;

    // A helper to generate 3D cube vertices and map faces
    const createCubeFaces = (b: Block, isPreview = false) => {
      // Define 8 vertices centered at block coordinates
      const cx = b.x;
      const cy = b.y;
      const cz = b.z;

      const half = 0.46; // slightly smaller than 0.5 to introduce visual borders/gaps

      const v000 = projectPoint(cx - half, cy - half, cz - half, shiftFactor);
      const v100 = projectPoint(cx + half, cy - half, cz - half, shiftFactor);
      const v110 = projectPoint(cx + half, cy + half, cz - half, shiftFactor);
      const v010 = projectPoint(cx - half, cy + half, cz - half, shiftFactor);

      const v001 = projectPoint(cx - half, cy - half, cz + half, shiftFactor);
      const v101 = projectPoint(cx + half, cy - half, cz + half, shiftFactor);
      const v111 = projectPoint(cx + half, cy + half, cz + half, shiftFactor);
      const v011 = projectPoint(cx - half, cy + half, cz + half, shiftFactor);

      const faceDefinitions = [
        { dir: 'top', vertices: [v001, v101, v111, v011], nx: 0, ny: 0, nz: 1, dx: 0, dy: 0, dz: 1 },
        { dir: 'bottom', vertices: [v000, v010, v110, v100], nx: 0, ny: 0, nz: -1, dx: 0, dy: 0, dz: -1 },
        { dir: 'front', vertices: [v010, v011, v111, v110], nx: 0, ny: 1, nz: 0, dx: 0, dy: 1, dz: 0 },
        { dir: 'back', vertices: [v000, v100, v101, v001], nx: 0, ny: -1, nz: 0, dx: 0, dy: -1, dz: 0 },
        { dir: 'right', vertices: [v100, v110, v111, v101], nx: 1, ny: 0, nz: 0, dx: 1, dy: 0, dz: 0 },
        { dir: 'left', vertices: [v000, v001, v011, v010], nx: -1, ny: 0, nz: 0, dx: -1, dy: 0, dz: 0 },
      ];

      faceDefinitions.forEach(({ dir, vertices, nx, ny, nz, dx, dy, dz }) => {
        if (isFaceVisible(nx, ny, nz)) {
          // Calculate centroid depth
          const depthSum = vertices.reduce((sum, v) => sum + v.depth, 0);
          const avgDepth = depthSum / 4;

          // Compute 2D projected face center for tactile peg placing
          const centerProjected = projectPoint(cx + nx * 0.46, cy + ny * 0.46, cz + nz * 0.46, shiftFactor);

          const hasNeighbor = findBlockAt(b.x + dx, b.y + dy, b.z + dz);

          list.push({
            type: isPreview ? 'preview-face' : 'block-face',
            block: b,
            direction: dir,
            polyPoints: vertices.map(v => ({ u: v.u, v: v.v })),
            centerProjected: { u: centerProjected.u, v: centerProjected.v },
            depth: avgDepth,
            faceKey: `${b.x},${b.y},${b.z},${dir}`,
            isOuter: !hasNeighbor
          });
        }
      });
    };

    // Add actual placed blocks
    blocks.forEach(b => createCubeFaces(b, false));

    // Support hovered preview block insertion rendering
    if (activeTool === 'add' && !isExploded && !showBoundaryHighlight) {
      let previewCoord: Block | null = null;
      if (hoveredFace) {
        let px = hoveredFace.x;
        let py = hoveredFace.y;
        let pz = hoveredFace.z;
        switch (hoveredFace.direction) {
          case 'top': pz += 1; break;
          case 'bottom': pz -= 1; break;
          case 'front': py += 1; break;
          case 'back': py -= 1; break;
          case 'right': px += 1; break;
          case 'left': px -= 1; break;
        }
        if (px >= 0 && px < 5 && py >= 0 && py < 5 && pz >= 0 && pz < 5 && !findBlockAt(px, py, pz)) {
          previewCoord = { x: px, y: py, z: pz, color: selectedColor };
        }
      } else if (hoveredFloor) {
        if (!findBlockAt(hoveredFloor.x, hoveredFloor.y, 0)) {
          previewCoord = { x: hoveredFloor.x, y: hoveredFloor.y, z: 0, color: selectedColor };
        }
      }

      if (previewCoord) {
        createCubeFaces(previewCoord, true);
      }
    }

    // Sort ascending by depth (lower depth = drawn further back first)
    list.sort((a, b) => a.depth - b.depth);
    return list;
  }, [blocks, yaw, pitch, hoveredFace, hoveredFloor, activeTool, selectedColor, isExploded, showBoundaryHighlight]);

  // Create Floor Grid Panels (drawn coordinates)
  const floorGridCells = useMemo(() => {
    const cells = [];
    const floorZ = -0.52; // slightly underneath Z=0 blocks base

    for (let x = 0; x < 5; ++x) {
      for (let y = 0; y < 5; ++y) {
        const hasBlock = findBlockAt(x, y, 0);

        // Project the 4 corners of floor cell tile
        const c1 = projectPoint(x - 0.48, y - 0.48, floorZ);
        const c2 = projectPoint(x + 0.48, y - 0.48, floorZ);
        const c3 = projectPoint(x + 0.48, y + 0.48, floorZ);
        const c4 = projectPoint(x - 0.48, y + 0.48, floorZ);

        const avgDepth = (c1.depth + c2.depth + c3.depth + c4.depth) / 4;

        cells.push({
          x,
          y,
          polyPoints: [c1, c2, c3, c4],
          depth: avgDepth,
          isCovered: !!hasBlock
        });
      }
    }

    // Sort floor cells so that it complies with the depth engine as well
    cells.sort((a, b) => a.depth - b.depth);
    return cells;
  }, [yaw, pitch, blocks]);

  // Shader effect generator based on face alignment representing tactile rendering
  const getFaceStyle = (direction: string, color: string, isPreview: boolean, faceKey: string) => {
    let brightness = 1.0;

    switch (direction) {
      case 'top':
        brightness = 1.05; // Bright light from above
        break;
      case 'right':
      case 'left':
        brightness = 0.92; // Moderate side shadows
        break;
      case 'front':
      case 'back':
        brightness = 0.82; // Deep front shadows
        break;
    }

    // Interactive highlights in boundary measurement challenge
    if (showBoundaryHighlight && mode === 'measurement') {
      const idx = clickedFaceSequence.indexOf(faceKey);
      if (idx !== -1) {
        return {
          fill: '#10b981', // Counted green
          stroke: '#047857',
          strokeWidth: 2,
          opacity: 0.95
        };
      }
      return {
        fill: '#fbbf24', // Glowing amber
        stroke: '#d97706',
        strokeWidth: 2,
        opacity: 0.85
      };
    }

    if (isPreview) {
      return {
        fill: color,
        stroke: color,
        strokeWidth: 1,
        opacity: 0.4,
        strokeDasharray: '4 4'
      };
    }

    // Default colored shaded blocks
    return {
      fill: color,
      filter: `brightness(${brightness})`,
      stroke: 'rgba(255,255,255,0.22)',
      strokeWidth: 1.2
    };
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8 flex flex-col items-center gap-6 font-sans select-none overflow-x-hidden">
      {/* Platform Header */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center bg-white p-4 md:p-6 rounded-[2.5rem] border border-stone-200/80 shadow-xl gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-amber-500/10">
            <Shapes size={24} />
          </div>
          <div>
            <h1 className="text-xl font-serif font-black text-stone-900 tracking-tight">Arkitekten</h1>
            <p className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
              <span>Geometri & Volym</span>
              <span className="text-stone-300">•</span>
              <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[9px]">Åk 4–9</span>
            </p>
          </div>
        </div>

        {/* Challenge Mode Switcher */}
        <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200/50">
          <button 
            onClick={() => setMode('projection')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${mode === 'projection' ? 'bg-white text-stone-900 shadow-sm border border-stone-200/40' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <BookmarkCheck size={14} /> Ritning till Verklighet
          </button>
          <button 
            onClick={() => setMode('measurement')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${mode === 'measurement' ? 'bg-white text-stone-900 shadow-sm border border-stone-200/40' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <Layers size={14} /> Area & Volym
          </button>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleUndo}
            disabled={historyBlocks.length === 0}
            className="p-3 bg-stone-100 text-stone-600 hover:text-stone-950 hover:bg-stone-200 rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none"
            title="Ångra"
          >
            <Undo size={18} />
          </button>
          <button 
            onClick={() => {
              pushToHistory(blocks);
              setBlocks([]);
              setClickedFaceSequence([]);
            }}
            className="flex items-center gap-1.5 px-4 py-3 bg-stone-900 text-white hover:bg-stone-800 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
          >
            <Trash2 size={14} /> Rensa
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        
        {/* LEFT COLUMN: Sidebar Tools & Level Info */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Section A: Mode Selection / Levels Details */}
          {mode === 'projection' ? (
            <section className="bg-white rounded-[2rem] p-6 border border-stone-200/80 shadow-md">
              <h3 className="text-xs font-black text-stone-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-1.5">
                <BookmarkCheck size={14} className="text-amber-500" /> Välj Ritnings-Uppdrag
              </h3>

              <div className="space-y-2 mb-6">
                {TARGET_LEVELS.map((level, idx) => (
                  <button
                    key={level.id}
                    onClick={() => setCurrentLevelIdx(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all ${currentLevelIdx === idx ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-transparent border-stone-100 text-stone-600 hover:border-stone-300'}`}
                  >
                    <div>
                      <h4 className="text-xs font-bold font-serif">{level.id}. {level.name}</h4>
                      <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{level.description}</p>
                    </div>
                    {currentLevelIdx === idx && <Sparkles size={14} className="text-amber-500 shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl space-y-2">
                <span className="text-[9px] bg-amber-600 text-white font-black px-1.5 py-0.5 rounded uppercase font-mono tracking-widest">Ritningsinfo</span>
                <p className="text-[11px] leading-relaxed text-stone-600 font-medium font-serif">
                  {currentLevel.description}
                </p>
                <p className="text-[10px] italic text-stone-400 mt-1 leading-snug">
                  Bygg strukturen i 3D-griden till höger. Jämför ditt bygge med de tre 2D-vyerna kontinuerligt!
                </p>
              </div>
            </section>
          ) : (
            <section className="bg-white rounded-[2rem] p-6 border border-stone-200/80 shadow-md">
              <h3 className="text-xs font-black text-stone-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-1.5">
                <Layers size={14} className="text-amber-500" /> Start-strukturer (Presets)
              </h3>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {LAB_B_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      pushToHistory(blocks);
                      setBlocks(preset.blocks);
                      setClickedFaceSequence([]);
                    }}
                    className="p-3 bg-stone-50 border border-stone-200 hover:border-amber-400 hover:bg-amber-50/10 rounded-xl text-left transition-all"
                  >
                    <div className="text-[11px] font-bold text-stone-700 leading-snug">{preset.name}</div>
                    <div className="text-[9px] text-stone-400 font-mono mt-0.5">kuber: {preset.blocks.length}</div>
                  </button>
                ))}
              </div>

              {/* Indicator Panel */}
              <div className="p-5 rounded-2xl bg-stone-900 text-white space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest">Volym</span>
                    <span className="text-2xl font-black text-amber-400 font-serif">{volume} <span className="text-xs text-stone-300 font-sans">u³</span></span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest">Begränsningsarea</span>
                    <span className="text-2xl font-black text-emerald-400 font-serif">{totalBoundaryAreaCount} <span className="text-xs text-stone-300 font-sans">u²</span></span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowBoundaryHighlight(!showBoundaryHighlight);
                      if(showBoundaryHighlight) setClickedFaceSequence([]);
                    }}
                    className={`w-full py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5 ${showBoundaryHighlight ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white/10 text-stone-200 hover:bg-white/15'}`}
                  >
                    {showBoundaryHighlight ? "✓ Visar begränsningsarea" : "Visa begränsningsarea"}
                  </button>

                  <button
                    onClick={() => setIsExploded(!isExploded)}
                    className={`w-full py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5 ${isExploded ? 'bg-amber-500 text-white shadow-lg' : 'bg-white/10 text-stone-200 hover:bg-white/15'}`}
                  >
                    {isExploded ? "Sätt ihop figuren" : "Spräng figuren (Särkoppla)"}
                  </button>
                </div>

                {showBoundaryHighlight && (
                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="flex justify-between text-[10px] font-mono text-stone-200">
                      <span>Märkta ytor:</span>
                      <span className="font-bold text-emerald-300">{clickedFaceSequence.length} / {totalBoundaryAreaCount}</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div 
                        className="h-full bg-emerald-400 transition-all duration-300"
                        style={{ width: `${Math.min(100, (clickedFaceSequence.length / totalBoundaryAreaCount) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-stone-400 italic mt-2 leading-snug">
                      Klicka på de gula kvadratsidorna för att räkna dem. Du kan rotera vyn under tiden så att du kommer åt alla ytor!
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Builder Tools Palette */}
          <section className="bg-white rounded-[2rem] p-6 border border-stone-200/80 shadow-md space-y-4">
            <h3 className="text-xs font-black text-stone-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
              <Plus size={14} className="text-amber-500" /> Byggverktyg
            </h3>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveTool('add');
                  setShowBoundaryHighlight(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${activeTool === 'add' && !showBoundaryHighlight ? 'bg-amber-500 text-white border-amber-600 shadow-sm' : 'bg-stone-50 text-stone-600 border-stone-200/60 hover:bg-stone-100'}`}
              >
                <Plus size={14} /> Lägg till
              </button>
              <button
                onClick={() => {
                  setActiveTool('delete');
                  setShowBoundaryHighlight(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${activeTool === 'delete' && !showBoundaryHighlight ? 'bg-rose-600 text-white border-rose-700 shadow-sm' : 'bg-stone-50 text-stone-600 border-stone-200/60 hover:bg-stone-100'}`}
              >
                <Trash2 size={14} /> Ta bort
              </button>
            </div>

            {/* Block Color Selection */}
            {!showBoundaryHighlight && (
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">Klossfärg</label>
                <div className="flex gap-2 justify-center">
                  {BLOCK_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className="w-7 h-7 rounded-full border-2 transition-transform cursor-pointer relative"
                      style={{ 
                        backgroundColor: color,
                        borderColor: selectedColor === color ? '#1c1917' : 'transparent',
                        transform: selectedColor === color ? 'scale(1.15)' : 'scale(1.0)'
                      }}
                    >
                      {selectedColor === color && (
                        <div className="absolute inset-0.5 rounded-full border border-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

        </div>

        {/* MIDDLE / RICH COLUMN: Main 3D Canvas */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="bg-white rounded-[2.5rem] border border-stone-200/80 shadow-md p-6 flex-1 flex flex-col relative overflow-hidden">
            
            {/* View direction helpers on top margin */}
            <div className="flex justify-between items-center mb-4 z-10">
              <div>
                <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
                  {mode === 'projection' ? `Granska ritningen: ${currentLevel.name}` : 'Experiment- och Volymyta'}
                </h2>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                  Dra med musen/figret på rutan för att rotera
                </p>
              </div>

              {/* Angle Resets */}
              <div className="flex gap-1">
                <button
                  onClick={() => { setYaw(35); setPitch(35); }}
                  className="p-2 border border-stone-200 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-900 transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                  title="Fokusera vy"
                >
                  <RotateCw size={12} /> Standardvy
                </button>
              </div>
            </div>

            {/* The 3D Render Canvas */}
            <div 
              className="flex-1 bg-stone-50/40 border border-stone-200/40 rounded-2xl relative select-none cursor-grab active:cursor-grabbing min-h-[380px] flex items-center justify-center overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <svg 
                viewBox="0 0 540 440" 
                className="w-full h-full"
                style={{ overflow: 'visible' }}
              >
                {/* 1. Floor grid tiles (rendered at the bottom) */}
                {floorGridCells.map((cell, idx) => (
                  <polygon
                    key={`floor-${cell.x}-${cell.y}`}
                    points={cell.polyPoints.map(p => `${p.u},${p.v}`).join(' ')}
                    className="transition-colors duration-150"
                    fill={
                      hoveredFloor?.x === cell.x && hoveredFloor?.y === cell.y && !cell.isCovered && activeTool === 'add' && !showBoundaryHighlight
                        ? 'rgba(245, 158, 11, 0.25)' // golden preview
                        : cell.isCovered 
                        ? 'rgba(231, 229, 228, 0.4)' // lighter grid under placing
                        : (cell.x + cell.y) % 2 === 0 
                        ? 'rgba(245, 245, 244, 0.75)' 
                        : 'rgba(241, 240, 239, 0.75)'
                    }
                    stroke="rgba(214, 211, 209, 0.5)"
                    strokeWidth={1}
                    onMouseEnter={() => {
                      if (!isDragging) {
                        setHoveredFloor({ x: cell.x, y: cell.y });
                        setHoveredFace(null);
                      }
                    }}
                    onMouseLeave={() => {
                      if (!isDragging && hoveredFloor?.x === cell.x && hoveredFloor?.y === cell.y) {
                        setHoveredFloor(null);
                      }
                    }}
                    onClick={(e) => handleFloorClick(cell.x, cell.y, e)}
                  />
                ))}

                {/* 2. Placed blocks faces sorted correctly by Depth */}
                {renderElements.map((el, idx) => {
                  const style = getFaceStyle(el.direction, el.block.color, el.type === 'preview-face', el.faceKey);
                  const isHovered = hoveredFace?.faceKey === el.faceKey;
                  const countedIndex = clickedFaceSequence.indexOf(el.faceKey);

                  return (
                    <g 
                      key={`element-${el.faceKey}-${idx}`}
                      onMouseEnter={() => {
                        if (!isDragging) {
                          setHoveredFace({ x: el.block.x, y: el.block.y, z: el.block.z, direction: el.direction, faceKey: el.faceKey });
                          setHoveredFloor(null);
                        }
                      }}
                      onMouseLeave={() => {
                        if (!isDragging && hoveredFace?.faceKey === el.faceKey) {
                          setHoveredFace(null);
                        }
                      }}
                      onClick={(e) => handleBlockClick(el.block.x, el.block.y, el.block.z, el.direction, e)}
                      className="cursor-pointer group"
                    >
                      {/* Main Face Quad */}
                      <polygon
                        points={el.polyPoints.map(p => `${p.u},${p.v}`).join(' ')}
                        fill={style.fill}
                        filter={style.filter}
                        stroke={isHovered && !showBoundaryHighlight ? (activeTool === 'delete' ? '#ef4444' : '#fbbf24') : style.stroke}
                        strokeWidth={isHovered && !showBoundaryHighlight ? 2 : style.strokeWidth}
                        opacity={style.opacity}
                        strokeDasharray={style.strokeDasharray}
                      />

                      {/* Tactile detail: plug peg on cube face */}
                      <circle
                        cx={el.centerProjected.u}
                        cy={el.centerProjected.v}
                        r={showBoundaryHighlight ? 10 : 8}
                        fill={
                          showBoundaryHighlight && countedIndex !== -1 
                            ? '#047857' 
                            : showBoundaryHighlight 
                            ? '#d97706' 
                            : 'rgba(0, 0, 0, 0.12)'
                        }
                        stroke={
                          showBoundaryHighlight && countedIndex !== -1 
                            ? '#a7f3d0' 
                            : showBoundaryHighlight 
                            ? '#fef08a' 
                            : 'rgba(255, 255, 255, 0.25)'
                        }
                        strokeWidth={1}
                        opacity={el.type === 'preview-face' ? 0.35 : 1}
                      />

                      {/* Face Number Label for counting Begränsningsarea */}
                      {showBoundaryHighlight && countedIndex !== -1 && (
                        <text
                          x={el.centerProjected.u}
                          y={el.centerProjected.v + 3}
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="black"
                          textAnchor="middle"
                          pointerEvents="none"
                        >
                          {countedIndex + 1}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* drag rotation overlay hint */}
              {!isDragging && yaw === 35 && pitch === 35 && (
                <div className="absolute pointer-events-none bg-stone-900/80 backdrop-blur-sm text-stone-200 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 bottom-4">
                  <div className="w-2.5 h-2.5 rounded-full border border-stone-400 rotate-12 flex items-center justify-center animate-bounce">✥</div>
                  <span>Dra för att rotera 3D-vyn</span>
                </div>
              )}
            </div>

            {/* Dynamic matching indicators under the canvas for Mode A */}
            {mode === 'projection' && (
              <div className="mt-4 p-4 bg-stone-50 border border-stone-200/60 rounded-xl grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  {isTopViewMatch ? (
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-amber-500 shrink-0" />
                  )}
                  <span className="text-[10px] font-black uppercase text-stone-600">Vy ovanifrån</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-auto ${isTopViewMatch ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {isTopViewMatch ? 'Klar' : 'Omatchad'}
                  </span>
                </div>

                <div className="flex items-center gap-2 border-l border-stone-200 pl-3">
                  {isFrontViewMatch ? (
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-amber-500 shrink-0" />
                  )}
                  <span className="text-[10px] font-black uppercase text-stone-600">Vy framifrån</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-auto ${isFrontViewMatch ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {isFrontViewMatch ? 'Klar' : 'Omatchad'}
                  </span>
                </div>

                <div className="flex items-center gap-2 border-l border-stone-200 pl-3">
                  {isSideViewMatch ? (
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-amber-500 shrink-0" />
                  )}
                  <span className="text-[10px] font-black uppercase text-stone-600">Vy från sidan</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-auto ${isSideViewMatch ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {isSideViewMatch ? 'Klar' : 'Omatchad'}
                  </span>
                </div>
              </div>
            )}

            {/* Mode A success target overlay */}
            <AnimatePresence>
              {mode === 'projection' && isAllViewsMatched && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 mb-4 border-4 border-emerald-50 shadow-md">
                    <Trophy size={32} />
                  </div>
                  <h3 className="text-2xl font-serif font-black text-stone-900 mb-2">Perfekt! Ritningen stämmer!</h3>
                  <p className="text-xs text-stone-500 max-w-sm mb-6 leading-relaxed font-medium">
                    Alla tre 2D-projektioner stämmer överens med ditt 3D-bygge. Du löste uppgiften på {blocks.length} centikuber!
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setBlocks([])}
                      className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                    >
                      Börja Om
                    </button>
                    <button
                      onClick={() => {
                        const nextIdx = (currentLevelIdx + 1) % TARGET_LEVELS.length;
                        setCurrentLevelIdx(nextIdx);
                      }}
                      className="px-6 py-3 bg-stone-900 text-white hover:bg-stone-800 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Nästa Uppdrag <Expand size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Projection 2D Sheets Sidebar (Ovan, Fram, Sida) for Mode A */}
          {mode === 'projection' && (
            <section className="bg-white rounded-[2.5rem] border border-stone-200/80 p-6 shadow-md grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Top View Projection Layout */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block text-center">A: Vy Ovanifrån (Target)</span>
                <div className="aspect-square bg-stone-50 rounded-xl border border-stone-200/40 p-3 flex flex-col justify-between">
                  <div className="grid grid-cols-5 gap-1.5 aspect-square h-full w-full">
                    {Array.from({ length: 25 }).map((_, i) => {
                      const x = i % 5;
                      const y = Math.floor(i / 5);
                      const isTargetFilled = targetProjections.top[x][y];
                      const isCurrentFilled = currentProjections.top[x][y];

                      return (
                        <div
                          key={`target-top-${i}`}
                          className={`rounded transition-all ${isTargetFilled ? 'bg-amber-500 outline-amber-600 outline-1 h-full w-full' : 'bg-stone-200/40 h-full w-full'} ${isCurrentFilled === isTargetFilled ? 'opacity-100' : 'opacity-40 animate-pulse'}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Front View Projection Layout */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block text-center">B: Vy Framifrån (Target)</span>
                <div className="aspect-square bg-stone-50 rounded-xl border border-stone-200/40 p-3 flex flex-col justify-between">
                  <div className="grid grid-cols-5 gap-1.5 aspect-square h-full w-full">
                    {Array.from({ length: 25 }).map((_, i) => {
                      const x = i % 5;
                      const z = 4 - Math.floor(i / 5); // inverted for heights
                      const isTargetFilled = targetProjections.front[x][z];
                      const isCurrentFilled = currentProjections.front[x][z];

                      return (
                        <div
                          key={`target-front-${i}`}
                          className={`rounded transition-all ${isTargetFilled ? 'bg-indigo-600 h-full w-full' : 'bg-stone-200/40 h-full w-full'} ${isCurrentFilled === isTargetFilled ? 'opacity-100' : 'opacity-40 animate-pulse'}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Side View Projection Layout */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block text-center">C: Vy från sidan (Target)</span>
                <div className="aspect-square bg-stone-50 rounded-xl border border-stone-200/40 p-3 flex flex-col justify-between">
                  <div className="grid grid-cols-5 gap-1.5 aspect-square h-full w-full">
                    {Array.from({ length: 25 }).map((_, i) => {
                      // X grid cell mapped to Side views
                      const y = i % 5;
                      const z = 4 - Math.floor(i / 5); // inverted height
                      const isTargetFilled = targetProjections.side[y][z];
                      const isCurrentFilled = currentProjections.side[y][z];

                      return (
                        <div
                          key={`target-side-${i}`}
                          className={`rounded transition-all ${isTargetFilled ? 'bg-violet-600 h-full w-full' : 'bg-stone-200/40 h-full w-full'} ${isCurrentFilled === isTargetFilled ? 'opacity-100' : 'opacity-40 animate-pulse'}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

            </section>
          )}

        </div>

      </main>

      {/* FOOTER: Didactical Teacher Tips */}
      <footer className="w-full max-w-7xl bg-stone-900 text-stone-300 rounded-[2rem] p-6 md:p-8 space-y-4">
        <h4 className="text-xs font-black uppercase text-amber-500 tracking-widest flex items-center gap-1.5">
          <HelpCircle size={16} /> Pedagogisk handledning: digitala centicuber
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-400">
          <div className="space-y-2">
            <h5 className="font-bold text-stone-200">Varför "Arkitekten"?</h5>
            <p className="leading-relaxed font-serif">
              Att arbeta med vyer (fram, sida, ovan) tränar elevernas rumsliga förmåga och förståelse för avbildningar. En av de bärande didaktiska poängerna är att <span className="text-stone-200 font-bold">flera olika 3D-strukturer kan producera exakt samma 2D-vyer</span> på grund av dolda hörn eller dolda klossar.
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="font-bold text-stone-200">Klassrums-diskussion</h5>
            <p className="leading-relaxed font-serif">
              Låt eleverna jämföra sina färdiga strukturer i Läge A. <span className="text-stone-200 italic">"Byggde alla likadant? Vilken kloss är helt hemlig från bilderna? Hur påverkar särkopplingen ("Sprängningen") vår förmåga att beräkna begränsningsarean på dolda ytor?"</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Architect;
