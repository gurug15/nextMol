"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec";
import { UUID } from "molstar/lib/mol-util";
import { Asset } from "molstar/lib/mol-util/assets";
import { v4 as uuidv4 } from "uuid";
import { Color } from "molstar/lib/mol-util/color";
import { PluginStateObject } from "molstar/lib/mol-plugin-state/objects";
const MolstarViewer = () => {
  const canvasRef: RefObject<null> = useRef(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const [isPluginReady, setIsPluginReady] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [bgColor, setBgColor] = useState("#000000");
  const [structureColor, setStructureColor] = useState<string>("#ffffff");
  const [representationTypes, setRepresentationTypes] = useState<
    [string, string][]
  >([]);
  const [selectedRepresentation, setSelectedRepresentation] =
    useState<string>("");
  const [isStructureLoaded, setIsStructureLoaded] = useState(false);
  const [isStereoEnabled, setIsStereoEnabled] = useState(false);
  const customSpec = {
    ...DefaultPluginSpec(),
    canvas3d: {
      renderer: {
        backgroundColor: Color(parseInt(bgColor.replace("#", "0x"))), // What goes here?
      },
    },
  };
  const [plugin, setPlugin] = useState<PluginContext>(
    new PluginContext(customSpec)
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

  function changeBackgroundColor(event: React.ChangeEvent<HTMLInputElement>) {
    setBgColor(event.target.value);
    // console.log("inputColor : ", bgColor);
    const colorConvert = (color: string): Color => {
      const intColor = parseInt(bgColor.replace("#", "0x"));

      return Color(intColor);
    };
    const colorValue = colorConvert(bgColor);
    // const colorValue = parseInt(selectColor)
    if (!plugin.canvas3d) {
      console.warn("Canvas not ready");
      return;
    }
    plugin.canvas3d.setProps({
      renderer: {
        backgroundColor: colorValue,
      },
    });
  }

  function toggleSpin() {
    if (!plugin.canvas3d) {
      console.warn("Canvas not ready");
      return;
    }
    setIsSpinning(!isSpinning);
    plugin.canvas3d.setProps({
      trackball: {
        animate: {
          name: "spin",
          params: {
            speed: isSpinning ? 0.04 : 0,
          },
        },
      },
    });
  }

  async function onFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    if (!isPluginReady) {
      console.warn("Plugin not ready yet!");
      console.log(plugin);
      return;
    }
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || isStructureLoaded) return;

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
        "all-models"
      );
      setIsStructureLoaded(true);
      setRepresentationTypes(plugin.representation.structure.registry.types);
      //   isStructureLoaded.set(true);
      //   representationTypes = plugin.representation.structure.registry.types;
      //   console.log('Available representations:', representationTypes);
    } catch (error) {
      console.error(" Error loading file:", error);
    }
  }
  const changeStructureColor = (event: React.ChangeEvent<HTMLInputElement>) => {
    const intColor = parseInt(event.target.value.replace("#", "0x"));
    const newColor = Color(intColor);

    // Find existing representations
    // const state = plugin.state.data;
    // const representations = state.selectQ((q) =>
    //   q.ofType(PluginStateObject.Molecule.Structure.Representation3D)
    // );
    const component =
      plugin.managers.structure.hierarchy.current.structures[0]?.components;

    plugin.managers.structure.component.updateRepresentationsTheme(component!, {
      color: "uniform",
      colorParams: { value: newColor },
    });
    setStructureColor(event.target.value);
    setRepresentation(selectedRepresentation, newColor);
  };

  // Representation change function
  const setRepresentation = async (type: string, color?: Color) => {
    if (!isStructureLoaded || !type || !plugin) {
      console.warn("No structure loaded or representation type provided");
      return;
    }

    setSelectedRepresentation(type);
    const colorToUse =
      color || Color(parseInt(structureColor.replace("#", "0x")));

    try {
      const state = plugin.state.data;
      const structures = state.selectQ((q) =>
        q.ofType(PluginStateObject.Molecule.Structure)
      );

      if (structures.length === 0) return;
      const structure = structures[0];

      const representations = state.selectQ((q) =>
        q.ofType(PluginStateObject.Molecule.Structure.Representation3D)
      );

      for (const repr of representations) {
        await plugin.build().delete(repr.transform.ref).commit();
      }

      await plugin.builders.structure.representation.addRepresentation(
        structure,
        {
          type: type as any,
          color: "uniform",
          colorParams: { value: colorToUse },
        }
      );

      // recenterView();
    } catch (error) {
      console.error(`Failed to set representation:`, error);
    }
  };

  // Stereo view toggle function
  const toggleStereoView = (enabled?: boolean) => {
    if (!plugin.canvas3d) {
      console.warn("Canvas not ready");
      return;
    }

    const shouldEnable = enabled !== undefined ? enabled : !isStereoEnabled;

    plugin.canvas3d.setProps({
      camera: {
        stereo: {
          name: shouldEnable ? "on" : "off",
          params: {
            eyeSeparation: 0.06,
            focus: 3.0,
          },
        },
      },
    });

    setIsStereoEnabled(shouldEnable);
  };

  // Recenter view function
  const recenterView = () => {
    if (!plugin.canvas3d) return;

    const sphere = plugin.canvas3d.boundingSphere;
    plugin.canvas3d.camera.focus(
      sphere.center,
      sphere.radius,
      500 // animation duration
    );
  };

  return (
    <div className="w-full flex items-center justify-between">
      <div className="pt-10 w-1/4 h-screen  flex flex-col items-center justify-start">
        <div className="flex flex-col items-center justify-start p-4">
          <input type="file" className="border" onChange={onFileSelect} />
          <button
            onClick={toggleSpin}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            {isSpinning ? "Start Spin" : "Stop Spin"}
          </button>
          <div className="mt-4 flex flex-col items-center">
            <label htmlFor="bgColor" className="mb-2">
              Select Background Color:
            </label>
            <input
              type="color"
              id="bgColor"
              value={bgColor}
              onChange={changeBackgroundColor}
            />
          </div>
          <div className="mt-4 flex flex-col items-center">
            <label htmlFor="structureColor" className="mb-2">
              Select Structure Color:
            </label>
            <input
              type="color"
              id="structureColor"
              value={structureColor}
              onChange={changeStructureColor}
            />
          </div>
          <div>
            <button
              onClick={() => toggleStereoView()}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
            >
              {isStereoEnabled ? "Disable Stereo View" : "Enable Stereo View"}
            </button>
          </div>
          <div className="">
            <label className="mt-4 mb-2">Select Representation:</label>
            <select
              onChange={(e) => setRepresentation(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">--Select--</option>
              {representationTypes.map(([type, label]) => (
                <option key={type} className="text-black" value={type}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              onClick={recenterView}
              className="mt-4 px-4 py-2 bg-purple-500 text-white rounded"
            >
              Recenter View
            </button>
          </div>
        </div>
      </div>
      <div ref={parentRef} className="w-3/4 h-screen relative">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    </div>
  );
};

export default MolstarViewer;
