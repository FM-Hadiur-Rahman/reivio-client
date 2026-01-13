// BookingForm.jsx — Premium i18n + Bangla number support + fixes
import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { DateRange } from "react-date-range";
import { addDays } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import { formatBanglaNumber } from "../utils/formatBanglaNumber";
import CalendarModal from "./CalendarModal";
import { useMediaQuery } from "react-responsive";
import { enUS, bn } from "date-fns/locale";
import { useNavigate, useLocation } from "react-router-dom";
import { isWithinInterval } from "date-fns";

import {
  CalendarDays,
  Users,
  Tag,
  ShieldCheck,
  Loader2,
  TicketPercent,
} from "lucide-react";

import "react-toastify/dist/ReactToastify.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const BookingForm = ({
  listingId,
  price,
  maxGuests,
  blockedDates,
  bookingMode = "stay",
  selectedTrip = null,
}) => {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";

  const navigate = useNavigate();
  const location = useLocation();

  const isMobile = useMediaQuery({ maxWidth: 640 });
  const [modalOpen, setModalOpen] = useState(false);

  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 1),
      key: "selection",
    },
  ]);

  const [guests, setGuests] = useState(1);

  const [nights, setNights] = useState(1);
  const [serviceFee, setServiceFee] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  const [bookedRanges, setBookedRanges] = useState([]);

  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);

  // ✅ robust auth read
  const auth = useMemo(() => {
    const direct = localStorage.getItem("token");
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch {}
    const token = direct || user?.token || null;
    return { token, user };
  }, []);

  const formatNum = (num) => (isBn ? formatBanglaNumber(num) : num);

  // ✅ correct interval check for disabled days
  const isDateBooked = (date) =>
    bookedRanges.some((r) =>
      isWithinInterval(date, { start: r.startDate, end: r.endDate })
    );

  // Nights + totals
  useEffect(() => {
    const { startDate, endDate } = range[0];
    const diff = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const validNights = diff > 0 ? diff : 0;

    const subtotal = price * validNights;
    const sFee = Math.round(subtotal * 0.1);
    const txx = Math.round(sFee * 0.15);

    setNights(validNights);
    setServiceFee(sFee);
    setTax(txx);

    // keep your behavior: total excludes tax line (tax shown as note)
    setTotal(subtotal + sFee);
  }, [range, price]);

  // Load booked + blocked ranges
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/bookings/listing/${listingId}`)
      .then((res) => {
        const booked = (res.data || []).map((b) => ({
          startDate: new Date(b.dateFrom),
          endDate: new Date(b.dateTo),
        }));

        const blocked = (blockedDates || []).map((r) => ({
          startDate: new Date(r.from),
          endDate: new Date(r.to),
        }));

        setBookedRanges([...booked, ...blocked]);
      })
      .catch((err) => {
        toast.error(t("error_loading_dates"));
        console.error(err);
      });
  }, [listingId, blockedDates, t]);

  const handleApplyPromo = async () => {
    if (!promoCode?.trim()) {
      setPromoDiscount(0);
      setPromoMessage(t("booking_form.invalid_code"));
      return;
    }
    try {
      setPromoLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/promocode/validate`,
        {
          code: promoCode.trim(),
          type: bookingMode === "combined" ? "both" : "stay",
          totalAmount: total,
        }
      );

      setPromoDiscount(res.data.discount || 0);
      setPromoMessage(
        t("booking_form.discount_applied", {
          discount: formatNum(res.data.discount || 0),
        })
      );
    } catch (err) {
      setPromoDiscount(0);
      setPromoMessage(
        err.response?.data?.message || t("booking_form.invalid_code")
      );
    } finally {
      setPromoLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // ✅ prevent invalid nights
    if (!nights || nights <= 0) {
      toast.error(
        t("booking_form.select_valid_dates") ||
          "Select valid dates (min 1 night)."
      );
      return;
    }

    // 🔐 not logged in → toast + redirect to login
    if (!auth.token || !auth.user) {
      toast.info(t("booking_form.login_required") || "Please log in to book.");
      navigate("/login", {
        state: { from: location.pathname + location.search },
      });
      return;
    }

    // combined trip past check
    if (
      bookingMode === "combined" &&
      selectedTrip &&
      new Date(selectedTrip.date) < new Date()
    ) {
      toast.error("Selected trip is in the past. Please choose a valid trip.");
      return;
    }

    const finalAmount =
      total -
      promoDiscount +
      (bookingMode === "combined" && selectedTrip
        ? selectedTrip.farePerSeat
        : 0);

    try {
      setSubmitting(true);

      // Combined stay + ride
      if (bookingMode === "combined" && selectedTrip) {
        const bookingRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/combined-bookings`,
          {
            listingId,
            dateFrom: range[0].startDate,
            dateTo: range[0].endDate,
            guests,
            combined: true,
            tripId: selectedTrip._id,
            promoCode: promoCode || null,
          },
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );

        const { bookingId, amount } = bookingRes.data;

        const combinedRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/combined-payment/initiate`,
          {
            bookingId,
            amount,
            customer: {
              name: auth.user.name,
              email: auth.user.email,
              address: auth.user.address || "Bangladesh",
              phone: auth.user.phone,
            },
          },
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );

        if (combinedRes.data?.gatewayUrl) {
          toast.success("Redirecting to combined payment...");
          window.location.href = combinedRes.data.gatewayUrl;
        } else {
          toast.error("Combined payment URL not received.");
        }
        return;
      }

      // Stay only
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bookings`,
        {
          listingId,
          dateFrom: range[0].startDate,
          dateTo: range[0].endDate,
          guests,
          promoCode: promoCode || null,
        },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      const booking = res.data;

      const paymentRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/initiate`,
        {
          amount: finalAmount,
          bookingId: booking._id,
          customer: {
            name: auth.user.name,
            email: auth.user.email,
            address: auth.user.address || "Bangladesh",
            phone: auth.user.phone,
          },
        },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      if (paymentRes.data?.url) {
        toast.success("Redirecting to payment gateway...");
        window.location.href = paymentRes.data.url;
      } else {
        toast.error("Payment URL not received.");
      }
    } catch (err) {
      toast.error(
        err?.response?.status === 409
          ? t("booking_form.dates_unavailable") || "These dates are unavailable"
          : t("booking_form.generic_error") ||
              "Something went wrong. Please try again."
      );
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = price * nights;
  const displayStayTotal = total - promoDiscount;
  const displayCombinedTotal =
    displayStayTotal +
    (bookingMode === "combined" && selectedTrip ? selectedTrip.farePerSeat : 0);

  return (
    <>
      <ToastContainer />
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white/95 border border-slate-200/80 shadow-xl ring-1 ring-slate-900/5 p-5 sm:p-6 space-y-5"
      >
        {/* PRICE HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-slate-900">
                ৳{formatNum(price)}
              </span>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {t("booking_form.night_label") || "/ night"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {bookingMode === "combined"
                ? t("booking_form.mode_combined_hint") ||
                  "Includes stay + ride at checkout."
                : t("booking_form.mode_stay_hint") ||
                  "Secure your stay first. Ride is optional."}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-900/70 px-3 py-2 ring-1 ring-slate-700/80">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <div className="text-right leading-tight">
              <p className="text-[0.65rem] text-slate-300">
                {t("booking_form.badge_safe") || "Safe & Verified"}
              </p>
              <p className="text-[0.65rem] text-emerald-300">
                {t("booking_form.badge_secure") || "Secure payment"}
              </p>
            </div>
          </div>
        </div>

        {/* DATE PICKER */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 sm:p-4 space-y-3">
          <p className="text-xs font-medium text-slate-600 mb-1 inline-flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-teal-700" />
            {t("booking_form.choose_dates") || "Choose your dates"}
          </p>

          {isMobile ? (
            <>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="w-full rounded-xl bg-white text-left px-3 py-2.5 text-sm border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <span className="text-slate-700">
                  {range[0].startDate?.toDateString()} →{" "}
                  {range[0].endDate?.toDateString()}
                </span>
                <span className="text-xs text-slate-400">
                  {t("booking_form.tap_change") || "Tap to change"}
                </span>
              </button>

              <CalendarModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                range={range}
                setRange={setRange}
                isDateBooked={isDateBooked}
                isBn={isBn}
              />
            </>
          ) : (
            <div className="w-full sm:max-w-md mx-auto rounded-xl bg-white border border-slate-200 shadow-sm p-2">
              <DateRange
                ranges={range}
                onChange={(item) => setRange([item.selection])}
                minDate={new Date()}
                rangeColors={["#14b8a6"]} // teal
                disabledDay={isDateBooked}
                editableDateInputs={true}
                months={1}
                direction="vertical"
                locale={isBn ? bn : enUS}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-3 text-[11px] sm:text-xs mt-1">
            <div className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-teal-500" />
              <span className="text-slate-600">
                {t("booking_form.selected") || "Selected"}
              </span>
            </div>
            <div className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-slate-600">
                {t("booking_form.unavailable") || "Unavailable"}
              </span>
            </div>
          </div>
        </div>

        {/* GUESTS */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700 inline-flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-700" />
            {t("booking_form.guests")}
          </label>

          <div className="inline-flex items-center justify-between w-full rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5">
            <button
              type="button"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 text-lg text-slate-600 hover:bg-slate-50"
            >
              −
            </button>
            <input
              type="number"
              value={guests}
              min="1"
              max={maxGuests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-16 text-center bg-transparent text-sm text-slate-800 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 text-lg text-slate-600 hover:bg-slate-50"
            >
              +
            </button>
          </div>

          <p className="text-xs text-slate-500">
            {t("booking_form.max_guests_note", { max: formatNum(maxGuests) })}
          </p>
        </div>

        {/* PROMO CODE */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700 inline-flex items-center gap-2">
            <Tag className="w-4 h-4 text-teal-700" />
            {t("booking_form.promo_code")}
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder={t("booking_form.promo_placeholder")}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
            />

            <button
              type="button"
              onClick={handleApplyPromo}
              disabled={promoLoading}
              className="rounded-xl bg-teal-600 text-white px-3 py-2 text-sm font-extrabold shadow-sm hover:bg-teal-700 transition disabled:opacity-60 inline-flex items-center gap-2"
            >
              {promoLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("booking_form.applying") || "Applying"}
                </>
              ) : (
                <>
                  <TicketPercent className="w-4 h-4" />
                  {t("booking_form.apply")}
                </>
              )}
            </button>
          </div>

          {promoMessage && (
            <p
              className={`text-xs mt-1 ${
                promoDiscount > 0 ? "text-emerald-600" : "text-rose-500"
              }`}
            >
              {promoMessage}
            </p>
          )}
        </div>

        {/* PRICE BREAKDOWN */}
        {nights > 0 && (
          <div className="mt-2 rounded-xl bg-slate-50/80 border border-slate-200/80 px-3 py-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">
                {t("booking_form.summary.subtotal", {
                  price: formatNum(price),
                  nights: formatNum(nights),
                })}
              </span>
              <span className="font-medium text-slate-800">
                ৳{formatNum(subtotal)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600">
                {t("booking_form.summary.service_fee")}
              </span>
              <span className="font-medium text-slate-800">
                ৳{formatNum(serviceFee)}
              </span>
            </div>

            <div className="flex justify-between text-xs text-slate-500">
              <span>{t("booking_form.summary.tax_note")}</span>
              <span className="line-through decoration-slate-400 decoration-2">
                ৳{formatNum(tax)}
              </span>
            </div>

            {promoDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>{t("booking_form.summary.promo_discount")}</span>
                <span>- ৳{formatNum(promoDiscount)}</span>
              </div>
            )}

            <div className="border-t border-slate-200 pt-2 mt-1 flex justify-between text-sm sm:text-base font-semibold text-slate-900">
              <span>{t("booking_form.summary.total")}</span>
              <span>৳{formatNum(displayStayTotal)}</span>
            </div>

            {/* COMBINED MODE SUMMARY */}
            {bookingMode === "combined" && selectedTrip && (
              <div className="mt-2 rounded-xl bg-white border border-sky-200 px-3 py-3 space-y-2 text-sm shadow-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    {t("booking_form.ride_fare")}
                  </span>
                  <span className="font-medium text-slate-900">
                    ৳{formatNum(selectedTrip.farePerSeat)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm sm:text-base font-semibold text-slate-900">
                  <span>{t("booking_form.summary.combined_total")}</span>
                  <span>৳{formatNum(displayCombinedTotal)}</span>
                </div>
              </div>
            )}

            {/* RESERVE BUTTON */}
            <button
              type="submit"
              disabled={submitting || nights <= 0}
              className="
                w-full rounded-2xl bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-500
                text-white py-2.5 text-sm font-extrabold shadow-lg
                hover:brightness-105 active:scale-[0.99] transition-all
                disabled:opacity-60 disabled:cursor-not-allowed
                inline-flex items-center justify-center gap-2
              "
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t("booking_form.processing") || "Processing..."}
                </>
              ) : (
                t("booking_form.reserve")
              )}
            </button>
          </div>
        )}
      </form>
    </>
  );
};

export default BookingForm;
