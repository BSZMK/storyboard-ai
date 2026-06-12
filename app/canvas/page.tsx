"use client";
import CanvasEditor from "../components/CanvasEditor";
import TopNav from "../components/TopNav";

export default function CanvasNewPage() {
  return (
    <main className="relative min-h-screen">
      <TopNav />
      <div className="pt-16">
        <CanvasEditor projectId={null} />
      </div>
    </main>
  );
}
