import { useEffect, useState } from "react";
import { FarmerLogin } from "./FarmerLogin";
import { FarmerPage } from "./FarmerPage";
import { ProcurementPage } from "./ProcurementPage";
import { LanguageProvider, useLanguage } from "./LanguageContext";
import { getCopy } from "./i18n";
import type { Language } from "./i18n";
import type { Mandi } from "./types";

type FarmerProfile = { id: string; name: string; phone: string; role: "FARMER" | "OFFICIAL"; selectedMandiId?: string };

// Helper function: get all available mandis
async function getAllMandisForOfficials(): Promise<Mandi[]> {
  try {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const response = await fetch(`${API_URL}/api/mandis/all?lat=13.1007&lng=77.5963`);
    const data = await response.json();
    return data.mandis || [];
  } catch (error) {
    console.error("Failed to load mandis:", error);
    return [];
  }
}

function AppContent() {
  const { language, setLanguage } = useLanguage();
  const text = getCopy(language);
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mandis, setMandis] = useState<Mandi[]>([]);

  // Load farmer from localStorage on mount
  useEffect(() => {
    const savedFarmer = localStorage.getItem("krishigati_farmer");
    if (savedFarmer) {
      try {
        const profile = JSON.parse(savedFarmer) as FarmerProfile;
        setFarmer(profile);
        // If official, load mandis
        if (profile.role === "OFFICIAL") {
          getAllMandisForOfficials().then(setMandis).catch(console.error);
        }
      } catch (error) {
        console.error("Failed to parse farmer from localStorage:", error);
        localStorage.removeItem("krishigati_farmer");
      }
    }
    setLoading(false);
  }, []);

  function handleLogin(profile: FarmerProfile) {
    localStorage.setItem("krishigati_farmer", JSON.stringify(profile));
    setFarmer(profile);
    // Load mandis for both roles
    getAllMandisForOfficials().then((mandis) => {
      setMandis(mandis);
      // Log the selected mandi for debugging
      if (profile.selectedMandiId) {
        console.log(`User logged in for mandi: ${profile.selectedMandiId}`);
      }
    }).catch(console.error);
  }

  function handleLogout() {
    localStorage.removeItem("krishigati_farmer");
    setFarmer(null);
    setMandis([]);
    // Reset language to default
    localStorage.removeItem("krishigati_language");
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontSize: "18px" }}>
        {text.loading}
      </div>
    );
  }

  if (!farmer) {
    return <FarmerLogin language={language as Language} onLanguageChange={setLanguage} onRegistered={handleLogin} />;
  }

  if (farmer.role === "FARMER") {
    // Find the selected mandi for the farmer
    const farmerMandi = farmer.selectedMandiId ? mandis.find((m) => m.id === farmer.selectedMandiId) : mandis[0];
    return <FarmerPage farmer={farmer} mandi={farmerMandi} onLogout={handleLogout} onLanguageChange={() => setLanguage(language === "English" ? "हिंदी" : "English")} />;
  }

  // OFFICIAL role - procurement staff
  const assignedMandi = farmer.selectedMandiId ? mandis.find((m) => m.id === farmer.selectedMandiId) : mandis[0];
  if (!assignedMandi) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontSize: "18px", flexDirection: "column", gap: "10px" }}>
        <p>{text.error}</p>
        <p>No mandis available. Please try again later.</p>
      </div>
    );
  }

  return (
    <ProcurementPage
      official={{ id: farmer.id, name: farmer.name, mandiId: assignedMandi.id }}
      mandi={assignedMandi}
      onLogout={handleLogout}
      onLanguageChange={() => setLanguage(language === "English" ? "हिंदी" : "English")}
    />
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
