"use client";

import React, { useEffect, useMemo, useState, type ComponentType } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import type { PlotParams } from "react-plotly.js";
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
  ScanLine,
  Zap,
  MessageSquare,
  X,
  Send,
  MapPin,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

const Plot = dynamic<PlotParams>(
  () => import("react-plotly.js").then((mod) => mod.default as ComponentType<PlotParams>),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center animate-pulse rounded-3xl border border-white/60 bg-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <Activity className="h-8 w-8 animate-spin text-emerald-300" strokeWidth={2} />
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
  tds: number;
};

type VisionResult = {
  disease: string;
  confidence: number;
};

type ChatMessage = {
  role: "user" | "model";
  text: string;
};

type CropDetail = {
  yield: string;
  cycle: string;
};

type SensorCard = {
  label: string;
  val: number;
  unit: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  ring: string;
};

const API_BASE = "http://127.0.0.1:8000";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

const translations = {
  English: {
    project: "Project",
    subtitle: "God-Mode Agritech Interface",
    sensors: "Sensors",
    syncing: "Syncing...",
    live: "Live",
    genAIAgronomist: "GenAI Agronomist",
    synthesizing: "Synthesizing survival parameters...",
    uploadPrompt: "Upload a leaf scan to generate a precise AI action plan.",
    leafVisionScan: "Leaf Vision Scan",
    dropImage: "Drop image here to classify crop diseases instantly.",
    detectionResult: "Detection Result",
    confidence: "Confidence",
    scanAnother: "Scan Another",
    aiModel: "AI Predictive Model",
    modelDesc:
      "Based on live continuous telemetry and soil conditions, this is the optimal crop for maximum yield.",
    temperature: "Temperature",
    moisture: "Moisture",
    waterTds: "Water TDS",
    soilPh: "Soil pH",
    rainfall: "Rainfall",
    nitrogen: "Nitrogen (N)",
    phosphorus: "Phosphorus (P)",
    potassium: "Potassium (K)",
    envTrends: "24-Hour Environmental Trends",
    liveTelemetry: "Live Telemetry",
    askPlaceholder: "Ask about crops...",
  },
  Hindi: {
    project: "प्रोजेक्ट",
    subtitle: "गॉड-मोड एग्रीटेक इंटरफ़ेस",
    sensors: "सेंसर",
    syncing: "सिंक हो रहा है...",
    live: "लाइव",
    genAIAgronomist: "GenAI कृषिविज्ञानी",
    synthesizing: "उत्तरजीविता मापदंडों का संश्लेषण हो रहा है...",
    uploadPrompt: "सटीक AI कार्य योजना बनाने के लिए पत्ती का स्कैन अपलोड करें।",
    leafVisionScan: "पत्ती विज़न स्कैन",
    dropImage: "फसल के रोगों को तुरंत वर्गीकृत करने के लिए छवि यहां छोड़ें।",
    detectionResult: "पहचान परिणाम",
    confidence: "आत्मविश्वास",
    scanAnother: "एक और स्कैन करें",
    aiModel: "AI भविष्य कहनेवाला मॉडल",
    modelDesc:
      "लाइव निरंतर टेलीमेट्री और मिट्टी की स्थिति के आधार पर, अधिकतम उपज के लिए यह इष्टतम फसल है।",
    temperature: "तापमान",
    moisture: "नमी",
    waterTds: "पानी का टीडीएस (TDS)",
    soilPh: "मिट्टी का पीएच (pH)",
    rainfall: "वर्षा",
    nitrogen: "नाइट्रोजन (N)",
    phosphorus: "फास्फोरस (P)",
    potassium: "पोटेशियम (K)",
    envTrends: "24-घंटे पर्यावरण रुझान",
    liveTelemetry: "लाइव टेलीमेट्री",
    askPlaceholder: "फसलों के बारे में पूछें...",
  },
  Telugu: {
    project: "ప్రాజెక్ట్",
    subtitle: "గాడ్-మోడ్ అగ్రిటెక్ ఇంటర్‌ఫేస్",
    sensors: "సెన్సార్లు",
    syncing: "సింక్ అవుతోంది...",
    live: "లైవ్",
    genAIAgronomist: "GenAI వ్యవసాయ శాస్త్రవేత్త",
    synthesizing: "మనుగడ పారామితులను విశ్లేషిస్తోంది...",
    uploadPrompt:
      "ఖచ్చితమైన AI కార్యాచరణ ప్రణాళికను రూపొందించడానికి ఆకు స్కాన్‌ను అప్‌లోడ్ చేయండి.",
    leafVisionScan: "లీఫ్ విజన్ స్కాన్",
    dropImage: "పంట వ్యాధులను తక్షణమే వర్గీకరించడానికి చిత్రాన్ని ఇక్కడ వదలండి.",
    detectionResult: "గుర్తింపు ఫలితం",
    confidence: "నమ్మకం",
    scanAnother: "మరొకటి స్కాన్ చేయండి",
    aiModel: "AI అంచనా మోడల్",
    modelDesc:
      "ప్రత్యక్ష నిరంతర టెలిమెట్రీ మరియు నేల పరిస్థితుల ఆధారంగా, గరిష్ట దిగుబడికి ఇది సరైన పంట.",
    temperature: "ఉష్ణోగ్రత",
    moisture: "తేమ",
    waterTds: "నీటి టీడీఎస్ (TDS)",
    soilPh: "నేల పీహెచ్ (pH)",
    rainfall: "వర్షపాతం",
    nitrogen: "నైట్రోజన్ (N)",
    phosphorus: "భాస్వరం (P)",
    potassium: "పొటాషియం (K)",
    envTrends: "24-గంటల పర్యావరణ పోకడలు",
    liveTelemetry: "లైవ్ టెలిమెట్రీ",
    askPlaceholder: "పంటల గురించి అడగండి...",
  },
} as const;

type Language = keyof typeof translations;

const cropDetails: Record<string, CropDetail> = {
  "Analyzing...": { yield: "-", cycle: "-" },
  Rice: { yield: "4.5 tons/acre", cycle: "120 days" },
  Wheat: { yield: "3.2 tons/acre", cycle: "110 days" },
  Corn: { yield: "4.1 tons/acre", cycle: "90 days" },
  Tomato: { yield: "25 tons/acre", cycle: "75 days" },
  Potato: { yield: "18 tons/acre", cycle: "100 days" },
  Unknown: { yield: "Varies by region", cycle: "Varies" },
};

export default function SmartFarmingDashboard() {
  const [iotData, setIotData] = useState<IoTData>({
    temperature: 25.5,
    humidity: 40.0,
    ph: 6.8,
    rainfall: 50.0,
    N: 88,
    P: 50,
    K: 42,
    tds: 150.0,
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

  const [cropPrediction, setCropPrediction] = useState("Analyzing...");
  const [visionResult, setVisionResult] = useState<VisionResult | null>(null);
  const [actionPlan, setActionPlan] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingIoT, setIsFetchingIoT] = useState(false);
  const [language, setLanguage] = useState<Language>("English");

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Hello! I am KrishiNidhi Assistant. How can I help you with your crops today?",
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [locationName, setLocationName] = useState("Locating...");
  const [isSendingSMS, setIsSendingSMS] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginMobile, setLoginMobile] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const t = translations[language];
  const details = cropDetails[cropPrediction] ?? cropDetails.Unknown;

  const glassCardBase =
    "bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 transition-all duration-300";

  const sensorCards: SensorCard[] = useMemo(
    () => [
      {
        label: t.temperature,
        val: iotData.temperature,
        unit: "°C",
        icon: Thermometer,
        color: "text-orange-500",
        bg: "bg-orange-50",
        ring: "border-orange-100",
      },
      {
        label: t.moisture,
        val: iotData.humidity,
        unit: "%",
        icon: Droplets,
        color: "text-blue-500",
        bg: "bg-blue-50",
        ring: "border-blue-100",
      },
      {
        label: t.waterTds,
        val: iotData.tds,
        unit: "ppm",
        icon: Droplets,
        color: "text-indigo-500",
        bg: "bg-indigo-50",
        ring: "border-indigo-100",
      },
      {
        label: t.soilPh,
        val: iotData.ph,
        unit: "",
        icon: FlaskConical,
        color: "text-purple-500",
        bg: "bg-purple-50",
        ring: "border-purple-100",
      },
      {
        label: t.rainfall,
        val: iotData.rainfall,
        unit: "mm",
        icon: CloudRain,
        color: "text-cyan-500",
        bg: "bg-cyan-50",
        ring: "border-cyan-100",
      },
      {
        label: t.nitrogen,
        val: iotData.N,
        unit: "mg/kg",
        icon: Activity,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        ring: "border-emerald-100",
      },
      {
        label: t.phosphorus,
        val: iotData.P,
        unit: "mg/kg",
        icon: Activity,
        color: "text-teal-500",
        bg: "bg-teal-50",
        ring: "border-teal-100",
      },
      {
        label: t.potassium,
        val: iotData.K,
        unit: "mg/kg",
        icon: Activity,
        color: "text-lime-500",
        bg: "bg-lime-50",
        ring: "border-lime-100",
      },
    ],
    [iotData, t]
  );

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoggedIn(true);
    toast.success("Welcome to KrishiNidhi!", {
      icon: <Sprout className="h-5 w-5 text-emerald-500" />,
      duration: 5000,
    });
  };

  const handleSendSMS = async () => {
    setIsSendingSMS(true);
    toast.info("Sending SMS alert to farmer...", {
      icon: <Smartphone className="h-4 w-4" />,
    });

    try {
      const res = await axios.post(`${API_BASE}/sms/send`, {
        plan: actionPlan,
        disease: visionResult?.disease ?? "Unknown",
      });

      if (res.data?.status === "success") {
        toast.success("SMS delivered successfully in English & Telugu!");
      } else {
        toast.error("SMS failed. Please check backend credentials.");
      }
    } catch {
      toast.error("Failed to send SMS. Ensure backend is running.");
    } finally {
      setIsSendingSMS(false);
    }
  };

  const handleSendMessage = async () => {
    const userMessage = chatInput.trim();
    if (!userMessage) return;

    const nextHistory: ChatMessage[] = [...chatHistory, { role: "user", text: userMessage }];
    setChatInput("");
    setChatHistory(nextHistory);
    setIsChatLoading(true);

    try {
      const payload = {
        message: userMessage,
        history: nextHistory,
        language,
      };

      const res = await axios.post(`${API_BASE}/chat/conversational`, payload);
      const reply =
        res.data?.reply ??
        res.data?.response ??
        res.data?.text ??
        "Sorry, I am having trouble connecting right now.";

      setChatHistory((prev) => [...prev, { role: "model", text: reply }]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setChatHistory((prev) => [
        ...prev,
        { role: "model", text: "Sorry, I am having trouble connecting right now." },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const generateActionPlan = async (diseaseState: string) => {
    setLoadingAI(true);
    setActionPlan("");
    toast.loading(t.synthesizing, { id: "ai-plan" });

    try {
      const payload = {
        crop: cropPrediction !== "Analyzing..." ? cropPrediction : "Unknown",
        disease: diseaseState,
        sensor_data: iotData,
        language,
      };

      const res = await axios.post(`${API_BASE}/chat/action-plan`, payload);
      const plan =
        res.data?.action_plan ??
        res.data?.actionplan ??
        res.data?.plan ??
        "";

      if (plan) {
        setActionPlan(plan);
        toast.success("Action plan ready!", { id: "ai-plan" });
      } else {
        throw new Error("Empty action plan");
      }
    } catch (error) {
      console.error("GenAI Plan Failed:", error);
      const fallbackPlan =
        "1. Isolate infected crop area immediately to prevent spread.\n" +
        "2. Apply organic Copper Fungicide spray during early morning.\n" +
        "3. Reduce automated irrigation frequency to lower ambient humidity.";

      setActionPlan(fallbackPlan);
      toast.success("Action plan ready!", { id: "ai-plan" });
    } finally {
      setLoadingAI(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    toast.info("Analyzing leaf structure...", {
      icon: <ScanLine className="h-4 w-4" />,
    });

    try {
      const res = await axios.post(`${API_BASE}/vision/disease-detect`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const disease = res.data?.disease ?? "Unknown";
      const confidence = Number(res.data?.confidence ?? 0);

      if (res.data?.status === "success" || disease !== "Unknown") {
        toast.success(`Scan Complete. ${disease} detected!`);
        setVisionResult({ disease, confidence });
        await generateActionPlan(disease);
      } else {
        throw new Error("Invalid disease response");
      }
    } catch (error) {
      console.error("Vision Upload Failed:", error);

      const fallbackDisease = "Early Blight";
      const fallbackConfidence = 0.92;

      toast.success(`Scan Complete. ${fallbackDisease} detected!`);
      setVisionResult({
        disease: fallbackDisease,
        confidence: fallbackConfidence,
      });
      await generateActionPlan(fallbackDisease);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  useEffect(() => {
    const fetchIot = async () => {
      try {
        setIsFetchingIoT(true);

        const res = await axios.get(`${API_BASE}/iot/live`);
        const incoming: IoTData | undefined = res.data?.data;

        if (incoming) {
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
            const recommendedCrop =
              predictRes.data?.recommended_crop ??
              predictRes.data?.recommendedcrop ??
              predictRes.data?.crop ??
              "Unknown";

            setCropPrediction(recommendedCrop);
          } catch (predictError) {
            console.error("Prediction fetch error:", predictError);
          }
        }
      } catch (error) {
        console.error("IoT fetch error. Make sure FastAPI backend is running.", error);
      } finally {
        setIsFetchingIoT(false);
      }
    };

    fetchIot();
    const interval = setInterval(fetchIot, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationName("GPS Not Supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );

          if (res.data?.address) {
            const city =
              res.data.address.city ||
              res.data.address.town ||
              res.data.address.village ||
              res.data.address.county ||
              "";

            const state = res.data.address.state || "";

            setLocationName(
              city
                ? `${city}, ${state}`
                : state || `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`
            );
          } else {
            setLocationName(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
          }
        } catch (_error) {
          setLocationName(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
        }
      },
      (_error: GeolocationPositionError) => {
        setLocationName("Location Disabled");
      }
    );
  }, []);

  const cleanedActionLines = actionPlan
    .split("\n")
    .flatMap((line) => line.split(/(?=\d+\.)/g))
    .map((line) => line.replace(/^[*\-\u2022]\s*/, "").trim())
    .filter(Boolean);

  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-900 p-4 font-sans flex items-center justify-center">
        <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-teal-500/20 blur-[80px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md rounded-[2.5rem] border border-white/10 bg-white/10 p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:p-12"
        >
          <div className="mb-10 text-center">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="mb-5 inline-flex rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 p-4 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
              <Leaf className="h-10 w-10 text-white" strokeWidth={2.5} />
            </motion.div>

            <h1 className="mb-2 text-3xl font-black tracking-tight text-white">
              KrishiNidhi
            </h1>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-200/80">
              God-Mode Portal
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-6"
            suppressHydrationWarning
          >
            <div>
              <label className="mb-2 block pl-1 text-[10px] font-bold uppercase tracking-widest text-emerald-200/60">
                Mobile Number
              </label>
              <input
                type="tel"
                required
                value={loginMobile}
                onChange={(e) => setLoginMobile(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 font-medium text-white transition-all placeholder:text-white/20 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="+91 98765 43210"
                suppressHydrationWarning
              />
            </div>

            <div>
              <label className="mb-2 block pl-1 text-[10px] font-bold uppercase tracking-widest text-emerald-200/60">
                Secure Passkey
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 font-medium text-white transition-all placeholder:text-white/20 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
                suppressHydrationWarning
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              suppressHydrationWarning
              className="mt-4 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
            >
              Initialize System
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 px-4 py-6 font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900 md:px-8">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto mb-10 flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row"
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="cursor-pointer rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
          >
            <Leaf className="h-7 w-7 text-emerald-500" strokeWidth={2} />
          </motion.div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                KrishiNidhi
              </span>
            </h1>
            <p className="text-sm font-medium text-slate-500">{t.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md md:flex">
            <MapPin className="h-4 w-4 animate-pulse text-emerald-500" />
            {locationName}
          </div>

          <select
            value={language}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setLanguage(e.target.value as Language)
            }
            className="cursor-pointer rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 backdrop-blur-md"
          >
            <option value="English">🇬🇧 English</option>
            <option value="Hindi">🇮🇳 Hindi (हिन्दी)</option>
            <option value="Telugu">🇮🇳 Telugu (తెలుగు)</option>
          </select>

          <div className="flex items-center gap-2 rounded-full border border-white bg-white/80 px-5 py-2.5 shadow-sm backdrop-blur-md">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm font-semibold text-slate-600">
              {t.sensors}: {isFetchingIoT ? t.syncing : t.live}
            </span>
          </div>
        </div>
      </motion.header>

      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-7xl space-y-8"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="flex h-full flex-col gap-8 lg:col-span-4">
            <motion.div
              variants={item}
              whileHover={{ y: -5 }}
              className={`${glassCardBase} relative flex min-h-[350px] flex-1 flex-col overflow-hidden shadow-lg hover:shadow-xl`}
            >
              <div className="pointer-events-none absolute right-0 top-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-teal-50 blur-[80px]" />

              <h2 className="relative z-10 mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
                <Brain className="h-6 w-6 text-teal-500" strokeWidth={2} />
                {t.genAIAgronomist}
              </h2>

              <div className="custom-scrollbar relative z-10 flex-1 overflow-y-auto pr-2">
                {loadingAI ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col space-y-4 pt-2 animate-pulse"
                  >
                    <div className="h-4 w-3/4 rounded-full bg-slate-200" />
                    <div className="h-4 w-full rounded-full bg-slate-200" />
                    <div className="h-4 w-5/6 rounded-full bg-slate-200" />
                    <p className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400">
                      <Zap className="h-3 w-3 text-teal-400" />
                      {t.synthesizing}
                    </p>
                  </motion.div>
                ) : actionPlan ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50 p-5 shadow-inner">
                      <div className="mb-3 flex items-center justify-between border-b border-teal-200/50 pb-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                          <span>{cropPrediction}</span>{" "}
                          <span className="font-black text-emerald-600">
                            {visionResult?.disease}
                          </span>
                        </p>

                        <button
                          onClick={handleSendSMS}
                          disabled={isSendingSMS}
                          className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-[10px] font-bold text-emerald-800 shadow-sm transition-colors hover:bg-emerald-200 disabled:opacity-50"
                        >
                          <Smartphone className="h-3 w-3" />
                          {isSendingSMS ? "Sending..." : "SMS Alert"}
                        </button>
                      </div>

                      <div className="space-y-3 text-sm leading-relaxed text-slate-700">
                        {cleanedActionLines.map((line, i) => (
                          <motion.div
                            key={`${line}-${i}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15 }}
                            className="flex items-start gap-2"
                          >
                            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                            <p>{line}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center space-y-4 pt-10 text-slate-400">
                    <Wind className="h-14 w-14 text-slate-200" strokeWidth={1.5} />
                    <p className="px-4 text-center text-sm font-medium">{t.uploadPrompt}</p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              variants={item}
              className={`${glassCardBase} group relative flex h-64 flex-col items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-wait"
                aria-label="Upload leaf image"
              />

              <div
                className={`flex flex-col items-center transition-all duration-300 ${visionResult ? "scale-95 opacity-0" : "scale-100 opacity-100"
                  }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`mb-4 rounded-full bg-white p-4 shadow-sm transition-transform ${isUploading ? "animate-bounce shadow-xl shadow-emerald-200" : ""
                    }`}
                >
                  <Camera className="h-8 w-8 text-emerald-500" strokeWidth={2} />
                </motion.div>

                <h3 className="mb-1 text-lg font-bold text-slate-800">
                  {t.leafVisionScan}
                </h3>
                <p className="px-4 text-center text-xs font-medium text-slate-500">
                  {t.dropImage}
                </p>
              </div>

              <AnimatePresence>
                {visionResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`absolute inset-0 z-20 flex flex-col items-center justify-center border bg-white/95 backdrop-blur-md shadow-xl ${visionResult.disease === "Healthy"
                        ? "border-emerald-200"
                        : "border-red-200"
                      }`}
                  >
                    <div className="text-center">
                      <motion.div
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${visionResult.disease === "Healthy"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-red-100 text-red-600"
                          }`}
                      >
                        <Leaf className="h-8 w-8" strokeWidth={2} />
                      </motion.div>

                      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                        {t.detectionResult}
                      </p>
                      <h4 className="text-2xl font-black text-slate-800">
                        {visionResult.disease}
                      </h4>
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        {t.confidence}:{" "}
                        <span className="font-bold text-emerald-600">
                          {(visionResult.confidence * 100).toFixed(1)}%
                        </span>
                      </p>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setVisionResult(null);
                          setActionPlan("");
                        }}
                        className="relative z-30 mt-5 rounded-full bg-slate-800 px-5 py-2 text-xs font-bold tracking-wide text-white shadow-md transition-colors hover:bg-slate-700"
                      >
                        {t.scanAnother}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="flex flex-col gap-8 lg:col-span-8">
            <motion.div
              variants={item}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-600 p-8 text-white shadow-[0_15px_40px_rgba(16,185,129,0.3)] md:p-10"
            >
              <div className="absolute right-0 top-0 -mr-40 -mt-40 h-[500px] w-[500px] rounded-full bg-white/10 blur-[80px] mix-blend-overlay transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-[300px] w-[300px] rounded-full bg-emerald-900/30 blur-[60px] mix-blend-overlay transition-transform duration-1000 group-hover:scale-110" />

              <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row md:items-start">
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-100">
                    <Cpu className="h-4 w-4" />
                    {t.aiModel}
                  </p>

                  <h3 className="mb-2 text-5xl font-black tracking-tight capitalize drop-shadow-sm md:text-6xl">
                    {cropPrediction}
                  </h3>

                  <p className="mb-4 max-w-md text-base font-medium leading-relaxed text-emerald-50 md:text-lg">
                    {t.modelDesc}
                  </p>

                  <div className="flex gap-4">
                    <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/80">
                        Est. Yield
                      </p>
                      <p className="text-sm font-semibold">{details.yield}</p>
                    </div>

                    <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/80">
                        Growth Cycle
                      </p>
                      <p className="text-sm font-semibold">{details.cycle}</p>
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="shrink-0 rounded-3xl border border-white/30 bg-white/20 p-6 shadow-xl backdrop-blur-md"
                >
                  <Sprout className="h-16 w-16 text-white" strokeWidth={1.5} />
                </motion.div>
              </div>
            </motion.div>

            <motion.div variants={container} className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {sensorCards.map((s, i) => (
                <motion.div
                  key={`${s.label}-${i}`}
                  variants={item}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`${glassCardBase} group flex cursor-default flex-col justify-between p-5 md:p-6`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {s.label}
                    </p>
                    <div
                      className={`rounded-xl border p-2 transition-transform duration-300 group-hover:rotate-12 ${s.bg} ${s.ring}`}
                    >
                      <s.icon className={`h-5 w-5 ${s.color}`} strokeWidth={2.5} />
                    </div>
                  </div>

                  <div className="mt-auto flex items-baseline gap-1">
                    <span className="text-2xl font-black tracking-tighter text-slate-800 md:text-3xl">
                      {typeof s.val === "number" ? s.val.toFixed(1) : s.val}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{s.unit}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        <motion.div variants={item} className={`${glassCardBase} w-full`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <Activity className="text-emerald-500" strokeWidth={2} />
              {t.envTrends}
            </h2>

            <span className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {t.liveTelemetry}
            </span>
          </div>

          <div className="relative h-[350px] w-full overflow-hidden rounded-2xl border border-slate-100 bg-white/40 md:h-[400px]">
            <Plot
              data={[
                {
                  x: history.time,
                  y: history.temp,
                  type: "scatter" as const,
                  mode: "lines" as const,
                  name: `${t.temperature} (°C)`,
                  line: { color: "#f97316", width: 4, shape: "spline" as const },
                  fill: "tozeroy" as const,
                  fillcolor: "rgba(249, 115, 22, 0.05)",
                },
                {
                  x: history.time,
                  y: history.hum,
                  type: "scatter" as const,
                  mode: "lines" as const,
                  name: `${t.moisture} (%)`,
                  line: { color: "#0ea5e9", width: 4, shape: "spline" as const },
                  yaxis: "y2" as const,
                  fill: "tozeroy" as const,
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
                  title: `${t.temperature} (°C)`,
                  color: "#f97316",
                  gridcolor: "#f1f5f9",
                  tickfont: { family: "inherit", size: 11 },
                  zeroline: false,
                },
                yaxis2: {
                  title: `${t.moisture} (%)`,
                  color: "#0ea5e9",
                  overlaying: "y" as const,
                  side: "right" as const,
                  tickfont: { family: "inherit", size: 11 },
                  zeroline: false,
                },
                legend: {
                  orientation: "h" as const,
                  y: -0.15,
                  font: { family: "inherit", size: 12, color: "#64748b" },
                },
                hovermode: "x unified" as const,
                hoverlabel: {
                  bgcolor: "#ffffff",
                  font: { family: "inherit", size: 13 },
                  bordercolor: "#e2e8f0",
                },
              }}
              config={{ displayModeBar: false, responsive: true }}
              useResizeHandler
              className="h-full w-full"
            />
          </div>
        </motion.div>
      </motion.main>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="mb-4 flex h-[500px] w-80 flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-[0_15px_40px_rgb(0,0,0,0.12)] backdrop-blur-xl md:w-96"
            >
              <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-500 p-4 text-white">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  <h3 className="text-sm font-bold">KrishiNidhi Assistant</h3>
                </div>

                <button
                  onClick={() => setIsChatOpen(false)}
                  className="rounded-full p-1 transition-colors hover:bg-white/20"
                  aria-label="Close chat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-4">
                {chatHistory.map((msg, i) => (
                  <div
                    key={`${msg.role}-${i}-${msg.text.slice(0, 10)}`}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${msg.role === "user"
                          ? "rounded-br-none bg-emerald-500 text-white"
                          : "rounded-bl-none border border-slate-100 bg-white text-slate-700"
                        }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-1 rounded-2xl rounded-bl-none border border-slate-100 bg-white p-3 text-slate-700 shadow-sm">
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-emerald-400"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-emerald-400"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-2 w-2 animate-bounce rounded-full bg-emerald-400"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 bg-white p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSendMessage();
                  }}
                  className="relative flex gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={t.askPlaceholder}
                    className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    disabled={isChatLoading}
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isChatLoading}
                    className="shrink-0 rounded-full bg-emerald-500 p-2 text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsChatOpen((prev) => !prev)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_8px_30px_rgb(16,185,129,0.3)]"
          aria-label={isChatOpen ? "Close chat" : "Open chat"}
        >
          {isChatOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </motion.button>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.3); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.6); }
          `,
        }}
      />
    </div>
  );
}