import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, ChevronRight, Loader2, Info } from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const navigate = useNavigate();

  // ✅ robust token read
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

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const fetchNotifications = async () => {
    if (!token) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to fetch notifications", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      setMarking(true);
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchNotifications();
    } catch (err) {
      console.error("❌ Failed to mark notifications as read", err);
    } finally {
      setMarking(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900">
                Notifications
              </h2>
              <span className="text-xs font-extrabold px-2 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                {loading ? "…" : `${notifications.length}`}
              </span>
              {unreadCount > 0 && !loading && (
                <span className="text-xs font-extrabold px-2 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">
              Updates about bookings, payments, and messages.
            </p>
          </div>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={marking || loading}
            className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-800 border border-slate-200 px-3 py-2 text-sm font-extrabold hover:bg-slate-200 transition disabled:opacity-60"
            type="button"
          >
            {marking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Marking…
              </>
            ) : (
              <>
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </>
            )}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-5 pb-5">
        {loading ? (
          <div className="space-y-3">
            <NoteSkeleton />
            <NoteSkeleton />
            <NoteSkeleton />
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
              <Info className="w-6 h-6 text-slate-500" />
            </div>
            <div className="mt-3 font-extrabold text-slate-900">
              No notifications
            </div>
            <div className="text-sm text-slate-500 mt-1">
              You’re all caught up.
            </div>
          </div>
        ) : (
          <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {notifications.map((note, i) => {
              const isUnread = !note.read;

              return (
                <li
                  key={note._id || i}
                  className={`group relative rounded-2xl border p-4 cursor-pointer transition hover:shadow-sm ${
                    isUnread
                      ? "border-teal-200 bg-teal-50/60"
                      : "border-slate-200 bg-white"
                  }`}
                  onClick={async () => {
                    // Optional: if you have an endpoint to mark one as read, call it here.
                    // if (token && isUnread && note._id) {
                    //   await axios.patch(`${import.meta.env.VITE_API_URL}/api/notifications/${note._id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
                    // }
                    if (note.link) navigate(note.link);
                  }}
                >
                  {/* left accent bar */}
                  <div
                    className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${
                      isUnread
                        ? "bg-gradient-to-b from-teal-500 to-cyan-500"
                        : "bg-slate-200"
                    }`}
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 line-clamp-2">
                        {note.message}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {formatDistanceToNow(new Date(note.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 transition" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-70" />
    </div>
  );
};

function NoteSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 w-full">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
    </div>
  );
}

function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} />
  );
}

export default Notifications;
