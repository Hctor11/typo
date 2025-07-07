"use client";
import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ResultModal({ open, wpm, wpmHistory, onClose, accuracy, charStats, consistency, rawWpm, errorCount, totalTime, wordTimes, wordWpm }: {
  open: boolean;
  wpm: number | null;
  wpmHistory: number[];
  onClose: () => void;
  accuracy: number;
  charStats: { correct: number, incorrect: number, extra: number, missed: number };
  consistency: number;
  rawWpm: number;
  errorCount: number;
  totalTime: number;
  wordTimes: number[];
  wordWpm: number[];
}) {
  if (!open) return null;

  // Prepara los datos para la gráfica de velocidad por palabra
  // Eje X: segundos desde el inicio (wordTimes), Eje Y: wordWpm
  const graphLabels = wordTimes && wordTimes.length > 0
    ? [...wordTimes.map(ms => (ms / 1000).toFixed(1)), totalTime.toString()]
    : ["0", totalTime.toString()];
  const graphData = wordWpm && wordWpm.length > 0 ? wordWpm : [0, wpm ?? 0];

  const data = {
    labels: graphLabels,
    datasets: [
      {
        label: "WPM",
        data: graphData,
        fill: true,
        borderColor: "#EC7FA9",
        backgroundColor: "rgba(96,165,250,0.1)",
        pointBackgroundColor: "#EC7FA9",
        pointBorderColor: "#EC7FA9",
        tension: 0.25,
      },
    ],
  };


  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "WPM per second",
        color: "#b4b8cf",
        font: { size: 18, family: 'IBM Plex Mono, monospace' },
        padding: { top: 10, bottom: 10 },
      },
      tooltip: {
        backgroundColor: "#232a3b",
        titleColor: "#ededed",
        bodyColor: "#ededed",
        borderColor: "#60a5fa",
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#b4b8cf", font: { family: 'IBM Plex Mono, monospace' } },
        grid: { color: "#181e2a" },
      },
      x: {
        ticks: { color: "#b4b8cf", font: { family: 'IBM Plex Mono, monospace' } },
        grid: { color: "#181e2a" },
      },
    },
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181e2a]/80 backdrop-blur-sm">
      <div className="bg-[#24283B] rounded-lg shadow-lg p-8 max-w-3xl w-full relative flex flex-col md:flex-row gap-6">
        <button
          className="absolute top-3 right-4 text-[#b4b8cf] hover:text-white text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        {/* Métricas principales */}
        <div className="flex-[3] flex flex-col justify-center pt-10 items-center gap-8 min-w-[200px]">
          <div className="text-6xl font-bold text-[#60a5fa] tracking-tight">{wpm ?? "-"}</div>
          <div className="uppercase text-[#b4b8cf] text-xl font-mono mb-1">wpm</div>
          <div className="text-4xl font-bold text-[#EC7FA9ac] tracking-tight">{accuracy ?? "-"}%</div>
          <div className="uppercase text-[#b4b8cf] text-xl font-mono mb-2">acc</div>
          <div className="mt-6 space-y-2 text-[#b4b8cf] text-lg">
            <div><span className="font-bold text-[#ededed]">test type</span>: <span className="text-[#60a5fa]">words</span></div>
            <div><span className="font-bold text-[#ededed]">time</span>: <span className="text-[#60a5fa]">{totalTime}s</span></div>
            <div><span className="font-bold text-[#ededed]">raw</span>: <span className="text-[#60a5fa]">{rawWpm}</span></div>
          </div>
        </div>
        {/* Detalles y gráfica */}
        <div className="flex-[7] flex flex-col justify-center items-center gap-6 min-w-[250px]">
          <div className="w-full bg-[#181e2a] rounded p-3">
            <Line data={data} options={options} height={180}/>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[#b4b8cf] text-lg w-full mt-2">
            <div><span className="font-bold text-[#ededed]">characters</span> <span className="text-[#60a5fa]">{charStats.correct}</span>/<span className="text-[#EC7FA9ac]">{charStats.incorrect}</span>/<span className="text-[#b4b8cf]">{charStats.extra}</span>/<span className="text-[#b4b8cf]">{charStats.missed}</span></div>
            <div><span className="font-bold text-[#ededed]">errors</span>: <span className="text-[#EC7FA9ac]">{errorCount}</span></div>
            <div><span className="font-bold text-[#ededed]">consistency</span>: <span className="text-[#60a5fa]">{consistency}%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
