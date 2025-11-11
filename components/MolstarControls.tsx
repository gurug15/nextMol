// MolstarControls.tsx
"use client";

import React, { Dispatch, SetStateAction, useState } from "react";

type FileInputProps = {
  topology: null | string;
  trajectory: null | string;
};

// Define props for the controls component
type MolstarControlsProps = {
  state: {
    isSpinning: boolean;
    bgColor: string;
    structureColor: string;
    representationTypes: [string, string][];
    isStereoEnabled: boolean;
    frameCount: number;
    atomcount: number;
  };
  handlers: {
    onTopologyFileSelect: (file: File) => void;
    onTrajectoryFileSelect: (file: File) => void;
    onToggleSpin: () => void;
    onChangeBackgroundColor: (
      event: React.ChangeEvent<HTMLInputElement>
    ) => void;
    onChangeStructureColor: (
      event: React.ChangeEvent<HTMLInputElement>
    ) => void;
    onSetRepresentation: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    onToggleStereoView: () => void;
    onRecenterView: () => void;
    toggleTragractoryAnimation: () => void;
    handleViewModeChange: (mode: string) => void;
    handleFullScreenToggle: () => void;
    loadStructureRepresentation: () => void;
  };
  activeViewport: 1 | 2;
  setActiveViewport: Dispatch<SetStateAction<2 | 1>>;
  viewport1Loaded: boolean;
  viewport2Loaded: boolean;
  setViewport1Loaded: Dispatch<SetStateAction<boolean>>;
  setViewport2Loaded: Dispatch<SetStateAction<boolean>>;
};

const MolstarControls = ({
  state,
  handlers,
  activeViewport,
  setActiveViewport,
  viewport1Loaded,
  viewport2Loaded,
  setViewport1Loaded,
  setViewport2Loaded,
}: MolstarControlsProps) => {
  const topologyInputRef = React.useRef<HTMLInputElement | null>(null);
  const trajectoryInputRef = React.useRef<HTMLInputElement | null>(null);
  const [topologyFilename, setTopologyFilename] = React.useState<string | null>(
    null
  );
  const [trajectoryFilename, setTrajectoryFilename] = React.useState<
    string | null
  >(null);
  const [viewport1Files, setViewport1Files] = useState<FileInputProps>({
    topology: null,
    trajectory: null,
  });
  const [viewport2Files, setViewport2Files] = useState<FileInputProps>({
    topology: null,
    trajectory: null,
  });
  const onTopologyBtnClick = () => {
    topologyInputRef.current?.click();
  };
  const onTrajectoryBtnClick = () => {
    trajectoryInputRef.current?.click();
  };
  const onTrajectoryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeViewport === 1) {
      setViewport1Files({
        ...viewport1Files,
        trajectory: e.target.files ? e.target.files[0].name : null,
      });
      handlers.onTrajectoryFileSelect(e.target.files![0]);
      setViewport1Loaded(true);
      console.log("Viewport 1 loaded set to true", viewport1Loaded);
    } else {
      setViewport2Files({
        ...viewport2Files,
        trajectory: e.target.files ? e.target.files[0].name : null,
      });
      handlers.onTrajectoryFileSelect(e.target.files![0]);
      setViewport2Loaded(true);
    }

    if (e.target.files && e.target.files.length > 0) {
      setTrajectoryFilename(e.target.files[0].name);
    }
  };

  const onTopologyFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeViewport === 1) {
      setViewport1Files({
        ...viewport1Files,
        topology: e.target.files ? e.target.files[0].name : null,
      });
      handlers.onTopologyFileSelect(e.target.files![0]);
    } else {
      setViewport2Files({
        ...viewport2Files,
        topology: e.target.files ? e.target.files[0].name : null,
      });
      handlers.onTopologyFileSelect(e.target.files![0]);
    }

    if (e.target.files && e.target.files.length > 0) {
      setTopologyFilename(e.target.files[0].name);
    }
  };

  return (
    <div className=" w-1/7  flex flex-col justify-start p-4 ">
      <div className="flex flex-col space-y-5">
        {/* --- Hidden Inputs (Unchanged) --- */}
        <input
          type="file"
          accept=".pdb, .gro, .cif, .mmcif"
          placeholder="Select Topology File"
          style={{ display: "none" }}
          ref={topologyInputRef}
          onChange={onTopologyFileSelect}
        />
        <input
          type="file"
          accept=".xtc, .dcd"
          placeholder="Select Trajectory File"
          style={{ display: "none" }}
          ref={trajectoryInputRef}
          onChange={onTrajectoryFileSelect}
        />

        {/* --- File Buttons (Themed) --- */}
        <button
          onClick={onTopologyBtnClick}
          disabled={
            activeViewport == 1
              ? viewport1Files.topology !== null
              : viewport2Files.topology !== null
          }
          className={`w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md text-white font-medium text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          !(activeViewport == 1
            ? viewport1Files.topology
            : viewport2Files.topology)
            ? "bg-slate-500 hover:bg-slate-600 focus:ring-slate-400"
            : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
        }`}
        >
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
            {(activeViewport == 1
              ? viewport1Files.topology
              : viewport2Files.topology) || "Load Topology File"}
          </span>
        </button>

        <button
          onClick={onTrajectoryBtnClick}
          disabled={
            activeViewport == 1
              ? viewport1Files.trajectory !== null
              : viewport2Files.trajectory !== null
          }
          className={`w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md text-white font-medium text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          !(activeViewport == 1
            ? viewport1Files.trajectory
            : viewport2Files.trajectory)
            ? "bg-slate-500 hover:bg-slate-600 focus:ring-slate-400"
            : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
        }`}
        >
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
            {(activeViewport == 1
              ? viewport1Files.trajectory
              : viewport2Files.trajectory) || "Load Trajectory File"}
          </span>
        </button>
        <div className="flex w-full">
          <button
            onClick={() => {
              const targetSetter =
                activeViewport === 1 ? setViewport1Loaded : setViewport2Loaded;
              targetSetter((prev) => true);
              handlers.loadStructureRepresentation();
              setTopologyFilename(null);
              setTrajectoryFilename(null);
              activeViewport == 1 && setActiveViewport(2);
            }}
            className="px-3 py-1 w-1/3 text-lg rounded-md cursor-pointer 
              text-gray-900 dark:text-gray-100 
              bg-gray-200 dark:bg-gray-800 
                border border-gray-200 dark:border-gray-700 
                shadow-[6px_6px_12px_#c5c5c5,-6px_-6px_12px_#fff] 
                dark:shadow-[6px_6px_12px_#111,-6px_-6px_12px_#2a2a2a] 
                active:shadow-inner transition-all duration-300"
          >
            Load
          </button>
          <div className="ml-2 w-2/3 bg-black text-white">
            <select
              value={activeViewport}
              onChange={(e) =>
                setActiveViewport(Number(e.target.value) as 1 | 2)
              }
              className="w-full p-2 border border-gray-300  bg-black rounded-md"
            >
              <option
                value={1}
                className={`${viewport1Loaded && "text-green-200"}`}
              >
                Viewport 1
              </option>
              <option
                value={2}
                className={`${viewport2Loaded && "text-green-200"}`}
              >
                Viewport 2
              </option>
            </select>
          </div>
        </div>
        <div className="w-full flex px-0.5 space-x-4">
          <div className="w-full flex flex-col items-start space-y-2">
            <label
              htmlFor="bgColor"
              className="text-sm text-gray-300 font-semibold"
            >
              Frame Count:
            </label>
            <div className="w-full h-10 p-1 border border-gray-300 rounded-md cursor-pointer text-xl text-center pt-1">
              {state.frameCount}
            </div>
          </div>

          <div className="w-full flex flex-col items-start space-y-2">
            <label
              htmlFor="structureColor"
              className="text-sm text-gray-300 font-semibold"
            >
              Atom Count:
            </label>
            <div className="w-full h-10 p-1 border border-gray-300 rounded-md cursor-pointer text-center text-xl pt-1">
              {state.atomcount}
            </div>
          </div>
        </div>
        {/* --- Color Pickers (Aligned & Styled) --- */}
        <div className="w-full flex px-0.5 space-x-4">
          <div className="w-full flex flex-col items-start space-y-2">
            <label
              htmlFor="bgColor"
              className="text-sm text-gray-300 font-semibold"
            >
              BG Color
            </label>
            <input
              type="color"
              id="bgColor"
              value={state.bgColor}
              onChange={handlers.onChangeBackgroundColor}
              className="w-full h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>

          <div className="w-full flex flex-col items-start space-y-2">
            <label
              htmlFor="structureColor"
              className="text-sm text-gray-300 font-semibold"
            >
              Structure Color
            </label>
            <input
              type="color"
              id="structureColor"
              value={state.structureColor}
              onChange={handlers.onChangeStructureColor}
              className="w-full h-10 p-1 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
        </div>
        <button
          onClick={handlers.toggleTragractoryAnimation}
          className={`w-full inline-flex items-center bg-blue-600 justify-center px-4 py-2.5 rounded-md text-white font-medium text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
          `}
        >
          Toggle Trajectory Animation
        </button>
        {/* --- Stereo Toggle (Themed) --- */}
        <button
          onClick={handlers.onToggleStereoView}
          className={`w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md text-white font-medium text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          state.isStereoEnabled
            ? "bg-red-400 hover:bg-red-500 focus:ring-red-200"
            : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        }`}
        >
          {state.isStereoEnabled ? "Disable Stereo View" : "Enable Stereo View"}
        </button>
        {/* --- Spin Toggle (Themed) --- */}
        <button
          onClick={handlers.onToggleSpin}
          className={`w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md text-white font-medium text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          state.isSpinning
            ? "bg-red-400 hover:bg-red-500 focus:ring-red-200"
            : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        }`}
        >
          {state.isSpinning ? "Stop Spin" : "Start Spin"}
        </button>
        {/* {state.isSpinning && (
          <input
            type="range"
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md text-white font-medium text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2"
            min={0}
            max={1}
            step={0.02}
            value={state.rotationSpeed}
            onChange={(event) => {
              handlers.setRotationSpeed(parseFloat(event.target.value));
            }}
          />
        )} */}
        {/* --- Representation Dropdown (Styled) --- */}
        <div className="w-full flex flex-col items-start space-y-2">
          <label
            htmlFor="representation"
            className="text-sm text-gray-300 font-semibold"
          >
            Representation
          </label>
          <select
            id="representation"
            onChange={handlers.onSetRepresentation}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            <option className="bg-black text-gray-50" value="">
              Select Representation
            </option>
            {state.representationTypes.map(([type, label]) => (
              <option key={type} className="bg-black text-gray-50" value={type}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full flex flex-col items-start space-y-2">
          <label
            htmlFor="representation"
            className="text-sm text-gray-300 font-semibold"
          >
            ViewMode
          </label>
          <select
            id="representation"
            onChange={(e) => handlers.handleViewModeChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            <option className="bg-black text-gray-50" disabled value="">
              Select view
            </option>
            {["perspective", "orthographic"].map((type) => (
              <option key={type} className="bg-black text-gray-50" value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* --- Recenter Button (Themed) --- */}
        <button
          onClick={handlers.onRecenterView}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md text-white font-medium text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
        bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
        >
          Recenter View
        </button>
        <button
          onClick={handlers.handleFullScreenToggle}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md text-white font-medium text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
        bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
        >
          Full Screen
        </button>
      </div>
    </div>
  );
};
export default MolstarControls;
