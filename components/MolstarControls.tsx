"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Menu,
  Upload,
  Play,
  Square,
  Eye,
  EyeOff,
  Maximize2,
  RotateCw,
  Cross,
} from "lucide-react";

type FileInputProps = {
  topology: null | string;
  trajectory: null | string;
};

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
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
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
  isOpen,
  onOpenChange,
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
    <>
      {/* Hamburger Button - Fixed position */}

      <Button
        variant="outline"
        size="icon"
        className={`${
          !isOpen ? "fixed top-20 left-4 z-50" : "fixed top-20 left-90 z-50"
        } bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60`}
        onClick={() => onOpenChange(!isOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-[70px] h-[calc(100vh-70px)] bg-background border-r transition-all duration-300 ease-in-out z-40 ${
          isOpen ? "w-[400px] translate-x-0" : "w-0 -translate-x-full"
        }`}
      >
        <div className={`w-[400px] h-full ${isOpen ? "block" : "hidden"}`}>
          <ScrollArea className="h-[calc(100vh-150px)] px-6">
            <div className="flex flex-col space-y-4 pb-4">
              {/* Hidden File Inputs */}
              <input
                type="file"
                accept=".pdb, .gro, .cif, .mmcif"
                style={{ display: "none" }}
                ref={topologyInputRef}
                onChange={onTopologyFileSelect}
              />
              <input
                type="file"
                accept=".xtc, .dcd"
                style={{ display: "none" }}
                ref={trajectoryInputRef}
                onChange={onTrajectoryFileSelect}
              />

              {/* File Loading Section */}
              <div className="space-y-3 pt-5">
                <h3 className="text-sm font-semibold">File Loading</h3>

                <Button
                  onClick={onTopologyBtnClick}
                  disabled={
                    activeViewport === 1
                      ? viewport1Files.topology !== null
                      : viewport2Files.topology !== null
                  }
                  variant={
                    activeViewport === 1
                      ? viewport1Files.topology
                        ? "default"
                        : "secondary"
                      : viewport2Files.topology
                      ? "default"
                      : "secondary"
                  }
                  className="w-full justify-start"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  <span className="truncate">
                    {(activeViewport === 1
                      ? viewport1Files.topology
                      : viewport2Files.topology) || "Load Topology File"}
                  </span>
                </Button>

                <Button
                  onClick={onTrajectoryBtnClick}
                  disabled={
                    activeViewport === 1
                      ? viewport1Files.trajectory !== null
                      : viewport2Files.trajectory !== null
                  }
                  variant={
                    activeViewport === 1
                      ? viewport1Files.trajectory
                        ? "default"
                        : "secondary"
                      : viewport2Files.trajectory
                      ? "default"
                      : "secondary"
                  }
                  className="w-full justify-start"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  <span className="truncate">
                    {(activeViewport === 1
                      ? viewport1Files.trajectory
                      : viewport2Files.trajectory) || "Load Trajectory File"}
                  </span>
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const targetSetter =
                        activeViewport === 1
                          ? setViewport1Loaded
                          : setViewport2Loaded;
                      targetSetter(true);
                      handlers.loadStructureRepresentation();
                      setTopologyFilename(null);
                      setTrajectoryFilename(null);
                      activeViewport === 1 && setActiveViewport(2);
                    }}
                    className="flex-1"
                  >
                    Load Structure
                  </Button>

                  <Select
                    value={activeViewport.toString()}
                    onValueChange={(value) =>
                      setActiveViewport(Number(value) as 1 | 2)
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">
                        Viewport 1 {viewport1Loaded && "✓"}
                      </SelectItem>
                      <SelectItem value="2">
                        Viewport 2 {viewport2Loaded && "✓"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Statistics Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Statistics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Frame Count
                    </Label>
                    <div className="p-3 rounded-md border bg-muted text-center font-semibold">
                      {state.frameCount}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Atom Count
                    </Label>
                    <div className="p-3 rounded-md border bg-muted text-center font-semibold">
                      {state.atomcount}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Colors Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Colors</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="bgColor" className="text-xs">
                      Background
                    </Label>
                    <input
                      type="color"
                      id="bgColor"
                      value={state.bgColor}
                      onChange={handlers.onChangeBackgroundColor}
                      className="w-full h-10 rounded-md border cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="structureColor" className="text-xs">
                      Structure
                    </Label>
                    <input
                      type="color"
                      id="structureColor"
                      value={state.structureColor}
                      onChange={handlers.onChangeStructureColor}
                      className="w-full h-10 rounded-md border cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Animation Controls */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Animation</h3>

                <Button
                  onClick={handlers.toggleTragractoryAnimation}
                  variant="outline"
                  className="w-full"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Toggle Trajectory
                </Button>

                <Button
                  onClick={handlers.onToggleSpin}
                  variant={state.isSpinning ? "destructive" : "outline"}
                  className="w-full"
                >
                  {state.isSpinning ? (
                    <>
                      <Square className="mr-2 h-4 w-4" />
                      Stop Spin
                    </>
                  ) : (
                    <>
                      <RotateCw className="mr-2 h-4 w-4" />
                      Start Spin
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              {/* View Controls */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">View Controls</h3>

                <div className="space-y-2">
                  <Label className="text-xs">Representation</Label>
                  <Select
                    onValueChange={(value) => {
                      const event = {
                        target: { value },
                      } as React.ChangeEvent<HTMLSelectElement>;
                      handlers.onSetRepresentation(event);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Representation" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.representationTypes.map(([type, label]) => (
                        <SelectItem key={type} value={type}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">View Mode</Label>
                  <Select onValueChange={handlers.handleViewModeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select view mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="perspective">Perspective</SelectItem>
                      <SelectItem value="orthographic">Orthographic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handlers.onToggleStereoView}
                  variant={state.isStereoEnabled ? "destructive" : "outline"}
                  className="w-full"
                >
                  {state.isStereoEnabled ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Disable Stereo
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Enable Stereo
                    </>
                  )}
                </Button>

                <Button
                  onClick={handlers.onRecenterView}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Recenter View
                </Button>

                <Button
                  onClick={handlers.handleFullScreenToggle}
                  variant="outline"
                  className="w-full"
                >
                  <Maximize2 className="mr-2 h-4 w-4" />
                  Full Screen
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

export default MolstarControls;
