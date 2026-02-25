"use client";

import React, { useEffect, useRef, useState } from "react";
// @ts-ignore
import * as $3Dmol from "3dmol";

interface StructureViewer3DProps {
  targetId: string;
  positions: number[];
  mask: boolean[];
}

export default function StructureViewer3D({
  targetId,
  positions,
  mask,
}: StructureViewer3DProps): React.ReactNode {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !viewerRef.current) return;

    let viewer: any = null;

    const loadStructure = async () => {
      setIsLoading(true);
      setError(null);
      try {
        viewer = $3Dmol.createViewer(viewerRef.current, {
          backgroundColor: "#0f172a", // Match slate-900
        });

        const url = `https://alphafold.ebi.ac.uk/files/AF-${targetId}-F1-model_v6.pdb`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch PDB: ${response.statusText}`);
        }

        const pdbData = await response.text();

        viewer.addModel(pdbData, "pdb");

        // Color mapping
        // Create a mapping of position -> color
        const colorMap = new Map<number, string>();
        for (let i = 0; i < positions.length; i++) {
          // Green if KEPT (true), Grey if SKIPPED (false)
          colorMap.set(positions[i], mask[i] ? "#4ade80" : "#475569");
        }

        // Apply styles
        viewer.setStyle(
          {},
          {
            sphere: {
              colorfunc: (atom: any) => {
                // atom.resi is the residue number
                const resNum = parseInt(atom.resi, 10);
                return colorMap.get(resNum) || "#475569"; // default grey if not found
              },
            },
          },
        );

        viewer.zoomTo();
        viewer.render();
      } catch (err: any) {
        console.error("Error loading 3D structure:", err);
        setError(err.message || "Failed to load structure.");
      } finally {
        setIsLoading(false);
      }
    };

    loadStructure();

    return () => {
      // Cleanup if needed, though 3dmol doesn't have a strict destroy method that is widely used,
      // emptying the container is usually enough when the component unmounts.
      if (viewerRef.current) {
        viewerRef.current.innerHTML = "";
      }
    };
  }, [isLoaded, targetId, positions, mask]);

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
