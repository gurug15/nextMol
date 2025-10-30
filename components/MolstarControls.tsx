// MolstarControls.tsx
"use client";

import { on } from "events";
import React from "react";

// Define props for the controls component
type MolstarControlsProps = {
  state: {
    isSpinning: boolean;
    bgColor: string;
    structureColor: string;
    representationTypes: [string, string][];
    isStereoEnabled: boolean;
  };
  handlers: {
    onTopologyFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onTrajectoryFileSelect: (
      event: React.ChangeEvent<HTMLInputElement>
    ) => void;
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
  };
};

const MolstarControls = ({ state, handlers }: MolstarControlsProps) => {
  const topologyInputRef = React.useRef<HTMLInputElement | null>(null);
  const trajectoryInputRef = React.useRef<HTMLInputElement | null>(null);
  const [topologyFilename, setTopologyFilename] = React.useState<string | null>(
    null
  );
  const [trajectoryFilename, setTrajectoryFilename] = React.useState<
    string | null
  >(null);
  const onTopologyBtnClick = () => {
    topologyInputRef.current?.click();
  };
  const onTrajectoryBtnClick = () => {
    trajectoryInputRef.current?.click();
  };
  return (
    <div className="pt-10 w-1/4 h-screen flex flex-col justify-start p-4 bg-black border-r border-gray-200">
      <div className="flex flex-col space-y-5">
        {/* --- Hidden Inputs (Unchanged) --- */}
        <input
          type="file"
          placeholder="Select Topology File"
          style={{ display: "none" }}
          ref={topologyInputRef}
          onChange={(e) => {
            handlers.onTopologyFileSelect(e);
            if (e.target.files && e.target.files.length > 0) {
              setTopologyFilename(e.target.files[0].name);
            }
          }}
        />
        <input
          type="file"
          placeholder="Select Trajectory File"
          style={{ display: "none" }}
          ref={trajectoryInputRef}
          onChange={(e) => {
            handlers.onTrajectoryFileSelect(e);
            if (e.target.files && e.target.files.length > 0) {
              setTrajectoryFilename(e.target.files[0].name);
            }
          }}
        />

        {/* --- File Buttons (Themed) --- */}
        <button
          onClick={onTopologyBtnClick}
          className={`w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md text-white font-medium text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          !topologyFilename
            ? "bg-slate-500 hover:bg-slate-600 focus:ring-slate-400"
            : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
        }`}
        >
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
            {!topologyFilename ? "Load Topology File" : topologyFilename}
          </span>
        </button>

        <button
          onClick={onTrajectoryBtnClick}
          className={`w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md text-white font-medium text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          !trajectoryFilename
            ? "bg-slate-500 hover:bg-slate-600 focus:ring-slate-400"
            : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
        }`}
        >
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
            {!trajectoryFilename ? "Load Trajectory File" : trajectoryFilename}
          </span>
        </button>

        {/* --- Color Pickers (Aligned & Styled) --- */}
        <div className="w-full flex px-0.5 space-x-4">
          <div className="w-full flex flex-col items-start space-y-2">
            <label
              htmlFor="bgColor"
              className="text-sm text-gray-300 font-semibold"
            >
              Background Color
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
          className={`w-full inline-flex items-center bg-blue-500 justify-center px-4 py-2.5 rounded-md text-white font-medium text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
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

        {/* --- Recenter Button (Themed) --- */}
        <button
          onClick={handlers.onRecenterView}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md text-white font-medium text-sm transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
        bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
        >
          Recenter View
        </button>
      </div>
    </div>
  );
};
export default MolstarControls;
