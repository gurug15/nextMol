"use client";

import { useEffect, useRef, useState } from "react";
import { useMolstar } from "../hooks/useMolstar"; // Adjust path as needed
import MolstarControls from "./MolstarControls"; // Adjust path as needed

const MolstarViewer = () => {
  const [activeViewport, setActiveViewport] = useState<1 | 2>(1);
  const [viewport1Loaded, setViewport1Loaded] = useState(false);
  const [viewport2Loaded, setViewport2Loaded] = useState(false);

  const canvas1Ref = useRef<HTMLCanvasElement | null>(null);
  const parent1Ref = useRef<HTMLDivElement | null>(null);

  const canvas2Ref = useRef<HTMLCanvasElement | null>(null);
  const parent2Ref = useRef<HTMLDivElement | null>(null);

  // Use the custom hook to get state and handlers

  const viewport1 = useMolstar(canvas1Ref, parent1Ref);
  const viewport2 = useMolstar(canvas2Ref, parent2Ref);

  const currentViewport = activeViewport === 1 ? viewport1 : viewport2;
  console.log(
    "viewport1Loaded:",
    viewport1Loaded,
    "viewport2Loaded:",
    viewport2Loaded
  );
  return (
    <div className="w-full h-[859px] flex justify-between">
      {/* Pass state and handlers to the controls component */}
      <MolstarControls
        state={currentViewport.state}
        handlers={currentViewport.handlers}
        activeViewport={activeViewport}
        setActiveViewport={setActiveViewport}
        viewport1Loaded={viewport1Loaded}
        viewport2Loaded={viewport2Loaded}
        setViewport1Loaded={setViewport1Loaded}
        setViewport2Loaded={setViewport2Loaded}
      />

      {/* Mol* Viewer Canvas */}
      <div
        className={`w-6/7 h-full flex gap-x-0.5 ${
          viewport1Loaded && "bg-gray-500"
        }`}
      >
        {
          <div
            ref={parent1Ref}
            className={`relative
              ${!viewport1Loaded && "hidden"} 
              ${viewport2Loaded ? "w-1/2 border-r border-gray-700" : "w-full"}`}
          >
            <canvas
              ref={canvas1Ref}
              className="absolute inset-0 w-full h-full"
            />
            {/* Viewport label */}
            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              Viewport 1
            </div>
          </div>
        }

        {/* Viewport 2 */}
        {
          <div
            ref={parent2Ref}
            className={`${!viewport2Loaded && "hidden"} relative w-1/2`}
          >
            <canvas
              ref={canvas2Ref}
              className="absolute inset-0 w-full h-full"
            />
            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              Viewport 2
            </div>
          </div>
        }
      </div>
    </div>
  );
};

export default MolstarViewer;
