import React, { useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";

const HostBookingActions = ({ bookingId, refresh }) => {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState(null); // "accept" | "cancel"
  const [loading, setLoading] = useState(false);

  // ✅ robust token read (supports both "token" and stored user JSON)
  const token = useMemo(() => {
    const direct = localStorage.getItem("token");
    if (direct) return direct;

    try {
      const u = JSON.parse(localStorage.getItem("user"));
      return u?.token || null;
    } catch {
      return null;
    }
  }, []);

  const begin = (nextAction) => {
    setAction(nextAction);
    setOpen(true);
  };

  const close = () => {
    if (loading) return;
    setOpen(false);
    setAction(null);
  };

  const confirmAction = async () => {
    if (!token) {
      toast.error("Missing token. Please login again.");
      return;
    }
    if (!bookingId || !action) return;

    const url = `${
      import.meta.env.VITE_API_URL
    }/api/bookings/${bookingId}/${action}`;

    try {
      setLoading(true);
      await axios.put(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        action === "accept" ? "✅ Booking accepted!" : "✅ Booking cancelled!"
      );
      close();
      refresh?.();
    } catch (err) {
      console.error(`❌ Failed to ${action} booking:`, err);
      toast.error(err?.response?.data?.message || `Booking ${action} failed.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-2">
        <button
          onClick={() => begin("accept")}
          disabled={loading}
          className="btn-teal"
          type="button"
        >
          {loading && action === "accept" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          Accept
        </button>

        <button
          onClick={() => begin("cancel")}
          disabled={loading}
          className="btn-danger"
          type="button"
        >
          {loading && action === "cancel" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          Cancel
        </button>
      </div>

      {/* Confirm Modal */}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={close}
          />

          {/* Panel */}
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                    action === "cancel"
                      ? "bg-rose-50 border-rose-100"
                      : "bg-teal-50 border-teal-100"
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      action === "cancel" ? "text-rose-700" : "text-teal-700"
                    }`}
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {action === "accept"
                      ? "Accept booking?"
                      : "Cancel booking?"}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {action === "accept"
                      ? "The guest will be notified and the booking will be confirmed."
                      : "This will cancel the booking. The guest will be notified."}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={close}
                  disabled={loading}
                  className="btn-slate"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={confirmAction}
                  disabled={loading}
                  className={
                    action === "cancel" ? "btn-danger-solid" : "btn-teal"
                  }
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Please wait
                    </>
                  ) : action === "accept" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Accept
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </>
                  )}
                </button>
              </div>
            </div>

            <div
              className={`h-1 ${
                action === "cancel"
                  ? "bg-gradient-to-r from-rose-500 to-orange-500"
                  : "bg-gradient-to-r from-teal-500 to-cyan-500"
              }`}
            />
          </div>

          {/* Button styles */}
          <style>{`
            .btn-teal{
              display:inline-flex; gap:.45rem; align-items:center; justify-content:center;
              padding:0.5rem 0.9rem; border-radius:9999px;
              background: rgb(13 148 136); color:white;
              font-weight:900; font-size:0.875rem;
              transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
              box-shadow: 0 1px 2px rgba(0,0,0,.06);
            }
            .btn-teal:hover{ background: rgb(15 118 110); box-shadow: 0 8px 24px rgba(13,148,136,.18); transform: translateY(-1px); }
            .btn-teal:disabled{ opacity:.6; cursor:not-allowed; transform:none; box-shadow:none; }

            .btn-slate{
              display:inline-flex; gap:.45rem; align-items:center; justify-content:center;
              padding:0.5rem 0.9rem; border-radius:9999px;
              background: rgb(241 245 249); color: rgb(15 23 42);
              font-weight:900; font-size:0.875rem;
              border:1px solid rgb(226 232 240);
              transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
            }
            .btn-slate:hover{ background: rgb(226 232 240); box-shadow: 0 8px 24px rgba(2,6,23,.08); transform: translateY(-1px); }
            .btn-slate:disabled{ opacity:.6; cursor:not-allowed; transform:none; box-shadow:none; }

            .btn-danger{
              display:inline-flex; gap:.45rem; align-items:center; justify-content:center;
              padding:0.5rem 0.9rem; border-radius:9999px;
              background: rgb(254 242 242); color: rgb(185 28 28);
              font-weight:900; font-size:0.875rem;
              border:1px solid rgb(254 202 202);
              transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
            }
            .btn-danger:hover{ background: rgb(254 226 226); box-shadow: 0 8px 24px rgba(185,28,28,.12); transform: translateY(-1px); }
            .btn-danger:disabled{ opacity:.6; cursor:not-allowed; transform:none; box-shadow:none; }

            .btn-danger-solid{
              display:inline-flex; gap:.45rem; align-items:center; justify-content:center;
              padding:0.5rem 0.9rem; border-radius:9999px;
              background: rgb(220 38 38); color: white;
              font-weight:900; font-size:0.875rem;
              transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
              box-shadow: 0 1px 2px rgba(0,0,0,.06);
            }
            .btn-danger-solid:hover{ background: rgb(185 28 28); box-shadow: 0 8px 24px rgba(185,28,28,.18); transform: translateY(-1px); }
            .btn-danger-solid:disabled{ opacity:.6; cursor:not-allowed; transform:none; box-shadow:none; }
          `}</style>
        </div>
      )}
    </>
  );
};

export default HostBookingActions;
