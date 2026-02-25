"use client";

import React, { useEffect, useRef, useState } from "react";
// @ts-ignore
import * as $3Dmol from "3dmol";

interface StructureViewer3DProps {
  targetId: string;
  positions: number[];
  mask: boolean[];
  selectedPos: number | null;
  onPosSelect: (pos: number) => void;
}

export default function StructureViewer3D({
  targetId,
  positions,
  mask,
  selectedPos,
  onPosSelect,
}: StructureViewer3DProps): React.ReactNode {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstanceRef = useRef<any>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to color a residue based on mask and selected State
  const applyStyles = (viewer: any, selPos: number | null) => {
    const colorMap = new Map<number, string>();
    for (let i = 0; i < positions.length; i++) {
      colorMap.set(positions[i], mask[i] ? "#4ade80" : "#475569");
    }

    viewer.setStyle(
      {},
      {
        sphere: {
          colorfunc: (atom: any) => {
            const resNum = parseInt(atom.resi, 10);
            if (resNum === selPos) {
              return "#fef08a"; // High visibility yellow for selected
            }
            return colorMap.get(resNum) || "#475569";
          },
        },
      },
    );
    viewer.render();
  };

  // 1. Initial Load Effect
  useEffect(() => {
    if (!isLoaded || !viewerRef.current) return;
    if (viewerInstanceRef.current) return; // already loaded

    let viewer: any = null;

    const loadStructure = async () => {
      setIsLoading(true);
      setError(null);
      try {
        viewer = $3Dmol.createViewer(viewerRef.current, {
          backgroundColor: "#0f172a",
        });

        const url = `https://alphafold.ebi.ac.uk/files/AF-${targetId}-F1-model_v6.pdb`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch PDB: ${response.statusText}`);
        }

        const pdbData = await response.text();
        viewer.addModel(pdbData, "pdb");

        // Make atoms clickable
        viewer.setClickable({}, true, (atom: any) => {
          if (atom.resi) {
            onPosSelect(parseInt(atom.resi, 10));
          }
        });

        viewerInstanceRef.current = viewer;

        applyStyles(viewer, selectedPos);
        viewer.zoomTo();
      } catch (err: any) {
        console.error("Error loading 3D structure:", err);
        setError(err.message || "Failed to load structure.");
      } finally {
        setIsLoading(false);
      }
    };

    loadStructure();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.innerHTML = "";
      }
      viewerInstanceRef.current = null;
    };
  }, [isLoaded, targetId]);

  // 2. React to selectedPos changes
  useEffect(() => {
    if (viewerInstanceRef.current) {
      const viewer = viewerInstanceRef.current;
      applyStyles(viewer, selectedPos);

      if (selectedPos !== null) {
        // Center the camera on the newly selected residue without zooming.
        // passing 500 for a 500ms smooth animation duration.
        viewer.center({ resi: selectedPos.toString() }, 500);
      }
    }
  }, [selectedPos, positions, mask]);

  if (!isLoaded) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-slate-900 border-t border-slate-700">
        <button
          onClick={() => setIsLoaded(true)}
          className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-500 shadow-lg"
        >
          Load 3D Structure
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] relative bg-slate-900 border-t border-slate-700">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/80">
          <div className="text-slate-200 animate-pulse font-semibold">
            Downloading and rendering structure...
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900">
          <div className="text-red-400 font-semibold bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/30">
            {error}
          </div>
        </div>
      )}
      <div ref={viewerRef} className="w-full h-full" />
    </div>
  );
}
