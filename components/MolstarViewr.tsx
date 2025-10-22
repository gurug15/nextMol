"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec";
import { UUID } from "molstar/lib/mol-util";
import { Asset } from "molstar/lib/mol-util/assets";
import { v4 as uuidv4 } from "uuid";
const MolstarViewr = () => {
  const canvasRef: RefObject<null> = useRef(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const [isPluginReady, setIsPluginReady] = useState(false);
  const [plugin, setPlugin] = useState<PluginContext>(
    new PluginContext(DefaultPluginSpec())
  );
  useEffect(() => {
    // Initialize Mol* plugin
    const molInit = async () => {
      try {
        const canvas = canvasRef.current as HTMLCanvasElement | null;
        const parent = parentRef.current as HTMLDivElement | null;
        if (!canvas || !parent) return;
        const success = await plugin.initViewerAsync(canvas, parent);

        if (success) {
          setIsPluginReady(true);
          console.log(" Mol*Star initialized successfully!");
          console.log("Plugin instance:", plugin);
        } else {
          console.error("Failed to initialize Mol*Star");
        }
      } catch (err) {
        console.error("Error initializing Mol*Star:", err);
      }
    };

    molInit();

    // Optional cleanup (if Mol*Star supports destroying)
    return () => {
      if (plugin) {
        try {
          plugin.dispose();
        } catch (err) {
          console.warn("Error cleaning up Mol*Star:", err);
        }
      }
    };
  }, []);

  async function onFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    if (!isPluginReady) {
      console.warn("Plugin not ready yet!");
      console.log(plugin);
      return;
    }
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file: File = input.files[0];

    const assetFile: Asset.File = {
      kind: "file",
      id: uuidv4() as UUID,
      name: file.name,
      file: file,
    };
    await plugin.init();
    console.log("plugin in file select:", plugin);
    try {
      // Step 1: Read the file
      const data = await plugin.builders.data.readFile({
        file: assetFile,
        label: file.name,
        isBinary: false,
      });
      const trajectory = await plugin.builders.structure.parseTrajectory(
        data.data.ref,
        "mmcif"
      );

      await plugin.builders.structure.hierarchy.applyPreset(
        trajectory,
        "default"
      );
      //   isStructureLoaded.set(true);
      //   representationTypes = plugin.representation.structure.registry.types;
      //   console.log('Available representations:', representationTypes);
    } catch (error) {
      console.error(" Error loading file:", error);
    }
  }

  return (
    <div className="flex items-center justify-between py-2">
      <div className="w-full h-full border ">
        <input type="file" onChange={onFileSelect} />
      </div>
      <div ref={parentRef} className="w-3/4 h-screen border relative">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    </div>
  );
};

export default MolstarViewr;
