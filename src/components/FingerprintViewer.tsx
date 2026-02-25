"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

type FingerprintData = {
  targetId: string;
  sequence: string;
  positions: number[];
  mask: boolean[];
  rsasa: number[];
  smoothedRsasa: number[];
  plddt: number[];
  rsasaThreshold: number | null;
};

export default function FingerprintViewer({ data }: { data: FingerprintData }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [viewportDims, setViewportDims] = useState({ vh: 0 });

  useEffect(() => {
    const handleResize = () => {
      setViewportDims({ vh: window.innerHeight });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Use 10vh as the max height for the bars, defaulting if not mounted
  const rsasaMaxHt = viewportDims.vh ? viewportDims.vh * 0.1 : 50;
  const plddtMaxHt = viewportDims.vh ? viewportDims.vh * 0.1 : 50;

  // Calculate dynamic threshold positions relative to container
  const rsasaThreshPos =
    data.rsasaThreshold !== null
      ? `calc(50% + 14px + ${data.rsasaThreshold * 10}vh)`
      : "auto";

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 text-slate-50 overflow-hidden font-sans">
      <header className="px-5 py-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors text-slate-300 hover:text-white"
            title="Back to Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl m-0 text-slate-200">
              Target Fingerprint: {data.targetId}
            </h1>
            <p className="subtitle text-slate-400 m-0 text-sm">
              1D sequence track mapping.
            </p>
          </div>
        </div>

        {/* Legend Panel */}
        <div className="flex gap-6 items-center bg-black/20 py-2 px-3 rounded-lg border border-slate-700">
          <div>
            <p className="subtitle text-[11px] mb-1 font-bold">LEGEND</p>
            <div className="flex gap-3 text-[11px] text-slate-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-sky-500 inline-block"></span>
                rSASA
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-violet-500 inline-block"></span>
                Smoothed rSASA
              </span>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-600"></div>
          <div>
            <p className="subtitle text-[11px] mb-1 font-bold">THRESHOLDS</p>
            <div className="flex gap-3 text-[11px] text-slate-300">
              <span className="flex items-center gap-1">
                <span className="w-3 h-px border-t border-red-500 inline-block"></span>
                pLDDT = 70.0
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-px border-t border-dashed border-slate-400 inline-block"></span>
                Smoothed rSASA ={" "}
                <span>
                  {data.rsasaThreshold !== null
                    ? data.rsasaThreshold.toFixed(2)
                    : "None (fits)"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 1D Scroll View */}
      <div className="chart-wrapper">
        <div className="chart-container">
          <div className="lines-container">
            {data.rsasaThreshold !== null && (
              <div
                className="thresh-rsasa"
                style={{ bottom: rsasaThreshPos }}
              ></div>
            )}
            <div className="thresh-plddt"></div>
          </div>

          {/* Columns */}
          {data.sequence.split("").map((aa, i) => {
            const rsasa = data.rsasa[i];
            const smoothed_rsasa = data.smoothedRsasa[i];
            const plddt = data.plddt[i];
            const isMaskedIn = data.mask[i];

            const rsasaHeight = Math.min(rsasa, 1.0) * rsasaMaxHt;
            const smoothedRsasaHeight =
              Math.min(smoothed_rsasa, 1.0) * rsasaMaxHt;
            const plddtHeight = (plddt / 100) * plddtMaxHt;

            const inOutClass = isMaskedIn ? "in" : "out";
            const activeClass = hoveredIdx === i ? "active" : "";

            return (
              <div key={i} className={`col ${inOutClass} ${activeClass}`}>
                <div
                  className="hover-target"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                ></div>
                <div className="rsasa-cell">
                  <div
                    className="rsasa-bar"
                    style={{ height: `${rsasaHeight}px` }}
                  ></div>
                  <div
                    className="smoothed-rsasa-bar"
                    style={{ height: `${smoothedRsasaHeight}px` }}
                  ></div>
                </div>
                <div className="seq-cell">{aa}</div>
                <div className="plddt-cell">
                  <div
                    className="plddt-bar"
                    style={{ height: `${plddtHeight}px` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Tooltip */}
      {hoveredIdx !== null && (
        <div className="custom-tooltip visible">
          <h2>
            <span>
              Pos <span>{data.positions[hoveredIdx]}</span>
            </span>
            <span>{data.sequence[hoveredIdx]}</span>
          </h2>
          <div className="row">
            <span className="label">Status</span>
            <span className={`badge ${data.mask[hoveredIdx] ? "in" : "out"}`}>
              {data.mask[hoveredIdx] ? "KEPT" : "SKIPPED"}
            </span>
          </div>
          <div className="row">
            <span className="label">rSASA</span>
            <span className="value">
              {(data.rsasa[hoveredIdx] || 0)?.toFixed(3)}
            </span>
          </div>
          <div className="row">
            <span className="label">Sm. rSASA</span>
            <span className="value" style={{ color: "#c4b5fd" }}>
              {(data.smoothedRsasa[hoveredIdx] || 0)?.toFixed(3)}
            </span>
          </div>
          <div className="row">
            <span className="label">pLDDT</span>
            <span className="value">
              {(data.plddt[hoveredIdx] || 0)?.toFixed(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
