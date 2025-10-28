"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec";
import { UUID } from "molstar/lib/mol-util";
import { Asset } from "molstar/lib/mol-util/assets";
import { v4 as uuidv4 } from "uuid";
import { Color } from "molstar/lib/mol-util/color";
import { PluginStateObject } from "molstar/lib/mol-plugin-state/objects";
import { BuiltInTrajectoryFormat } from "molstar/lib/mol-plugin-state/formats/trajectory";
import { BuiltInCoordinatesFormat } from "molstar/lib/mol-plugin-state/formats/coordinates";

// Custom hook to encapsulate Mol* logic
export const useMolstar = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  parentRef: RefObject<HTMLDivElement | null>
) => {
  // Internal state for the plugin and UI
  const [plugin, setPlugin] = useState<PluginContext | null>(null);
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
  // Effect for plugin initialization and disposal
  useEffect(() => {
    // Create and initialize the plugin
    const initPlugin = async () => {
      console.log("Initializing Mol*Star...");
      try {
        const canvas = canvasRef.current;
        const parent = parentRef.current;
        if (!canvas || !parent) return;

        // Use default spec for initialization
        const newPlugin = new PluginContext(DefaultPluginSpec());
        setPlugin(newPlugin);

        const success = await newPlugin.initViewerAsync(canvas, parent);

        if (success) {
          setIsPluginReady(true);
          console.log("Mol*Star initialized successfully!");

          // Set initial background color (original logic had this in spec,
          // but better to set explicitly after init)
          newPlugin.canvas3d?.setProps({
            renderer: {
              backgroundColor: Color(parseInt(bgColor.replace("#", "0x"))),
            },
          });
        } else {
          console.error("Failed to initialize Mol*Star");
        }
      } catch (err) {
        console.error("Error initializing Mol*Star:", err);
      }
    };

    initPlugin();

    // Cleanup on unmount
    return () => {
      plugin?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, parentRef]); // Only run once on mount

  // --- Event Handlers as Functions ---
  function getFormatByExtension(
    filename: string
  ): BuiltInTrajectoryFormat | undefined {
    const ext = filename.toLowerCase().split(".").pop();
    switch (ext) {
      case "mmcif":
      case "cif":
        return "mmcif"; // or 'cifCore' as needed
      case "pdb":
        return "pdb";
      case "pdbqt":
        return "pdbqt";
      case "gro":
        return "gro";
      case "xyz":
        return "xyz";
      case "mol":
        return "mol";
      case "sdf":
        return "sdf";
      case "mol2":
        return "mol2";
      case "data": // for LAMMPS data files
        return "lammps_data";
      case "traj": // for LAMMPS trajectory files
        return "lammps_traj_data";
      default:
        return undefined;
    }
  }

  function getMolstarCoordinatesFormat(
    filename: string
  ): BuiltInCoordinatesFormat | undefined {
    const ext = filename.toLowerCase().split(".").pop();
    switch (ext) {
      case "dcd":
        return "dcd";
      case "xtc":
        return "xtc";
      case "trr":
        return "trr";
      case "nc":
      case "nctraj":
        return "nctraj";
      case "lammpstrj":
      case "lammpstrjtxt":
        return "lammpstrj";
      default:
        return undefined;
    }
  }

  const handleTopologyFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!plugin || !isPluginReady) {
      console.warn("Plugin not ready yet!");
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
      const data = await plugin.builders.data.readFile({
        file: assetFile,
        label: file.name,
        isBinary: false,
      });
      const format: BuiltInTrajectoryFormat | undefined = getFormatByExtension(
        file.name
      );
      const trajectory = await plugin.builders.structure.parseTrajectory(
        data.data.ref,
        format!
      );
      console.log("plugin builder data", plugin.builders);
      console.log("Parsed trajectory:", trajectory);
      await plugin.builders.structure.hierarchy.applyPreset(
        trajectory,
        "default"
      );
      setIsStructureLoaded(true);
      setRepresentationTypes(plugin.representation.structure.registry.types);
    } catch (error) {
      console.error(" Error loading file:", error);
    }
  };

  const handleTrajectoryFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!plugin || !isPluginReady) {
      console.warn("Plugin not ready yet!");
      return;
    }
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !isStructureLoaded) return;

    const file: File = input.files[0];
    const format: BuiltInCoordinatesFormat | undefined =
      getMolstarCoordinatesFormat(file.name);
    if (!format) {
      console.error("Unsupported trajectory file format");
      return;
    }
    console.log("Trajectory file selected:", file);
  };

  const handleChangeBackgroundColor = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newColor = event.target.value;
    setBgColor(newColor); // Update React state

    if (!plugin?.canvas3d) {
      console.warn("Canvas not ready");
      return;
    }

    // Use the new color value directly, not the stale state
    const intColor = parseInt(newColor.replace("#", "0x"));
    const colorValue = Color(intColor);

    plugin.canvas3d.setProps({
      renderer: {
        backgroundColor: colorValue,
      },
    });
  };

  const handleToggleSpin = () => {
    if (!plugin?.canvas3d) {
      console.warn("Canvas not ready");
      return;
    }

    // Use the new state value for the logic
    const newSpinState = !isSpinning;
    setIsSpinning(newSpinState);

    plugin.canvas3d.setProps({
      trackball: {
        animate: {
          name: "spin",
          params: {
            speed: newSpinState ? 0.04 : 0, // Use new state
          },
        },
      },
    });
  };

  const handleChangeStructureColor = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newColorHex = event.target.value;
    setStructureColor(newColorHex); // Update React state

    const intColor = parseInt(newColorHex.replace("#", "0x"));
    const newColor = Color(intColor);

    const component =
      plugin?.managers.structure.hierarchy.current.structures[0]?.components;

    if (!component) {
      console.warn("No structure component found to update color.");
      return;
    }

    plugin?.managers.structure.component.updateRepresentationsTheme(
      component!,
      {
        color: "uniform",
        colorParams: { value: newColor },
      }
    );

    // Re-apply representation to ensure color updates if needed (matches original logic)
    handleSetRepresentation(selectedRepresentation, newColor);
  };

  const handleSetRepresentation = async (type: string, color?: Color) => {
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

      // Clear existing representations
      for (const repr of representations) {
        await plugin.build().delete(repr.transform.ref).commit();
      }

      // Add the new one
      await plugin.builders.structure.representation.addRepresentation(
        structure,
        {
          type: type as any,
          color: "uniform",
          colorParams: { value: colorToUse },
        }
      );
    } catch (error) {
      console.error(`Failed to set representation:`, error);
    }
  };

  const handleToggleStereoView = () => {
    if (!plugin?.canvas3d) {
      console.warn("Canvas not ready");
      return;
    }

    const newStereoState = !isStereoEnabled;
    setIsStereoEnabled(newStereoState);

    plugin.canvas3d.setProps({
      camera: {
        stereo: {
          name: newStereoState ? "on" : "off",
          params: {
            eyeSeparation: 0.06,
            focus: 3.0,
          },
        },
      },
    });
  };

  const handleRecenterView = () => {
    if (!plugin?.canvas3d) return;

    const sphere = plugin.canvas3d.boundingSphere;
    plugin.canvas3d.camera.focus(
      sphere.center,
      sphere.radius,
      500 // animation duration
    );
  };

  // Return state and handlers for the component to use
  return {
    state: {
      isPluginReady,
      isSpinning,
      bgColor,
      structureColor,
      representationTypes,
      selectedRepresentation,
      isStructureLoaded,
      isStereoEnabled,
    },
    handlers: {
      onTopologyFileSelect: handleTopologyFileSelect,
      onTrajectoryFileSelect: handleTrajectoryFileSelect,
      onChangeBackgroundColor: handleChangeBackgroundColor,
      onToggleSpin: handleToggleSpin,
      onChangeStructureColor: handleChangeStructureColor,
      onSetRepresentation: (e: React.ChangeEvent<HTMLSelectElement>) =>
        handleSetRepresentation(e.target.value),
      onToggleStereoView: handleToggleStereoView,
      onRecenterView: handleRecenterView,
    },
  };
};
