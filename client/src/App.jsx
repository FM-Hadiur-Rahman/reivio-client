import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";

//useAuth Context
import { useAuth } from "./context/AuthContext";

import MaintenanceBanner from "./components/MaintenanceBanner";
import MaintenancePage from "./pages/MaintenancePage";
// Layouts
import MainLayout from "./layouts/MainLayout";

import ProtectedRouteWrapper from "./components/ProtectedRouteWrapper";

// General Pages
import Home from "./pages/Home";
import ListingsPage from "./pages/ListingsPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterStep1 from "./pages/RegisterStep1";
import RegisterStep2 from "./pages/RegisterStep2";
import VerifyEmail from "./pages/VerifyEmail";
import ResendVerificationPage from "./pages/ResendVerificationPage";
import VerifyNotice from "./pages/VerifyNotice";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import HelpCenterPage from "./pages/HelpCenterPage";
import ContactUsPage from "./pages/ContactUsPage";
import MyWishlistPage from "./pages/MyWishlistPage";
import VerifyPhonePage from "./pages/VerifyPhone";
import FullPageSpinner from "./components/FullPageSpinner";

// User Dashboard
import DashboardPage from "./pages/DashboardPage";
import Forbidden from "./pages/Forbidden";
import DashboardBookings from "./pages/DashboardBookings";
import EditProfilePage from "./pages/EditProfilePage";
import MyAccountPage from "./pages/MyAccoountPage";
import GuestChatsRoute from "./routes/GuestChatsRoute";
import HostChatsRoute from "./routes/HostChatsRoute";
import Notifications from "./components/Notifications";

// Payment Pages
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentFailPage from "./pages/PaymentFailPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";

// Host Pages
import HostDashboard from "./components/HostDashboard";
import CreateListingPage from "./pages/CreateListingPage";
import EditListingPage from "./pages/EditListingPage";
import HostListingBookingsPage from "./pages/HostListingBookingPage";
import HostBlockedDates from "./components/HostBlockDates";

//Driver Pages
import DriverTripForm from "./pages/DriverTripForm";
import TripSearchPage from "./pages/TripSearchPage";
import DriverDashboard from "./components/DriverDashboard";

// Booking Pages
import MyBookingsPage from "./pages/MyBookingsPage";

// Admin Pages
import AdminDashboard from "./components/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminListings from "./pages/AdminListings";
import AdminBookings from "./pages/AdminBookings";
import AdminKYC from "./pages/AdminKYC";
import AdminUserBreakdown from "./pages/AdminUserBreakdown";
import AdminFlagged from "./pages/AdminFlagged";
import AdminRevenue from "./pages/AdminRevenue";
import AdminPayouts from "./pages/AdminPayouts";
import AdminRefundsPage from "./pages/AdminRefundsPage";
import ReviewPage from "./pages/ReviewPage";
import AdminOverduePayouts from "./pages/AdminOverduePayouts";
import AdminPromocodes from "./pages/AdminPromocodes";
import AdminBanners from "./pages/AdminBanners";
import AdminLogs from "./pages/adminLogs";
import AdminReferrals from "./pages/AdminReferrals";
import AdminSettings from "./pages/AdminSettings";
import AdminUserDetail from "./pages/AdminUserDetail";
import AdminSearch from "./pages/AdminSearch";
import AdminListingDetails from "./pages/AdminListingDetails";
import AdminTripDetails from "./pages/AdminTripDetails";

import TripDetailPage from "./pages/TripDetailPage";
import TripPaymentSuccess from "./pages/TripPaymentSuccess";
import TermsPage from "./components/TermsPage";
import PrivacyPolicy from "./components/PrivacyPolicy";
import RefundPolicy from "./components/RefundPolicy";
import EmergencyInfoPage from "./pages/EmergencyInfoPage";
import MyReferralsPage from "./pages/MyReferralPage";
import AdminBookingDetail from "./pages/AdminBookingDetails";
import EditTripForm from "./pages/EditTripForm";
import RideResultsPage from "./pages/RideResultsPage";
import AuthDebug from "./pages/AuthDebug";
import PaymentDetailsForm from "./components/PaymentDetailsForm";
import AdminPaymentAccounts from "./pages/AdminPaymentAccounts";
import BecomeDriverPage from "./pages/BecomeDriverPage";

function App() {
  const [maintenance, setMaintenance] = useState(false);
  // const [loading, setLoading] = useState(true);
  // const [user, setUser] = useState(null);
  const { user, loading } = useAuth(); // ✅ use context

  useEffect(() => {
    // const storedUser = localStorage.getItem("user");
    // if (storedUser) setUser(JSON.parse(storedUser));

    fetch(`${import.meta.env.VITE_API_URL}/api/config`)
      .then((res) => res.json())
      .then((data) => setMaintenance(data.maintenanceMode));
  }, []);

  const isAdmin = user?.primaryRole === "admin";

  // Wait until loading done
  if (loading) return <FullPageSpinner message="Waking up the server..." />;

  // If maintenance ON and not admin, show full maintenance page
  if (maintenance && !isAdmin) return <MaintenancePage />;
  return (
    <Router>
      <MaintenanceBanner />
      <Routes>
        {/* Main Layout Wrapper */}
        <Route path="/" element={<MainLayout />}>
          {/* Public Routes */}
          <Route index element={<Home />} />
          <Route path="listings" element={<ListingsPage />} />
          <Route path="listings/:id" element={<ListingDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterStep1 />} />
          <Route path="register/step2" element={<RegisterStep2 />} />
          <Route
            path="/signup"
            element={
              <Navigate to={`/register${window.location.search}`} replace />
            }
          />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="/verify-phone" element={<VerifyPhonePage />} />
          <Route path="/emergency" element={<EmergencyInfoPage />} />
          <Route
            path="/resend-verification"
            element={<ResendVerificationPage />}
          />
          <Route path="verify" element={<VerifyNotice />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="help" element={<HelpCenterPage />} />
          <Route path="contact" element={<ContactUsPage />} />
          {/* Payment Results */}
          <Route path="payment-success" element={<PaymentSuccessPage />} />
          <Route path="payment-fail" element={<PaymentFailPage />} />
          <Route path="payment-cancel" element={<PaymentCancelPage />} />
          {/* Guest/User Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRouteWrapper role={["user", "host", "driver", "admin"]}>
                <DashboardPage />
              </ProtectedRouteWrapper>
            }
          />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="/debug/auth" element={<AuthDebug />} />

          <Route
            path="dashboard/bookings"
            element={
              <ProtectedRouteWrapper>
                <DashboardBookings />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="my-bookings"
            element={
              <ProtectedRouteWrapper>
                <MyBookingsPage />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/dashboard/reviews"
            element={
              <ProtectedRouteWrapper>
                <ReviewPage />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRouteWrapper>
                <EditProfilePage />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="my-account"
            element={
              <ProtectedRouteWrapper>
                <MyAccountPage />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="payment-details"
            element={
              <ProtectedRouteWrapper>
                <PaymentDetailsForm />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRouteWrapper>
                <Notifications />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="dashboard/chats"
            element={
              <ProtectedRouteWrapper>
                <GuestChatsRoute />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/dashboard/host/chats"
            element={
              <ProtectedRouteWrapper role="host">
                <HostChatsRoute />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="wishlist"
            element={
              <ProtectedRouteWrapper>
                <MyWishlistPage />
              </ProtectedRouteWrapper>
            }
          />
          {/* Host Protected Routes */}
          {/* Host Protected Routes */}
          <Route
            path="host/dashboard"
            element={
              <ProtectedRouteWrapper role="host">
                <HostDashboard />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="host/create"
            element={
              <ProtectedRouteWrapper role="host">
                <CreateListingPage />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="host/edit/:id"
            element={
              <ProtectedRouteWrapper role="host">
                <EditListingPage />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="host/listings/:id/bookings"
            element={
              <ProtectedRouteWrapper role="host">
                <HostListingBookingsPage />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/host/listings/:id/blocked-dates"
            element={
              <ProtectedRouteWrapper role="host">
                <HostBlockedDates />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/my-referrals"
            element={
              <ProtectedRouteWrapper>
                <MyReferralsPage />
              </ProtectedRouteWrapper>
            }
          />
          {/* Admin Protected Routes */}
          <Route
            path="/admin/setting"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminSettings />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminDashboard />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/search"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminSearch />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/bookings/:id"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminBookingDetail />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/listings/:id"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminListingDetails />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/trips/:id"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminTripDetails />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/banners"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminBanners />
              </ProtectedRouteWrapper>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminUsers />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminUserDetail />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/listings"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminListings />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminBookings />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/kyc"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminKYC />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/payment-accounts"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminPaymentAccounts />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/user-breakdown"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminUserBreakdown />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/flagged"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminFlagged />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/revenue"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminRevenue />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/payouts"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminPayouts />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/refunds"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminRefundsPage />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/payouts/overdue"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminOverduePayouts />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminLogs />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/promocodes"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminPromocodes />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/admin/referrals"
            element={
              <ProtectedRouteWrapper role="admin">
                <AdminReferrals />
              </ProtectedRouteWrapper>
            }
          />
          {/* Driver Protected Routes */}
          <Route
            path="/become-driver"
            element={
              <ProtectedRouteWrapper role="driver">
                <BecomeDriverPage />
              </ProtectedRouteWrapper>
            }
          />

          <Route
            path="/dashboard/driver"
            element={
              <ProtectedRouteWrapper role="driver">
                <DriverDashboard />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/dashboard/driver/trips/new"
            element={
              <ProtectedRouteWrapper role="driver">
                <DriverTripForm />
              </ProtectedRouteWrapper>
            }
          />
          <Route
            path="/dashboard/driver/trips/edit/:id"
            element={
              <ProtectedRouteWrapper role="driver">
                <EditTripForm />
              </ProtectedRouteWrapper>
            }
          />

          <Route path="/trip-search" element={<TripSearchPage />} />
          <Route path="/trips" element={<RideResultsPage />} />
          <Route path="/trips/:id" element={<TripDetailPage />} />
          <Route
            path="/trip-payment-success"
            element={<TripPaymentSuccess />}
          />

          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
        </Route>
      </Routes>
      <ToastContainer
        // keep this so it uses the center container
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{
          top: "50%", // middle vertically
          left: "50%", // center horizontally
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
        }}
      />
    </Router>
  );
}

export default App;
