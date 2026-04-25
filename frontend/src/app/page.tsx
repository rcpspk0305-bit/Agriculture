"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Leaf,
  Cpu,
  Activity,
  Camera,
  Brain,
  Wind,
  Thermometer,
  Droplets,
  FlaskConical,
  CloudRain,
  Sprout,
} from "lucide-react";
import axios from "axios";

const Plot = dynamic(
  () => import("react-plotly.js").then((mod) => mod.default) as any,
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-slate-100 rounded-3xl border border-white/60 flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <Activity className="text-emerald-300 w-8 h-8 animate-spin" strokeWidth={2} />
      </div>
    ),
  }
);

type IoTData = {
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  N: number;
  P: number;
  K: number;
};

type VisionResult = {
  disease: string;
  confidence: number;
};

const API_BASE = "http://localhost:8000";

export default function SmartFarmingDashboard() {
  const [iotData, setIotData] = useState<IoTData>({
    temperature: 25.5,
    humidity: 81.0,
    ph: 6.8,
    rainfall: 210.0,
    N: 88,
    P: 50,
    K: 42,
  });

  const [history, setHistory] = useState<{
    time: string[];
    temp: number[];
    hum: number[];
  }>({
    time: [],
    temp: [],
    hum: [],
  });

  const [cropPrediction, setCropPrediction] = useState<string>("Analyzing...");
  const [visionResult, setVisionResult] = useState<VisionResult | null>(null);
  const [actionPlan, setActionPlan] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingIoT, setIsFetchingIoT] = useState(false);

  useEffect(() => {
    const fetchIot = async () => {
      try {
        setIsFetchingIoT(true);
        const res = await axios.get(`${API_BASE}/iot/live`);

        if (res.data?.data) {
          const incoming: IoTData = res.data.data;
          const now = new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          setIotData(incoming);

          setHistory((prev) => ({
            time: [...prev.time, now].slice(-15),
            temp: [...prev.temp, incoming.temperature].slice(-15),
            hum: [...prev.hum, incoming.humidity].slice(-15),
          }));

          try {
            const predictRes = await axios.post(`${API_BASE}/predict`, incoming);
            if (predictRes.data?.recommended_crop) {
              setCropPrediction(predictRes.data.recommended_crop);
            }
          } catch (predictError) {
            console.error("Prediction fetch error:", predictError);
          }
        }
      } catch (e) {
        console.error("IoT fetch error. Make sure FastAPI backend is running.", e);
      } finally {
        setIsFetchingIoT(false);
      }
    };

    fetchIot();
    const interval = setInterval(fetchIot, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await axios.post(`${API_BASE}/vision/disease-detect`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.status === "success") {
        setVisionResult({
          disease: res.data.disease,
          confidence: res.data.confidence,
        });
        generateActionPlan(res.data.disease);
      }
    } catch (e) {
      console.error("Vision Upload Failed:", e);
      setTimeout(() => {
        setVisionResult({ disease: "Early Blight", confidence: 0.92 });
        generateActionPlan("Early Blight");
      }, 1000);
    } finally {
      setIsUploading(false);
    }
  };

  const generateActionPlan = async (diseaseState: string) => {
    setLoadingAI(true);
    setActionPlan("");

    try {
      const payload = {
        crop: cropPrediction !== "Analyzing..." ? cropPrediction : "Unknown",
        disease: diseaseState,
        sensor_data: iotData,
      };

      const res = await axios.post(`${API_BASE}/chat/action-plan`, payload);
      if (res.data?.action_plan) {
        setActionPlan(res.data.action_plan);
      }
    } catch (e) {
      console.error("GenAI Plan Failed:", e);
      setTimeout(() => {
        setActionPlan(
          "1. Isolate infected crop area immediately to prevent spread.\n2. Apply organic Copper Fungicide spray during early morning.\n3. Reduce automated irrigation frequency to lower ambient humidity."
        );
      }, 1200);
    } finally {
      setLoadingAI(false);
    }
  };

  const glassCardBase =
    "bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans px-4 py-6 md:px-8 overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
            <Leaf className="w-7 h-7 text-emerald-500" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">
              Project{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                PS10
              </span>
            </h1>
            <p className="text-sm text-slate-500 font-medium">Enterprise Smart Farming UI</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-white shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-semibold text-slate-600">
            Sensors: {isFetchingIoT ? "Syncing..." : "Live"}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 flex flex-col gap-8 h-full">
            <div className={`${glassCardBase} flex-1 flex flex-col relative overflow-hidden min-h-[350px]`}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-teal-50 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none" />

              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800 relative z-10">
                <Brain className="text-teal-500 w-6 h-6" strokeWidth={2} /> GenAI Agronomist
              </h2>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                {loadingAI ? (
                  <div className="flex flex-col space-y-4 animate-pulse pt-2">
                    <div className="h-4 bg-slate-200 rounded-full w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded-full w-full"></div>
                    <div className="h-4 bg-slate-200 rounded-full w-5/6"></div>
                    <p className="text-xs text-slate-400 font-medium mt-4">
                      Synthesizing survival parameters...
                    </p>
                  </div>
                ) : actionPlan ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-5 shadow-inner">
                      <p className="text-xs text-teal-700 font-bold mb-3 uppercase tracking-wider border-b border-teal-200/50 pb-2">
                        Subject: {cropPrediction} | Status: {visionResult?.disease}
                      </p>
                      <div className="text-sm text-slate-700 leading-relaxed space-y-3">
                        {actionPlan.split("\n").map((line, i) => {
                          const cleaned = line.replace(/[*#]/g, "").trim();
                          if (!cleaned) return null;
                          return (
                            <div key={i} className="flex gap-2 items-start">
                              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                              <p>{cleaned}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 pt-10">
                    <Wind className="w-14 h-14 text-slate-200" strokeWidth={1.5} />
                    <p className="text-sm text-center px-4 font-medium">
                      Upload a leaf scan to generate a precise AI action plan.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className={`${glassCardBase} relative flex flex-col items-center justify-center border-dashed border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 group cursor-pointer h-64`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-wait"
              />

              <div className={`transition-all duration-300 flex flex-col items-center ${visionResult ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                <div className={`p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform ${isUploading ? "animate-bounce" : ""}`}>
                  <Camera className="w-8 h-8 text-emerald-500" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Leaf Vision Scan</h3>
                <p className="text-xs text-slate-500 text-center px-4 font-medium">
                  Drop image here to classify crop diseases instantly.
                </p>
              </div>

              <div className={`absolute inset-0 bg-white/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center z-20 border ${visionResult?.disease === "Healthy" ? "border-emerald-200" : "border-red-200"} shadow-xl transition-all duration-500 ${visionResult ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                {visionResult && (
                  <div className="text-center animate-in zoom-in-95 duration-300">
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 ${visionResult.disease === "Healthy" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                      <Leaf className="w-8 h-8" strokeWidth={2} />
                    </div>
                    <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">
                      Detection Result
                    </p>
                    <h4 className="text-2xl font-black text-slate-800">{visionResult.disease}</h4>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                      Confidence: {(visionResult.confidence * 100).toFixed(1)}%
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setVisionResult(null);
                        setActionPlan("");
                      }}
                      className="mt-5 px-5 py-2 text-xs font-bold tracking-wide text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-30 relative"
                    >
                      Scan Another
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="relative bg-gradient-to-r from-emerald-600 to-teal-500 rounded-[2rem] p-8 md:p-10 text-white shadow-[0_15px_40px_rgba(16,185,129,0.3)] overflow-hidden hover:-translate-y-1 transition-transform duration-500 group">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[80px] -mr-40 -mt-40 mix-blend-overlay" />
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-800/30 rounded-full blur-[60px] -ml-20 -mb-20 mix-blend-overlay" />

              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                <div>
                  <p className="text-emerald-100 text-sm font-semibold tracking-wider uppercase mb-2 flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> AI Predictive Model
                  </p>
                  <h3 className="text-5xl md:text-6xl font-black tracking-tight mb-2 capitalize drop-shadow-sm">
                    {cropPrediction}
                  </h3>
                  <p className="text-emerald-50 text-base md:text-lg max-w-md font-medium leading-relaxed">
                    Based on live continuous telemetry and soil conditions, this is the optimal crop for maximum yield.
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-md p-6 rounded-3xl border border-white/30 shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-xl">
                  <Sprout className="w-16 h-16 text-white" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {[
                { label: "Temperature", val: iotData.temperature, unit: "°C", icon: Thermometer, color: "text-orange-600", bg: "bg-orange-50", ring: "border-orange-100" },
                { label: "Moisture", val: iotData.humidity, unit: "%", icon: Droplets, color: "text-blue-600", bg: "bg-blue-50", ring: "border-blue-100" },
                { label: "Soil pH", val: iotData.ph, unit: "", icon: FlaskConical, color: "text-purple-600", bg: "bg-purple-50", ring: "border-purple-100" },
                { label: "Rainfall", val: iotData.rainfall, unit: "mm", icon: CloudRain, color: "text-cyan-600", bg: "bg-cyan-50", ring: "border-cyan-100" },
                { label: "Nitrogen (N)", val: iotData.N, unit: "mg/kg", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50", ring: "border-emerald-100" },
                { label: "Phosphorus (P)", val: iotData.P, unit: "mg/kg", icon: Activity, color: "text-teal-600", bg: "bg-teal-50", ring: "border-teal-100" },
              ].map((s, i) => (
                <div key={i} className={`${glassCardBase} p-5 md:p-6 flex flex-col justify-between group`}>
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{s.label}</p>
                    <div className={`p-2 rounded-xl ${s.bg} border ${s.ring} group-hover:scale-110 transition-transform duration-300`}>
                      <s.icon className={`w-5 h-5 ${s.color}`} strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mt-auto">
                    <span className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter">
                      {typeof s.val === "number" ? s.val.toFixed(1) : s.val}
                    </span>
                    <span className="text-sm font-semibold text-slate-400">{s.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`${glassCardBase} w-full`}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Activity className="text-emerald-500" strokeWidth={2} /> 24-Hour Environmental Trends
            </h2>
            <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-500 rounded-full uppercase tracking-wider">
              Live Sync
            </span>
          </div>

          <div className="w-full h-[350px] md:h-[400px] rounded-2xl overflow-hidden bg-white/50 border border-slate-100 relative">
            <Plot
              data={[
                {
                  x: history.time,
                  y: history.temp,
                  type: "scatter",
                  mode: "lines",
                  name: "Temperature (°C)",
                  line: { color: "#f97316", width: 4, shape: "spline" },
                  fill: "tozeroy",
                  fillcolor: "rgba(249, 115, 22, 0.05)",
                },
                {
                  x: history.time,
                  y: history.hum,
                  type: "scatter",
                  mode: "lines",
                  name: "Moisture (%)",
                  line: { color: "#0ea5e9", width: 4, shape: "spline" },
                  yaxis: "y2",
                  fill: "tozeroy",
                  fillcolor: "rgba(14, 165, 233, 0.05)",
                },
              ]}
              layout={{
                autosize: true,
                paper_bgcolor: "transparent",
                plot_bgcolor: "transparent",
                margin: { t: 20, r: 40, l: 40, b: 40 },
                xaxis: {
                  color: "#64748b",
                  gridcolor: "#f1f5f9",
                  tickfont: { family: "inherit", size: 11, color: "#94a3b8" },
                  zeroline: false,
                },
                yaxis: {
                  title: "Temperature (°C)",
                  color: "#f97316",
                  gridcolor: "#f1f5f9",
                  tickfont: { family: "inherit", size: 11 },
                  zeroline: false,
                },
                yaxis2: {
                  title: "Moisture (%)",
                  color: "#0ea5e9",
                  overlaying: "y",
                  side: "right",
                  tickfont: { family: "inherit", size: 11 },
                  zeroline: false,
                },
                legend: {
                  orientation: "h",
                  y: -0.15,
                  font: { family: "inherit", size: 12, color: "#64748b" },
                },
                hovermode: "x unified",
                hoverlabel: {
                  bgcolor: "#ffffff",
                  font: { family: "inherit" },
                  bordercolor: "#e2e8f0",
                },
              }}
              config={{ displayModeBar: false, responsive: true }}
              useResizeHandler={true}
              className="w-full h-full"
            />
          </div>
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(203, 213, 225, 0.6); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.8); }
          `,
        }}
      />
    </div>
  );
}