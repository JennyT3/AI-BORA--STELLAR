import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { CTAFooterSection } from "../components/CTAFooterSection";
import { FloatingWhatsApp } from "../components/FloatingWhatsApp";
import { Footer } from "../components/Footer";
import { SimuladorServicios } from "../components/SimuladorServicios";

const fotos = [
  { src: "/antes.webp", label: "Before" },
  { src: "/depois.webp", label: "After" },
  { src: "/estudio.webp", label: "Studio" },
  { src: "/foto-criativa.webp", label: "Creative" },
  { src: "/mopack.webp", label: "Packaging" },
  { src: "/branding.webp", label: "Branding" },
];

export function Servicos() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main>

        <section style={{ backgroundColor: "#1A1A1A", padding: "120px 16px 80px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(28px, 5vw, 48px)", color: "#ffffff", lineHeight: 1.1, margin: "0 0 16px" }}>
              Our services
            </h1>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 16, color: "#aaaaaa", margin: 0, lineHeight: 1.5 }}>
              Select the services you need and request your quote with no obligation
            </p>
          </div>
        </section>

        <SimuladorServicios />

        <section style={{ backgroundColor: "#F5F2F0", padding: "64px 16px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ width: 36, height: 3, backgroundColor: "#F25C05", margin: "0 auto 16px", borderRadius: 2 }} />
              <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(22px, 4vw, 32px)", color: "#1A1A1A", margin: "0 0 12px" }}>
                Real results. Always.
              </h2>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#4A4A4A", margin: 0 }}>
                Real work with real clients. Every project with measurable impact.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {fotos.map((foto) => (
                <div key={foto.src} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "1", backgroundColor: "#e0ddd9" }}>
                  <img src={foto.src} alt={foto.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px", background: "linear-gradient(transparent, rgba(0,0,0,0.55))" }}>
                    <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 12, color: "#ffffff" }}>{foto.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CTAFooterSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
