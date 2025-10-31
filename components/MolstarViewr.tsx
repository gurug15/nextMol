"use client";

import { useRef } from "react";
import { useMolstar } from "../hooks/useMolstar"; // Adjust path as needed
import MolstarControls from "./MolstarControls"; // Adjust path as needed

const MolstarViewer = () => {
  // Refs for mounting the canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);

  // Use the custom hook to get state and handlers
  const { state, handlers } = useMolstar(canvasRef, parentRef);

  return (
    <div className="w-full flex items-center justify-between">
      {/* Pass state and handlers to the controls component */}
      <MolstarControls state={state} handlers={handlers} />

      {/* Mol* Viewer Canvas */}
      <div ref={parentRef} className="w-4/5 h-screen relative">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    </div>
  );
};

export default MolstarViewer;
