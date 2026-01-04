// routes/admin.js
const express = require("express");
const router = express.Router();

const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");

const ctrl = require("../controllers/adminController");

// every route requires admin unless explicitly widened
const adminOnly = [protect, authorize("admin")];

/* -------- Flagged -------- */
router.get("/flagged/reviews", ...adminOnly, ctrl.getFlaggedReviews);
router.get("/flagged/listings", ...adminOnly, ctrl.getFlaggedListings);
router.get("/flagged/users", ...adminOnly, ctrl.getFlaggedUsers);
router.get("/flagged", ...adminOnly, ctrl.getFlaggedAll);
router.put("/unflag/:type/:id", ...adminOnly, ctrl.unflagItem);

/* -------- Users -------- */
router.get("/users", ...adminOnly, ctrl.getUsers);
router.get("/users/:id", ...adminOnly, ctrl.getUserById);
router.put("/users/:id/role", ...adminOnly, ctrl.updateUserRole);
router.patch("/users/:id/soft-delete", ...adminOnly, ctrl.softDeleteUser);
router.patch("/users/:id/restore", ...adminOnly, ctrl.restoreUser);
router.get("/user-breakdown", ...adminOnly, ctrl.userBreakdown);

/* -------- Listings -------- */
router.get("/listings", ...adminOnly, ctrl.getListings);
router.get("/listings/:id", ...adminOnly, ctrl.getListingById);
router.patch("/listings/:id/soft-delete", ...adminOnly, ctrl.softDeleteListing);
router.patch("/listings/:id/restore", ...adminOnly, ctrl.restoreListing);

/* -------- Bookings -------- */
router.get("/bookings", ...adminOnly, ctrl.getBookings);
router.get("/bookings/:id", ...adminOnly, ctrl.getBookingById);

/* -------- KYC -------- */
router.get("/kyc", ...adminOnly, ctrl.getKycGroups);
router.get("/kyc/pending", ...adminOnly, ctrl.getKycPending);
router.patch("/kyc/:userId", ...adminOnly, ctrl.patchKycStatus);

/* -------- payment-accounts -------- */
router.get(
  "/payment-accounts/pending",
  ...adminOnly,
  ctrl.getPendingPaymentAccounts
);
router.patch(
  "/payment-accounts/:userId/verify",
  ...adminOnly,
  ctrl.adminVerifyPaymentDetails
);

/* -------- Revenue & Stats -------- */
router.get("/revenue", ...adminOnly, ctrl.getRevenue);
router.get("/stats", ...adminOnly, ctrl.getStats);
router.get(
  "/stats/reviews",
  protect,
  authorize("admin", "host"),
  ctrl.getMonthlyReviews
);
router.get(
  "/stats/earnings",
  protect,
  authorize("admin", "host"),
  ctrl.getMonthlyEarnings
);

/* -------- Payouts (Hosts) -------- */
router.get("/payouts/pending", ...adminOnly, ctrl.getPendingPayouts);
router.put("/payouts/:id/mark-paid", ...adminOnly, ctrl.markPayoutPaid);
router.get("/payouts/overdue", ...adminOnly, ctrl.getOverduePayouts);

/* -------- Payouts (Drivers) -------- */
router.get(
  "/driver-payouts/pending",
  ...adminOnly,
  ctrl.getPendingDriverPayouts
);
router.put(
  "/driver-payouts/:id/mark-paid",
  ...adminOnly,
  ctrl.markDriverPayoutPaid
);

/* -------- Maintenance -------- */
router.patch("/toggle-maintenance", ...adminOnly, ctrl.toggleMaintenance);

/* -------- Promo Codes -------- */
router.get("/promocode", ...adminOnly, ctrl.getPromocodes);
router.post("/promocode", ...adminOnly, ctrl.createPromocode);
router.patch(
  "/promocode/:id/deactivate",
  ...adminOnly,
  ctrl.deactivatePromocode
);
router.delete("/promocode/:id", ...adminOnly, ctrl.deletePromocode);

/* -------- Referrals -------- */
router.get("/referrals", ...adminOnly, ctrl.getReferrals);

/* -------- Export -------- */
router.get("/export/users", ...adminOnly, ctrl.exportUsersCSV);
router.get("/export/users-xlsx", ...adminOnly, ctrl.exportUsersXLSX);

/* -------- Search -------- */
router.get("/search", ...adminOnly, ctrl.adminSearch);
router.get("/export-search", ctrl.exportSearch); // performs its own token/admin check

/* -------- Trips -------- */
router.get("/trips/:id", ...adminOnly, ctrl.getTripById);

module.exports = router;
