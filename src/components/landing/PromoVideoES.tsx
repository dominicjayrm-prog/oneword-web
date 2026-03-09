"use client";
import { useState, useEffect } from "react";

const C = {
  bg: "#0A0A12",
  cream: "#FFFDF7",
  text: "#1A1A2E",
  white: "#FFFFFF",
  muted: "#8B8697",
  mutedLight: "rgba(255,255,255,0.35)",
  primary: "#FF6B4A",
  glow: "rgba(255, 107, 74, 0.35)",
  glowSoft: "rgba(255, 107, 74, 0.10)",
  blue: "#4A5BFF",
  blueGlow: "rgba(74, 91, 255, 0.15)",
  gold: "#FFD700",
  border: "#E8E3D9",
  dark1: "#1A1A2E",
  dark2: "#2D1B69",
};

const useT = () => {
  const [ms, setMs] = useState(-1);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return;
    const s = Date.now();
    const id = setInterval(() => setMs(Date.now() - s), 16);
    return () => clearInterval(id);
  }, [on]);
  return { ms, at: (t: number) => ms >= t, bw: (a: number, b: number) => ms >= a && ms < b, p: (a: number, b: number) => Math.min(1, Math.max(0, (ms - a) / (b - a))), on, setOn };
};

const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
const spring = (t: number) => {
  const c = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -12 * t) * Math.sin((t * 12 - 0.75) * c) + 1;
};
const L = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t));

export default function PromoVideoES() {
  const { ms, at, bw, p, on, setOn } = useT();

  const fi = (s: number, d = 500) => L(0, 1, ease(p(s, s + d)));
  const fo = (s: number, d = 500) => L(1, 0, ease(p(s, s + d)));
  const su = (s: number, d = 500, dist = 40) => L(dist, 0, easeOut(p(s, s + d)));

  const DUR = 33000;

  const globalScale = () => {
    if (bw(5800, 9200)) return L(1, 1.8, ease(p(5800, 8500)));
    if (bw(9200, 14200)) return L(1.8, 2.4, ease(p(9200, 11000)));
    if (bw(14200, 14800)) return L(2.4, 1, ease(p(14200, 14800)));
    if (bw(18200, 20500)) return L(1, 1.6, ease(p(18200, 20000)));
    if (bw(20500, 22200)) return L(1.6, 1, ease(p(20500, 22200)));
    if (bw(14800, 18200)) return 1;
    return 1;
  };

  const globalY = () => {
    if (bw(9200, 14200)) return L(0, -60, ease(p(9200, 11000)));
    if (bw(14200, 14800)) return L(-60, 0, ease(p(14200, 14800)));
    if (bw(18200, 20500)) return L(0, -20, ease(p(18200, 20000)));
    if (bw(20500, 22200)) return L(-20, 0, ease(p(20500, 22200)));
    return 0;
  };

  const PhoneContent = () => {
    if (bw(5800, 14700)) {
      const typingWords = ["Funeral", "semanal", "al", "que", "sobrevivimos"];
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, justifyContent: "center", padding: "0 2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "12px", backgroundColor: `${C.primary}10`, opacity: fi(6500) }}>
            <span style={{ fontSize: "9px" }}>🔥</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "8px", fontWeight: 600, color: C.primary }}>racha de 12 días</span>
          </div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "7px", color: C.muted, letterSpacing: "2.5px", textTransform: "uppercase", marginTop: "12px", opacity: fi(6800) }}>la palabra de hoy</span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "40px", fontWeight: 700, color: C.text, margin: "2px 0", letterSpacing: "-1.5px", opacity: fi(7000, 700), transform: `scale(${L(0.9, 1, easeOut(p(7000, 7700)))})` }}>LUNES</h2>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "7px", color: C.muted, opacity: fi(7500) }}>vida · día 2</span>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "7px", color: C.muted, letterSpacing: "2px", textTransform: "uppercase", marginTop: "16px", opacity: fi(8200) }}>descríbela en exactamente 5 palabras</p>
          <div style={{ marginTop: "12px", padding: "10px 8px", borderRadius: "13px", border: `1.5px solid ${at(13500) ? C.primary : C.border}`, width: "100%", backgroundColor: at(13500) ? `${C.primary}06` : "#FFF", display: "flex", flexWrap: "wrap", justifyContent: "center", alignContent: "center", gap: "3px", minHeight: "58px", transition: "border-color 0.4s, background-color 0.4s" }}>
            {typingWords.map((w, i) => {
              const visible = at(10200 + i * 650);
              return (<span key={w} style={{ display: "inline-block", padding: "3px 9px", borderRadius: "11px", backgroundColor: visible ? `${C.primary}12` : "transparent", border: `1.5px solid ${visible ? C.primary : "transparent"}`, color: visible ? C.primary : "transparent", fontFamily: "'DM Sans', sans-serif", fontSize: "10px", fontWeight: 600, margin: "1px", transform: visible ? "scale(1) translateY(0)" : "scale(0.5) translateY(6px)", opacity: visible ? 1 : 0, transition: "all 0.5s cubic-bezier(0.2, 1.5, 0.4, 1)" }}>{w}</span>);
            })}
          </div>
          <div style={{ marginTop: "5px", fontFamily: "'DM Mono', monospace", fontSize: "9px", color: at(13400) ? C.primary : C.muted, fontWeight: 600, transition: "color 0.3s" }}>
            {at(13400) ? "5/5 ✓" : at(12750) ? "4/5" : at(12100) ? "3/5" : at(11450) ? "2/5" : at(10800) ? "1/5" : "0/5"}
          </div>
          <div style={{ marginTop: "8px", padding: "8px 20px", borderRadius: "11px", backgroundColor: at(13400) ? C.text : "#D1CCC0", width: "100%", textAlign: "center", transform: at(13800) ? "scale(1.03)" : "scale(1)", transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", fontWeight: 700, color: "#FFF" }}>{at(13800) ? "✓ REGISTRADO" : "ENVIAR"}</span>
          </div>
        </div>
      );
    }

    if (bw(14200, 18700)) {
      const picked = at(16800);
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, justifyContent: "center", padding: "0 2px" }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, color: C.text, opacity: fi(14800) }}>LUNES</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "7px", color: C.muted, letterSpacing: "2px", textTransform: "uppercase", margin: "3px 0 14px", opacity: fi(15000) }}>¿cuál es mejor?</span>
          <div style={{ padding: "14px 11px", borderRadius: "13px", width: "100%", backgroundColor: picked ? `${C.primary}10` : "#FFF", border: `2px solid ${picked ? C.primary : C.border}`, marginBottom: "8px", position: "relative", transform: `scale(${picked ? 1.03 : 1})`, opacity: fi(15300, 400), transition: "background-color 0.5s, border-color 0.5s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 500, color: C.text, margin: 0, fontStyle: "italic", textAlign: "center" }}>&quot;Funeral semanal al que sobrevivimos&quot;</p>
            {picked && (<div style={{ position: "absolute", top: "-7px", right: "-3px", backgroundColor: C.primary, color: "white", borderRadius: "8px", padding: "2px 7px", fontSize: "7px", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", opacity: fi(16800, 300), transform: `scale(${L(0.5, 1, spring(p(16800, 17200)))})` }}>TU ELECCIÓN ✓</div>)}
          </div>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", color: C.muted, fontWeight: 600 }}>VS</span>
          <div style={{ padding: "14px 11px", borderRadius: "13px", width: "100%", backgroundColor: "#FFF", border: `1.5px solid ${C.border}`, marginTop: "8px", opacity: picked ? 0.25 : fi(15700, 400), transform: `scale(${picked ? 0.96 : 1})`, transition: "opacity 0.5s, transform 0.5s" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 500, color: C.text, margin: 0, fontStyle: "italic", textAlign: "center" }}>&quot;El despertador celebra su venganza&quot;</p>
          </div>
          <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "5px", opacity: fi(15500) }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "8px", color: C.muted }}>voto 7 de 15</span>
            <div style={{ width: "40px", height: "2.5px", borderRadius: "2px", backgroundColor: C.border, overflow: "hidden" }}><div style={{ width: "47%", height: "100%", backgroundColor: C.primary, borderRadius: "2px" }} /></div>
          </div>
        </div>
      );
    }

    if (bw(18200, 22700)) {
      const entries = [
        { e: "🥇", t: "Funeral semanal al que sobrevivimos", u: "@elverbero", v: 847 },
        { e: "🥈", t: "El despertador celebra su venganza", u: "@cincoletras", v: 723 },
        { e: "🥉", t: "Cinco días hasta ser libres", u: "@lunawrites", v: 694 },
      ];
      return (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "0 2px" }}>
          <div style={{ textAlign: "center", marginBottom: "6px" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 700, color: C.text, opacity: fi(18600) }}>LUNES</span>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "7px", color: C.muted, margin: "1px 0 0", opacity: fi(18800) }}>3.847 descripciones</p>
          </div>
          <div style={{ padding: "8px 9px", borderRadius: "11px", backgroundColor: `${C.primary}08`, border: `1.5px solid ${C.primary}`, textAlign: "center", marginBottom: "8px", opacity: fi(19200, 600), transform: `scale(${L(0.85, 1, spring(p(19200, 19800)))})` }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "6px", color: C.muted, textTransform: "uppercase", letterSpacing: "1px" }}>tu puesto</span>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "20px", fontWeight: 700, color: C.primary, margin: "1px 0" }}>#{at(19800) ? "7" : at(19600) ? "31" : "..."}</div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "7px", color: C.muted }}>de 3.847</span>
          </div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "7px", color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px", fontWeight: 600, opacity: fi(20200) }}>Mejores descripciones</span>
          {entries.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 7px", borderRadius: "9px", backgroundColor: i === 0 ? "#FFFBEB" : "#FFF", border: `1px solid ${i === 0 ? "#FFE082" : C.border}`, marginBottom: "3px", opacity: fi(20500 + i * 250, 350), transform: `translateX(${L(-15, 0, easeOut(p(20500 + i * 250, 20850 + i * 250)))}px)` }}>
              <span style={{ fontSize: "12px" }}>{item.e}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "7.5px", fontWeight: 500, color: C.text, margin: 0, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>&quot;{item.t}&quot;</p>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "6px", color: C.muted }}>{item.u}</span>
              </div>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "8px", fontWeight: 600, color: C.primary }}>{item.v}</span>
            </div>
          ))}
          <div style={{ marginTop: "8px", padding: "8px", borderRadius: "11px", backgroundColor: C.primary, textAlign: "center", opacity: fi(21300), transform: `scale(${L(0.9, 1, spring(p(21300, 21700)))})` }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "9px", fontWeight: 700, color: "#FFF" }}>📤 Compartir Resultados</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{ width: "100%", maxWidth: "390px", aspectRatio: "9/19.5", margin: "0 auto", backgroundColor: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", borderRadius: "20px", boxShadow: `0 20px 80px rgba(0,0,0,0.4), 0 0 40px ${C.glowSoft}` }}
      onClick={() => { setOn(false); setTimeout(() => setOn(true), 50); }}
    >
      {/* Ambient glow */}
      <div style={{ position: "absolute", top: `${L(15, 35, ease(p(0, 25000)))}%`, left: `${L(20, 55, ease(p(0, 30000)))}%`, width: "350px", height: "350px", borderRadius: "50%", background: `radial-gradient(circle, ${C.glow} 0%, transparent 70%)`, opacity: 0.2, filter: "blur(80px)", pointerEvents: "none", transform: "translate(-50%, -50%)" }} />

      {/* SCENE 1: TITLE */}
      {bw(0, 3800) && (
        <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 30px", textAlign: "center", opacity: bw(2800, 3800) ? fo(2800, 700) : 1 }}>
          <p style={{ fontFamily: "'DM Sans'", fontSize: "12px", color: C.mutedLight, letterSpacing: "5px", textTransform: "uppercase", opacity: fi(200, 600), transform: `translateY(${su(200, 600, 25)}px)`, margin: "0 0 16px" }}>cada día del año</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "48px", fontWeight: 900, letterSpacing: "-2px", margin: "0", lineHeight: 1.05, opacity: fi(700, 800), transform: `translateY(${su(700, 800, 30)}px)` }}>
            <span style={{ color: C.white }}>El </span>
            <span style={{ color: C.white, textShadow: "0 0 30px rgba(255,255,255,0.25), 0 0 60px rgba(255,255,255,0.1)" }}>mundo</span>
            <span style={{ color: C.white }}> entero.</span>
          </h1>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "40px", fontWeight: 900, letterSpacing: "-2px", margin: "2px 0 0", lineHeight: 1.05, opacity: fi(1400, 700), transform: `translateY(${su(1400, 700, 25)}px)` }}>
            <span style={{ color: C.white }}>Una </span>
            <span style={{ color: C.primary, textShadow: `0 0 30px ${C.glow}` }}>palabra.</span>
          </h2>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 500, fontStyle: "italic", color: C.primary, margin: "16px 0 0", letterSpacing: "0.5px", opacity: fi(2100, 500) }}>Dilo en cinco.</p>
        </div>
      )}

      {/* SCENE 2: WORD REVEAL */}
      {bw(3000, 6300) && (
        <div style={{ position: "absolute", inset: 0, zIndex: bw(3000, 3800) ? 15 : 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: bw(3000, 3800) ? fi(3000, 800) : bw(5500, 6300) ? fo(5500, 600) : 1 }}>
          {["LLUVIA", "AMOR", "MIEDO", "PIZZA", "HOGAR", "WIFI"].map((w, i) => (
            <span key={w} style={{ position: "absolute", top: `${18 + (i * 13) % 60}%`, left: `${12 + (i * 19) % 75}%`, fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 700, color: `rgba(255,255,255,${0.03 + (i % 3) * 0.015})`, opacity: fi(3500 + i * 80, 400), transform: `translateY(${L(8, -8, ease(p(3500, 5800)))}px)` }}>{w}</span>
          ))}
          <span style={{ fontFamily: "'DM Sans'", fontSize: "11px", color: C.mutedLight, letterSpacing: "4px", textTransform: "uppercase", opacity: fi(3600, 400) }}>la palabra de hoy es</span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: `${L(24, 72, ease(p(3900, 4800)))}px`, fontWeight: 900, color: C.white, letterSpacing: "-3px", margin: "6px 0 0", lineHeight: 1, textShadow: `0 0 40px ${C.glow}, 0 0 80px ${C.glowSoft}`, opacity: fi(3900, 600) }}>LUNES</h1>
          <p style={{ fontFamily: "'DM Sans'", fontSize: "12px", color: C.primary, fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", margin: "10px 0 0", opacity: fi(5000, 400) }}>vida</p>
        </div>
      )}

      {/* SCENES 3-6: PHONE WITH ZOOM */}
      {bw(5500, 22700) && (
        <div style={{ position: "absolute", inset: 0, zIndex: bw(5500, 6300) ? 15 : 20, display: "flex", alignItems: "center", justifyContent: "center", opacity: bw(5500, 6300) ? fi(5500, 800) : bw(22000, 22700) ? fo(22000, 600) : 1 }}>
          <div style={{ transform: `scale(${globalScale()}) translateY(${globalY()}px)`, transition: "none" }}>
            <div style={{ width: "220px", height: "440px", borderRadius: "30px", backgroundColor: C.cream, border: "3px solid #2a2a3a", overflow: "hidden", position: "relative", boxShadow: `0 20px 80px rgba(0,0,0,0.5), 0 0 ${at(13800) ? "60" : "30"}px ${C.glow}`, transition: "box-shadow 0.6s ease" }}>
              <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "75px", height: "20px", backgroundColor: "#2a2a3a", borderRadius: "0 0 12px 12px", zIndex: 10 }} />
              <div style={{ padding: "28px 14px 14px", height: "100%", display: "flex", flexDirection: "column" }}>
                <PhoneContent />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCENE 7: SHARE CARD */}
      {bw(22000, 26500) && (
        <div style={{ position: "absolute", inset: 0, zIndex: bw(22000, 22700) ? 15 : 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", opacity: bw(22000, 22700) ? fi(22000, 700) : bw(25500, 26500) ? fo(25500, 700) : 1 }}>
          <p style={{ fontFamily: "'DM Sans'", fontSize: "11px", color: C.mutedLight, letterSpacing: "3px", textTransform: "uppercase", margin: "0 0 14px", opacity: fi(22500, 400) }}>comparte tu resultado</p>
          <div style={{ width: "100%", maxWidth: "300px", padding: "24px 20px", borderRadius: "22px", background: `linear-gradient(145deg, ${C.dark1} 0%, ${C.dark2} 100%)`, textAlign: "center", boxShadow: `0 25px 80px rgba(0,0,0,0.6), 0 0 60px ${C.glow}`, opacity: fi(22800, 600), transform: `translateY(${su(22800, 700, 30)}px) scale(${L(0.92, 1, easeOut(p(22800, 23500)))})` }}>
            <div style={{ marginBottom: "4px" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>one</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "12px", color: C.primary }}>word</span>
            </div>
            <span style={{ fontFamily: "'DM Sans'", fontSize: "7px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "2px" }}>la palabra de hoy</span>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: 700, color: "#FFF", margin: "2px 0 12px", letterSpacing: "-1.5px" }}>LUNES</h3>
            <div style={{ padding: "10px 12px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "14px" }}>
              <p style={{ fontFamily: "'DM Sans'", fontSize: "14px", fontWeight: 500, color: "#FFF", margin: 0, fontStyle: "italic" }}>&quot;Funeral semanal al que sobrevivimos&quot;</p>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
              {[{ icon: "📊", value: "#7", label: "PUESTO" }, { icon: "❤️", value: "694", label: "VOTOS" }, { icon: "🔥", value: "12", label: "RACHA" }].map((s, i) => (
                <div key={i} style={{ textAlign: "center", opacity: fi(24000 + i * 200, 300) }}>
                  <span style={{ fontSize: "14px" }}>{s.icon}</span>
                  <div style={{ fontFamily: "'DM Mono'", fontSize: "16px", fontWeight: 700, color: "#FFF" }}>{s.value}</div>
                  <div style={{ fontFamily: "'DM Sans'", fontSize: "6px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", fontStyle: "italic", color: C.primary, opacity: 0.7, marginTop: "16px" }}>¿Cómo lo describirías tú?</p>
        </div>
      )}

      {/* SCENE 8: FINAL CTA */}
      {at(26000) && (
        <div style={{ position: "absolute", inset: 0, zIndex: 25, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 30px", opacity: fi(26000, 800) }}>
          <div style={{ opacity: fi(26500, 700), transform: `scale(${L(0.8, 1, spring(p(26500, 27200)))})`, marginBottom: "10px" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "50px", fontWeight: 900, color: C.white }}>one</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "50px", fontWeight: 900, color: C.primary, textShadow: `0 0 30px ${C.glow}` }}>word</span>
          </div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontStyle: "italic", color: C.primary, margin: "0 0 6px", textAlign: "center", letterSpacing: "0.5px", opacity: fi(27500, 500) }}>Dilo en cinco.</p>
          <p style={{ fontFamily: "'DM Sans'", fontSize: "13px", color: "rgba(255,255,255,0.3)", margin: "0 0 4px", textAlign: "center", opacity: fi(27800, 500) }}>El juego diario para mentes creativas.</p>
          <p style={{ fontFamily: "'DM Sans'", fontSize: "11px", color: "rgba(255,255,255,0.2)", margin: "0 0 28px", opacity: fi(28000, 500) }}>iOS · Android · Web</p>
          <div style={{ padding: "16px 44px", borderRadius: "16px", backgroundColor: C.primary, boxShadow: `0 8px 40px ${C.glow}`, opacity: fi(28500, 600), transform: `scale(${L(0.85, 1, spring(p(28500, 29200)))})` }}>
            <span style={{ fontFamily: "'DM Sans'", fontSize: "18px", fontWeight: 700, color: "#FFF" }}>Juega Ya — Gratis</span>
          </div>
          <p style={{ fontFamily: "'DM Mono'", fontSize: "10px", color: "rgba(255,255,255,0.15)", marginTop: "14px", opacity: fi(29500, 500) }}>Únete a miles de jugadores diarios</p>
          {at(30000) && (<div style={{ position: "absolute", top: "55%", left: "50%", width: "200px", height: "200px", borderRadius: "50%", background: `radial-gradient(circle, ${C.glow} 0%, transparent 70%)`, transform: "translate(-50%, -50%)", filter: "blur(40px)", animation: "breathe 3s ease-in-out infinite", pointerEvents: "none", zIndex: -1 }} />)}
          <style>{`@keyframes breathe { 0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.35; transform: translate(-50%, -50%) scale(1.15); } }`}</style>
        </div>
      )}

      {/* Play overlay */}
      {!on && (
        <div style={{ position: "absolute", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)", borderRadius: "20px" }}>
          <div style={{ width: "70px", height: "70px", borderRadius: "50%", backgroundColor: C.primary, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 50px ${C.glow}`, cursor: "pointer", marginBottom: "12px" }}>
            <span style={{ fontSize: "28px", marginLeft: "4px", color: "#FFF" }}>▶</span>
          </div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: C.white, margin: "0 0 2px" }}>one<span style={{ color: C.primary }}>word</span></p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: C.primary, fontSize: "12px", margin: "0 0 6px", opacity: 0.8 }}>Dilo en cinco.</p>
          <p style={{ fontFamily: "'DM Sans'", color: "rgba(255,255,255,0.35)", fontSize: "11px" }}>Toca para ver · 33s</p>
        </div>
      )}

      {/* Progress bar */}
      {on && (
        <div style={{ position: "absolute", bottom: "10px", left: "10%", right: "10%", height: "2px", borderRadius: "1px", backgroundColor: "rgba(255,255,255,0.06)", zIndex: 50 }}>
          <div style={{ height: "100%", borderRadius: "1px", backgroundColor: C.primary, width: `${Math.min(100, (ms / DUR) * 100)}%`, boxShadow: `0 0 6px ${C.glow}` }} />
        </div>
      )}
    </div>
  );
}
