"use client";
import { use } from "react";
import CanvasEditor from "../../components/CanvasEditor";
import TopNav from "../../components/TopNav";

export default function CanvasEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <main className="relative min-h-screen">
      <TopNav />
      <div className="pt-16">
        <CanvasEditor projectId={id} />
      </div>
    </main>
  );
}
