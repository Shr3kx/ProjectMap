"use client";

import React from "react";
import { RoadmapMindMap } from "./RoadmapMindMap";
import type { RoadmapNodeData } from "@/types/roadmap";

const initialNodes: RoadmapNodeData[] = [
  {
    id: "root",
    title: "Product Strategy",
    description: "Q1 2026 Roadmap",
    status: "active",
    x: 0,
    y: 0,
    depth: 0,
    children: ["1", "2", "3"],
  },
  {
    id: "1",
    title: "User Research",
    description: "Interviews & surveys",
    status: "completed",
    x: -300,
    y: -150,
    depth: 1,
    parentId: "root",
    children: ["1a", "1b"],
  },
  {
    id: "2",
    title: "Feature Development",
    description: "Core functionality",
    status: "active",
    x: 300,
    y: -150,
    depth: 1,
    parentId: "root",
    children: ["2a", "2b"],
  },
  {
    id: "3",
    title: "Marketing",
    description: "Launch campaign",
    status: "pending",
    x: 0,
    y: 200,
    depth: 1,
    parentId: "root",
    children: ["3a"],
  },
  {
    id: "1a",
    title: "User Personas",
    status: "completed",
    x: -450,
    y: -280,
    depth: 2,
    parentId: "1",
  },
  {
    id: "1b",
    title: "Pain Points",
    status: "completed",
    x: -450,
    y: -50,
    depth: 2,
    parentId: "1",
  },
  {
    id: "2a",
    title: "AI Integration",
    status: "active",
    x: 450,
    y: -280,
    depth: 2,
    parentId: "2",
  },
  {
    id: "2b",
    title: "Mobile App",
    status: "idea",
    x: 450,
    y: -50,
    depth: 2,
    parentId: "2",
  },
  {
    id: "3a",
    title: "Social Media",
    status: "pending",
    x: 150,
    y: 330,
    depth: 2,
    parentId: "3",
  },
];

export default function MindMap() {
  return (
    <div className="relative w-full h-full bg-background overflow-hidden">
      <RoadmapMindMap
        nodes={initialNodes}
        showControls
        showLegend
      />
    </div>
  );
}
