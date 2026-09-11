import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, LogOut, Check, Truck, AlertCircle, Zap } from "lucide-react";
import { bookToken, getNearestMandis, getAllMandis, getStats, getCropPrices, getProcurementDetails, type CropPrice } from "./api";
import { useLanguage } from "./LanguageContext";
import { getCopy } from "./i18n";
import { MandiMap } from "./MandiMap";
import { NearestMandiList } from "./NearestMandiList";
import { SmartRecommendation } from "./SmartRecommendation";
import { ProcurementReceipt } from "./ProcurementReceipt";
import type { Mandi, Stats, Token } from "./types";

const fallbackPosition: [number, number] = [13.1007, 77.5963];
const steps = ["Slot booked", "Gate entry", "Quality grade", "IoT weighing", "Payment dispatched"];

type FarmerPageProps = {
  farmer: { id: string; name: string; phone: string };
  mandi?: Mandi;
  onLogout: () => void;
  onLanguageChange: () => void;
};

export function FarmerPage({ farmer, mandi, onLogout, onLanguageChange }: FarmerPageProps) {
  const { language } = useLanguage();
  const text = getCopy(language);
  const [mandis, setMandis] = useState<Mandi[]>([]);
  const [allMandis, setAllMandis] = useState<Mandi[]>([]);
  const [stats, setStats] = useState<Stats>({ grainsProcuredKg: 0, averageWaitMinutes: 25, activeMandis: 0 });
  const [position, setPosition] = useState<[number, number]>(fallbackPosition);
  const [selectedMandi, setSelectedMandi] = useState<Mandi>();
  const [token, setToken] = useState<Token>();
  const [notice, setNotice] = useState("");
  const [cropPrices, setCropPrices] = useState<Record<string, CropPrice>>({});
  const [bookingCrop, setBookingCrop] = useState("Wheat");
  const [bookingQuantity, setBookingQuantity] = useState(500);
  const [loading, setLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "pending">("pending");

  // Request location permission
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setPosition([coords.latitude, coords.longitude]);
          setLocationPermission("granted");
          localStorage.setItem("krishigati_last_position", JSON.stringify([coords.latitude, coords.longitude]));
        },
        () => {
          setLocationPermission("denied");
          const saved = localStorage.getItem("krishigati_last_position");
          if (saved) setPosition(JSON.parse(saved));
        }
      );
    }
  }, []);

  // Load data
  useEffect(() => {
    if (!farmer) return;
    setLoading(true);
    Promise.all([getNearestMandis(position[0], position[1]), getAllMandis(position[0], position[1]), getStats(), getCropPrices()])
      .then(([mandiData, allMandiData, statsData, priceData]) => {
        setMandis(mandiData.mandis);
        setAllMandis(allMandiData.mandis);
        setStats(statsData.stats);
        setCropPrices(priceData.crops);
      })
      .catch((error: Error) => setNotice(error.message))
      .finally(() => setLoading(false));
  }, [position, farmer]);

  // Set selectedMandi when mandi prop is provided
  useEffect(() => {
    if (mandi) {
      setSelectedMandi(mandi);
    }
  }, [mandi]);

  const primaryMandi = useMemo(() => mandis[0], [mandis]);
  const activeStep = token ? Math.max(0, ["BOOKED", "GATE_ENTRY", "QUALITY_VERIFIED", "WEIGHED", "PAYMENT_DISPATCHED"].indexOf(token.status)) : 0;
  const cropGroups = ["Grains", "Pulses", "Oilseeds", "Vegetables", "Fruits"];
  const groupedCrops = cropGroups.map((category) => ({ category, crops: Object.entries(cropPrices).filter(([, rate]) => rate.category === category) }));

  async function handleBooking(mandi: Mandi) {
    setSelectedMandi(mandi);
    setBookingCrop(Object.keys(cropPrices)[0] || "Wheat");
    setBookingQuantity(500);
    setNotice("");
  }

  async function confirmBooking() {
    if (!selectedMandi || !bookingCrop || !bookingQuantity) {
      setNotice(text.error);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        farmerId: farmer.id,
        farmerName: farmer.name,
        farmerPhone: farmer.phone,
        mandiId: selectedMandi.id,
        cropType: bookingCrop,
        quantityKg: bookingQuantity,
        farmerLocation: {
          latitude: position[0],
          longitude: position[1],
          timestamp: new Date().toISOString(),
        },
      };

      const response = await bookToken(payload);
      setToken(response.token as Token);
      setNotice(text.bookedSuccessfully);
      setSelectedMandi(undefined);
    } catch (error: any) {
      setNotice(error.message || text.bookingFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="farmer-page">
      {/* Header */}
      <motion.header className="page-header" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="header-content">
          <div>
            <h1>{text.farmerDashboard}</h1>
            <p className="welcome-text">
              {text.welcome}, <strong>{farmer.name}</strong>
            </p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={onLanguageChange}>
              🌐 {language}
            </button>
            <button className="btn-secondary" onClick={onLogout}>
              {text.logout}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="page-content">
        {notice && (
          <motion.div className={`alert ${notice.includes("successfully") ? "alert-success" : "alert-error"}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AlertCircle size={18} />
            <span>{notice}</span>
          </motion.div>
        )}

        {locationPermission === "denied" && (
          <div className="alert alert-warning">
            <MapPin size={18} />
            <span>{text.error}: {text.updateLocation}</span>
          </div>
        )}

        {/* Token Dashboard */}
        <motion.section className="panel token-panel" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">{text.farmerDashboard}</p>
              <h2>{token ? text.yourActiveProcurement : text.yourNextProcurement}</h2>
            </div>
            <span className="token-state">{token ? token.status.replaceAll("_", " ") : text.ready}</span>
          </div>

          {token ? (
            <>
              <div className="token-number">
                <small>{text.digitalToken}</small>
                <strong>{token.tokenNumber}</strong>
                <span>
                  {token.cropType} · {token.quantityKg} kg
                </span>
              </div>
              <div className="progress-track">
                {steps.map((step, index) => (
                  <div className={`progress-step ${index <= activeStep ? "done" : ""}`} key={step}>
                    <span>{index < activeStep ? <Check size={12} /> : index + 1}</span>
                    <small>{step}</small>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-token">
              <div className="empty-icon">
                <Check size={20} />
              </div>
              <p>{text.chooseMandiBelow}</p>
            </div>
          )}
        </motion.section>

        {/* Procurement Receipt */}
        {token && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <ProcurementReceipt token={token} />
          </motion.div>
        )}

        {/* Map and Recommendations */}
        <div className="two-column">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <MandiMap mandis={allMandis} selectedMandi={selectedMandi} position={position} farmerLocation={position} />
          </motion.div>

          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <SmartRecommendation position={position} quantity={bookingQuantity} />

            {primaryMandi && (
              <motion.section className="panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <div className="section-heading">
                  <h3>{text.selectMandiToBook}</h3>
                </div>

                {selectedMandi && (
                  <div className="booking-form">
                    <div className="form-group">
                      <label>{text.bookingCrop}</label>
                      <select value={bookingCrop} onChange={(e) => setBookingCrop(e.target.value)}>
                        {groupedCrops.map((group) =>
                          group.crops.length > 0 ? (
                            <optgroup key={group.category} label={group.category}>
                              {group.crops.map(([name]) => (
                                <option key={name} value={name}>
                                  {name}
                                </option>
                              ))}
                            </optgroup>
                          ) : null
                        )}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>{text.bookingQuantity}</label>
                      <input type="number" min="1" value={bookingQuantity} onChange={(e) => setBookingQuantity(Number(e.target.value))} />
                    </div>

                    <div className="form-actions">
                      <button className="btn-primary" onClick={confirmBooking} disabled={loading}>
                        {loading ? text.loading : text.bookSlot}
                      </button>
                      <button className="btn-secondary" onClick={() => setSelectedMandi(undefined)}>
                        {text.cancel}
                      </button>
                    </div>
                  </div>
                )}

                <NearestMandiList mandis={mandis} selectedMandi={selectedMandi} onSelectMandi={selectedMandi ? undefined : handleBooking} />
              </motion.section>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
