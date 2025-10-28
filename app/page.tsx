"use client";
// import MolstarViewer from "@/components/MolstarViewr";
import dynamic from "next/dynamic";

const MolstarViewer = dynamic(() => import("../components/MolstarViewr"), {
  ssr: false,
});
export default function page() {
  return (
    <div className="">
      <MolstarViewer />
    </div>
  );
}
