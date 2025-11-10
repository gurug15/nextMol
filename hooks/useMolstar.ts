"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec";
import { UUID } from "molstar/lib/mol-util";
import { Asset } from "molstar/lib/mol-util/assets";
import { v4 as uuidv4 } from "uuid";
import { Color } from "molstar/lib/mol-util/color";
import { PluginStateObject } from "molstar/lib/mol-plugin-state/objects";
import {
  BuiltInCoordinatesFormat,
  XtcProvider,
} from "molstar/lib/mol-plugin-state/formats/coordinates";
import { PluginStateAnimation } from "molstar/lib/mol-plugin-state/animation/model";
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms";
import { BuiltInTrajectoryFormat } from "molstar/lib/mol-plugin-state/formats/trajectory";

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
  const [frameCount, setFrameCount] = useState<number>(0);
  const [atomcount, setAtomcount] = useState<number>(0);
  // const [rotationSpeed, setRotationSpeed] = useState(0.25);
  const [selectedRepresentation, setSelectedRepresentation] =
    useState<string>("");
  const [isStructureLoaded, setIsStructureLoaded] = useState(false);
  const [isStereoEnabled, setIsStereoEnabled] = useState(false);
  const [topologyModel, setTopologyModel] = useState<any>(null);
  // Effect for plugin initialization and disposal
  useEffect(() => {
    // Create and initialize the plugin
    const initPlugin = async () => {
      // console.log("Initializing Mol*Star...");
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
          // console.log("Mol*Star initialized successfully!");

          // Set initial background color (original logic had this in spec,
          // but better to set explicitly after init)
          newPlugin.canvas3d?.setProps({
            renderer: {
              backgroundColor: Color(parseInt(bgColor.replace("#", "0x"))),
            },
            interaction: {
              maxFps: 120,
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
    // console.log("plugin in file select:", plugin);
    try {
      const data = await plugin.builders.data.readFile({
        file: assetFile,
        label: file.name,
        isBinary: false,
      });
      const format: BuiltInTrajectoryFormat | undefined = getFormatByExtension(
        file.name
      );
      const topology = await plugin.builders.structure.parseTrajectory(
        data.data.ref,
        format!
      );
      const topologyModel = await plugin.builders.structure.createModel(
        topology
      );
      setTopologyModel(topologyModel);
      // Explore transforms
      // console.log("Available transforms:", Object.keys(StateTransforms));

      // Check Model transforms
      // console.log("Model transforms:", Object.keys(StateTransforms.Model));

      //to load structure representation as single frame
      // await plugin.builders.structure.hierarchy.applyPreset(
      //   topology,
      //   "default"
      // );

      setIsStructureLoaded(true);
      const excludedTypes = [
        "gaussian-volume",
        "gaussian-surface",
        "cross-link-restraint",
        "ellipsoid",
        "carbohydrate",
        "interactions",
      ];
      // 2. Filter by checking if the name is NOT in the list
      const filteredTypes =
        plugin.representation.structure.registry.types.filter(
          (name) => !excludedTypes.includes(name[0])
        );
      // console.log("Filtered representation types:", filteredTypes);
      setRepresentationTypes(filteredTypes);
      setSelectedRepresentation("cartoon");
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
    const assetFile: Asset.File = {
      kind: "file",
      id: uuidv4() as UUID,
      name: file.name,
      file: file,
    };
    try {
      const trajectoryData = await plugin.builders.data.readFile({
        file: assetFile,
        label: file.name,
        isBinary: true,
      });

      const format: BuiltInCoordinatesFormat | undefined =
        getMolstarCoordinatesFormat(file.name);
      if (format === undefined) {
        console.error("Unsupported trajectory file format");
        return;
      }
      // console.log("all state data", plugin.state.data);
      const result = await plugin.dataFormats
        .get(format)
        ?.parse(plugin, trajectoryData.data.ref);

      const cordinateRef = result.ref;

      const newTrajectory = await plugin
        .build()
        .to(topologyModel)
        .apply(
          StateTransforms.Model.TrajectoryFromModelAndCoordinates,
          {
            modelRef: topologyModel.ref,
            coordinatesRef: cordinateRef,
          },
          {
            dependsOn: [topologyModel.ref, cordinateRef],
          }
        )
        .commit();

      // const models = plugin.state.data.selectQ((q) =>
      //   q.ofType(PluginStateObject.Molecule.Model)
      // );
      // console.log("How many model nodes?", models.length);

      // // Check representations
      // const representations = plugin.state.data.selectQ((q) =>
      //   q.ofType(PluginStateObject.Molecule.Structure.Representation3D)
      // );
      // console.log("How many representations?", representations.length);
      // const allTrajectories = plugin.state.data.selectQ((q) =>
      //   q.ofType(PluginStateObject.Molecule.Trajectory)
      // );
      // console.log("All trajectories in state:", allTrajectories.length);
      // console.log("New trajectory data:", allTrajectories);

      await plugin.builders.structure.hierarchy.applyPreset(
        newTrajectory,
        "default"
      );
      const representations = plugin.state.data.selectQ((q) =>
        q.ofType(PluginStateObject.Molecule.Structure.Representation3D)
      );

      // Clear existing representations
      for (const repr of representations) {
        await plugin.build().delete(repr.transform.ref).commit();
      }
      handleSetRepresentation(selectedRepresentation);
      console.log("=== CHECK #1: After applyPreset ===");
      const structures1 = plugin.state.data.selectQ((q) =>
        q.ofType(PluginStateObject.Molecule.Structure)
      );
      console.log("Structures found:", structures1.length);
      console.log("Structure cells:", structures1);

      if (structures1.length > 0) {
        console.log("First structure obj:", structures1[0].obj);
        console.log("Has data?", structures1[0].obj?.data);

        if (structures1[0].obj?.data) {
          console.log("Element count:", structures1[0].obj.data.elementCount);
          setAtomcount(structures1[0].obj.data.elementCount);
        }
      }
      setFrameCount(newTrajectory.cell?.obj?.data.frameCount || 0);
      await plugin.managers.animation.start();
    } catch (error: any) {
      console.error("Transform failed:", error);
    }

    // console.log("Current animation tick:", plugin.managers.animation.tick(60));
  };

  const toggleTragractoryAnimation = async () => {
    if (!plugin) return;
    const curentAnimation = plugin.managers.animation.current;
    console.log("Current animation:", plugin.managers.animation);
    if (curentAnimation) {
      if (plugin.managers.animation.isAnimating) {
        console.log("animation:", plugin.managers.animation.isAnimating);
        await plugin.managers.animation.stop();
      } else {
        await plugin.managers.animation.start();
      }
    }
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
    // setRotationSpeed(rotateSpeed);
    // Use the new state value for the logic
    const newSpinState = !isSpinning;
    setIsSpinning(newSpinState);

    plugin.canvas3d.setProps({
      trackball: {
        animate: {
          name: "spin",
          params: {
            speed: newSpinState ? 0.27 : 0, // Use new state
          },
        },
      },
    });
  };

  const handleChangeStructureColor = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newColorHex = event.target.value;
    setStructureColor(newColorHex);

    const intColor = parseInt(newColorHex.replace("#", "0x"));
    const newColor = Color(intColor);

    if (!plugin) return;

    const state = plugin.state.data;
    const structures = state.selectQ((q) =>
      q.ofType(PluginStateObject.Molecule.Structure)
    );

    if (structures.length === 0) return;

    // Update ONLY the color, keep same representation type
    await state
      .build()
      .to(structures[0])
      .applyOrUpdateTagged(
        "main-repr",
        StateTransforms.Representation.StructureRepresentation3D,
        {
          type: {
            name: selectedRepresentation || "cartoon", // Keep current type
            params: {},
          },
          colorTheme: {
            name: "uniform",
            params: { value: newColor },
          },
        }
      )
      .commit();
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

      // Use applyOrUpdateTagged to update in-place instead of delete+create
      await state
        .build()
        .to(structure)
        .applyOrUpdateTagged(
          "main-repr", // Stable tag - always use same tag for updates
          StateTransforms.Representation.StructureRepresentation3D,
          {
            type: {
              name: type,
              params: {},
            },
            colorTheme: {
              name: "uniform",
              params: { value: colorToUse },
            },
          }
        )
        .commit();
    } catch (error) {
      console.error(`Failed to set representation:`, error);
    }
  };
  const handleFullScreenToggle = () => {
    if (!parentRef.current) return;

    if (!document.fullscreenElement) {
      parentRef.current.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleViewModeChange = (mode: string) => {
    if (!plugin?.canvas3d) return;
    // Logic to change view mode based on the selected option
    switch (mode) {
      case "orthographic":
        plugin.canvas3d.setProps({
          camera: { mode: "orthographic" },
        });
        break;
      case "perspective":
        plugin.canvas3d.setProps({
          camera: { mode: "perspective" },
        });
        break;
      default:
        console.warn("Unknown view mode:", mode);
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
        mode: "perspective",
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
      frameCount,
      atomcount,
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
      toggleTragractoryAnimation: toggleTragractoryAnimation,
      handleViewModeChange: handleViewModeChange,
      handleFullScreenToggle: handleFullScreenToggle,
    },
  };
};
