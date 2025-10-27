"use client";
import { ChartExample } from "@/components/ExampleComponent";
// import MolstarViewr from "@/components/MolstarViewr";
import React from "react";

import dynamic from "next/dynamic";

const MolstarViewer = dynamic(() => import("@/components/MolstarViewr"), {
  ssr: false,
});
export default function page() {
  return (
    <div className="">
      <MolstarViewer />
    </div>
  );
}
