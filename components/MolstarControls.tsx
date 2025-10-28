// MolstarControls.tsx
"use client";

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
  };
};

const MolstarControls = ({ state, handlers }: MolstarControlsProps) => {
  return (
    <div className="pt-10 w-1/4 h-screen flex flex-col items-center justify-start">
      <div className="flex flex-col items-center justify-start p-4">
        <input
          type="file"
          className="border"
          placeholder="Select Topology File"
          onChange={handlers.onTopologyFileSelect}
        />
        <input
          type="file"
          className="border"
          placeholder="Select Trajectory File"
          onChange={handlers.onTrajectoryFileSelect}
        />
        <button
          onClick={handlers.onToggleSpin}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          {/* Fixed button text logic */}
          {state.isSpinning ? "Stop Spin" : "Start Spin"}
        </button>
        <div className="mt-4 flex flex-col items-center">
          <label htmlFor="bgColor" className="mb-2">
            Select Background Color:
          </label>
          <input
            type="color"
            id="bgColor"
            value={state.bgColor}
            onChange={handlers.onChangeBackgroundColor}
          />
        </div>
        <div className="mt-4 flex flex-col items-center">
          <label htmlFor="structureColor" className="mb-2">
            Select Structure Color:
          </label>
          <input
            type="color"
            id="structureColor"
            value={state.structureColor}
            onChange={handlers.onChangeStructureColor}
          />
        </div>
        <div>
          <button
            onClick={handlers.onToggleStereoView}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            {state.isStereoEnabled
              ? "Disable Stereo View"
              : "Enable Stereo View"}
          </button>
        </div>
        <div className="">
          <label className="mt-4 mb-2">Select Representation:</label>
          <select
            onChange={handlers.onSetRepresentation}
            className="border p-2 rounded"
          >
            <option value="">--Select--</option>
            {state.representationTypes.map(([type, label]) => (
              <option key={type} className="text-black" value={type}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            onClick={handlers.onRecenterView}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded"
          >
            Recenter View
          </button>
        </div>
      </div>
    </div>
  );
};
export default MolstarControls;
