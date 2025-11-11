"use client";

import { useEffect, useRef, useState } from "react";
import { useMolstar } from "../hooks/useMolstar"; // Adjust path as needed
import MolstarControls from "./MolstarControls"; // Adjust path as needed

const MolstarViewer = () => {
  const [activeViewport, setActiveViewport] = useState<1 | 2>(1);
  const [viewport1Loaded, setViewport1Loaded] = useState(false);
  const [viewport2Loaded, setViewport2Loaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="w-full h-[859px] flex flex-col">
      {/* Controls sidebar */}
      <MolstarControls
        state={currentViewport.state}
        handlers={currentViewport.handlers}
        activeViewport={activeViewport}
        setActiveViewport={setActiveViewport}
        viewport1Loaded={viewport1Loaded}
        viewport2Loaded={viewport2Loaded}
        setViewport1Loaded={setViewport1Loaded}
        setViewport2Loaded={setViewport2Loaded}
        isOpen={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />

      {/* Canvas area - dynamically adjusts based on sidebar */}
      <div
        className={`flex-1 flex gap-x-0.5 transition-all duration-10 ease-in-out h-full overflow-hidden ${
          viewport1Loaded && "bg-gray-500"
        }`}
        style={{
          paddingLeft: sidebarOpen ? "400px" : "0", // Changed from marginLeft to paddingLeft for proper alignment
        }}
      >
        {/* Viewport 1 */}
        <div
          onClick={() => setActiveViewport(1)}
          ref={parent1Ref}
          className={`relative h-full overflow-hidden
            ${!viewport1Loaded && "hidden"} 
            ${viewport2Loaded ? "w-1/2 border-r border-gray-700" : "w-full"}`}
        >
          <canvas
            ref={canvas1Ref}
            className="absolute inset-0 w-full h-full"
            style={{ width: "100%", height: "100%" }} // Ensure perfect fit
          />
          {/* Viewport label */}
          <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm z-10">
            Viewport 1
          </div>
        </div>

        {/* Viewport 2 */}
        <div
          onClick={() => setActiveViewport(2)}
          ref={parent2Ref}
          className={`${
            !viewport2Loaded && "hidden"
          } relative w-1/2 overflow-hidden`}
        >
          <canvas
            ref={canvas2Ref}
            className="absolute inset-0 w-full h-full"
            style={{ width: "100%", height: "100%" }} // Ensure perfect fit
          />
          <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm z-10">
            Viewport 2
          </div>
        </div>
      </div>
    </div>
  );
};

export default MolstarViewer;
