import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, LogOut, Phone, MessageSquare, Zap, AlertCircle, Users } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { getCopy } from "./i18n";
import { MandiMap } from "./MandiMap";
import { getQueue } from "./api";
import type { Mandi, Token, CrowdStatus, BookingUpdate } from "./types";

type ProcurementPageProps = {
  official: { id: string; name: string; mandiId: string };
  mandi: Mandi;
  onLogout: () => void;
  onLanguageChange: () => void;
};

type IncomingBooking = BookingUpdate & {
  receivedAt: string;
};

export function ProcurementPage({ official, mandi, onLogout, onLanguageChange }: ProcurementPageProps) {
  const { language } = useLanguage();
  const text = getCopy(language);
  const [incomingBookings, setIncomingBookings] = useState<IncomingBooking[]>([]);
  const [queue, setQueue] = useState<Token[]>([]);
  const [crowdLevel, setCrowdLevel] = useState<CrowdStatus>("low");
  const [crowdNotes, setCrowdNotes] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<IncomingBooking | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  // Load queue on component mount
  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  // Setup WebSocket for real-time updates
  useEffect(() => {
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL || "ws://localhost:5000"}/procurement`);

    ws.onopen = () => {
      console.log("Connected to procurement channel");
      ws.send(JSON.stringify({ type: "join", mandiId: mandi.id, officialId: official.id }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "new_booking") {
        const booking: IncomingBooking = {
          ...data.booking,
          receivedAt: new Date().toISOString(),
        };
        setIncomingBookings((prev) => [booking, ...prev]);
        setNotice(`${text.incomingBookings}: ${booking.farmerName}`);
        // Auto-clear notice after 3 seconds
        setTimeout(() => setNotice(""), 3000);
      } else if (data.type === "location_update") {
        setIncomingBookings((prev) =>
          prev.map((b) =>
            b.tokenId === data.tokenId ? { ...b, farmerLocation: data.location } : b
          )
        );
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setNotice(text.networkError);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [mandi.id, official.id]);

  async function loadQueue() {
    try {
      const result = await getQueue(mandi.id);
      setQueue(result.queue as Token[]);
    } catch (error) {
      console.error("Error loading queue:", error);
    }
  }

  async function handleCrowdUpdate() {
    if (!crowdLevel) {
      setNotice(text.error);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/mandis/${mandi.id}/crowd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crowdLevel,
          notes: crowdNotes,
          updatedBy: official.id,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setNotice(text.success);
      setCrowdNotes("");
      setTimeout(() => setNotice(""), 2000);
    } catch (error: any) {
      setNotice(error.message || text.error);
    } finally {
      setLoading(false);
    }
  }

  function handleCallFarmer(phone: string) {
    window.location.href = `tel:+91${phone}`;
  }

  function handleSendSms(phone: string, farmerName: string) {
    const message = `${text.welcome} ${farmerName}! ${text.estimatedArrival} at ${mandi.name}. - KrishiGati`;
    window.location.href = `sms:+91${phone}?body=${encodeURIComponent(message)}`;
  }

  return (
    <div className="procurement-page">
      {/* Header */}
      <motion.header className="page-header" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="header-content">
          <div>
            <h1>{text.procurementDashboard}</h1>
            <p className="welcome-text">
              {mandi.name} • {text.operationsDesk}
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

        <div className="three-column-layout">
          {/* Incoming Bookings */}
          <motion.section className="panel" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <div className="section-heading">
              <h3>{text.incomingBookings}</h3>
              <span className="badge">{incomingBookings.length}</span>
            </div>

            <div className="bookings-list">
              {incomingBookings.length === 0 ? (
                <p className="empty-state">{text.noDataAvailable}</p>
              ) : (
                incomingBookings.map((booking) => (
                  <motion.div
                    key={booking.tokenId}
                    className={`booking-card ${selectedBooking?.tokenId === booking.tokenId ? "selected" : ""}`}
                    onClick={() => setSelectedBooking(booking)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="booking-header">
                      <strong>{booking.tokenNumber}</strong>
                      <small>{booking.cropType}</small>
                    </div>
                    <div className="booking-details">
                      <span>{booking.farmerName}</span>
                      <span>{booking.quantityKg} kg</span>
                    </div>
                    <div className="booking-time">
                      <small>{new Date(booking.receivedAt).toLocaleTimeString()}</small>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>

          {/* Selected Booking Details & Map */}
          <motion.section className="panel" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            {selectedBooking ? (
              <>
                <div className="section-heading">
                  <h3>{text.farmerDetails}</h3>
                </div>

                <div className="booking-info">
                  <div className="info-row">
                    <span>{text.queueNumber}:</span>
                    <strong>{selectedBooking.tokenNumber}</strong>
                  </div>
                  <div className="info-row">
                    <span>{text.crop}:</span>
                    <strong>{selectedBooking.cropType}</strong>
                  </div>
                  <div className="info-row">
                    <span>{text.quantity}:</span>
                    <strong>{selectedBooking.quantityKg} kg</strong>
                  </div>
                  <div className="info-row">
                    <span>{text.farmerDetails}:</span>
                    <div className="farmer-info">
                      <p><strong>{selectedBooking.farmerName}</strong></p>
                      <p>📞 {selectedBooking.farmerPhone}</p>
                    </div>
                  </div>
                  <div className="info-row">
                    <span>{text.status}:</span>
                    <span className={`status-badge status-${selectedBooking.status.toLowerCase()}`}>
                      {selectedBooking.status.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="action-buttons">
                  <button className="btn-success" onClick={() => handleCallFarmer(selectedBooking.farmerPhone)}>
                    <Phone size={16} /> {text.callFarmer}
                  </button>
                  <button className="btn-info" onClick={() => handleSendSms(selectedBooking.farmerPhone, selectedBooking.farmerName)}>
                    <MessageSquare size={16} /> {text.sendSms}
                  </button>
                </div>

                <div className="location-display">
                  <div className="location-header">
                    <MapPin size={16} />
                    <span>{text.currentLocation}</span>
                  </div>
                  <div className="location-coords">
                    {selectedBooking.farmerLocation ? (
                      <>
                        <p>📍 {selectedBooking.farmerLocation.latitude.toFixed(4)}, {selectedBooking.farmerLocation.longitude.toFixed(4)}</p>
                        <small>{new Date(selectedBooking.farmerLocation.timestamp).toLocaleTimeString()}</small>
                      </>
                    ) : (
                      <p>{text.fetchingData}</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <AlertCircle size={32} />
                <p>{text.selectMandiToBook}</p>
              </div>
            )}
          </motion.section>

          {/* Crowd Management */}
          <motion.section className="panel" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="section-heading">
              <h3>{text.updateCrowdDetails}</h3>
            </div>

            <div className="form-group">
              <label>{text.crowdLevel}</label>
              <div className="crowd-buttons">
                {(["low", "medium", "high", "very_high"] as CrowdStatus[]).map((level) => (
                  <button
                    key={level}
                    className={`crowd-btn ${crowdLevel === level ? "active" : ""}`}
                    onClick={() => setCrowdLevel(level)}
                  >
                    <Users size={18} />
                    <span>{text[level as keyof typeof text]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>{text.notes}</label>
              <textarea
                value={crowdNotes}
                onChange={(e) => setCrowdNotes(e.target.value)}
                placeholder={`${text.notes}...`}
                rows={3}
              />
            </div>

            <button className="btn-primary" onClick={handleCrowdUpdate} disabled={loading}>
              {loading ? text.loading : text.submit}
            </button>

            {/* Queue Status */}
            <div className="queue-summary" style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eee" }}>
              <h4>{text.liveQueueBoard}</h4>
              <div className="queue-stats">
                <div className="stat">
                  <span>{text.currentQueue}</span>
                  <strong>{queue.length}</strong>
                </div>
                <div className="stat">
                  <span>{text.estimatedWaitTime}</span>
                  <strong>{queue.length * 15} min</strong>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      <style>{`
        .three-column-layout {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 600px;
          overflow-y: auto;
        }

        .booking-card {
          padding: 12px;
          border: 2px solid #eee;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .booking-card:hover {
          border-color: #4CAF50;
          background: #f5f5f5;
        }

        .booking-card.selected {
          border-color: #4CAF50;
          background: #e8f5e9;
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .booking-header small {
          font-size: 0.75rem;
          color: #666;
          background: #f0f0f0;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .booking-details {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          margin-bottom: 8px;
        }

        .booking-time {
          text-align: right;
          color: #999;
        }

        .crowd-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 15px;
        }

        .crowd-btn {
          padding: 10px;
          border: 2px solid #ddd;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          transition: all 0.2s;
        }

        .crowd-btn:hover {
          border-color: #4CAF50;
        }

        .crowd-btn.active {
          background: #4CAF50;
          color: white;
          border-color: #4CAF50;
        }

        .location-display {
          margin-top: 15px;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 6px;
        }

        .location-header {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .location-coords {
          font-family: monospace;
          font-size: 0.85rem;
        }

        .location-coords p {
          margin: 4px 0;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin: 15px 0;
        }

        .btn-success {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .btn-info {
          background: #2196F3;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .status-booked {
          background: #e3f2fd;
          color: #1976d2;
        }

        .status-gate_entry {
          background: #fff3e0;
          color: #f57c00;
        }

        .status-quality_verified {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .status-weighed {
          background: #e0f2f1;
          color: #00796b;
        }

        .status-payment_dispatched {
          background: #e8f5e9;
          color: #388e3c;
        }

        .queue-summary {
          background: #f9f9f9;
          padding: 12px;
          border-radius: 6px;
        }

        .queue-summary h4 {
          margin: 0 0 10px 0;
          font-size: 0.95rem;
        }

        .queue-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .stat {
          text-align: center;
          padding: 10px;
          background: white;
          border-radius: 4px;
        }

        .stat span {
          display: block;
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 5px;
        }

        .stat strong {
          display: block;
          font-size: 1.5rem;
          color: #4CAF50;
        }
      `}</style>
    </div>
  );
}
