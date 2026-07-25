"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Phone, ArrowRight, Sprout, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Mock authentication
    setTimeout(() => {
      if (mobile === "9999999999" && password === "krishi123") {
        localStorage.setItem("auth_token", "ps10_authenticated");
        router.push("/dashboard");
      } else {
        setError("Invalid credentials. Try 9999999999 / krishi123");
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <main className="section" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="content-card glass" 
        style={{ width: "100%", maxWidth: 440, padding: 40, borderRadius: 32 }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", padding: 16, background: "rgba(0, 209, 102, 0.1)", borderRadius: 20, marginBottom: 16 }}>
            <Sprout size={32} color="#00d166" />
          </div>
          <h1 className="title-lg">KrishiNidhi Login</h1>
          <p className="muted">Enter your registered mobile to access God-Mode</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "grid", gap: 20 }}>
          <div className="input-group">
            <label className="muted" style={{ fontSize: 12, marginBottom: 8, display: "block" }}>MOBILE NUMBER</label>
            <div className="glass" style={{ display: "flex", alignItems: "center", padding: "0 16px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
              <Phone size={18} className="muted" />
              <input 
                type="tel" 
                placeholder="9999999999"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                style={{ background: "transparent", border: "none", color: "white", padding: "16px", outline: "none", width: "100%" }}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="muted" style={{ fontSize: 12, marginBottom: 8, display: "block" }}>PASSWORD</label>
            <div className="glass" style={{ display: "flex", alignItems: "center", padding: "0 16px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
              <Lock size={18} className="muted" />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ background: "transparent", border: "none", color: "white", padding: "16px", outline: "none", width: "100%" }}
                required
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }} 
              className="badge" 
              style={{ background: "rgba(251, 113, 133, 0.1)", color: "#fb7185", borderColor: "rgba(251, 113, 133, 0.1)", textAlign: "center", width: "100%" }}
            >
              {error}
            </motion.div>
          )}

          <button className="cta" type="submit" disabled={loading} style={{ width: "100%", padding: 18, marginTop: 12 }}>
            {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={18} style={{ marginLeft: 8 }} /></>}
          </button>
        </form>

        <p className="muted" style={{ textAlign: "center", marginTop: 24, fontSize: 14 }}>
          Don't have an account? <span style={{ color: "var(--primary)" }}>Contact Admin</span>
        </p>
      </motion.div>
    </main>
  );
}
