// routes/listing.js
const express = require("express");
const router = express.Router();

const listingCtrl = require("../controllers/listingController");
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const {
  ensureHostReadyForListing,
} = require("../middleware/ensureHostReadyForListing");

const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage, limits: { files: 10 } });

// ---- Public
router.get("/featured", listingCtrl.getFeaturedListings);
router.get("/host/:hostId", listingCtrl.getListingsByHost);
router.get("/", listingCtrl.getAllListings);
router.get("/:id", listingCtrl.getListingById);

// ---- Protected CRUD
router.post(
  "/",
  protect,
  ensureHostReadyForListing,
  upload.array("images", 10),
  listingCtrl.createListing
);

router.put("/:id", protect, authorize("host"), listingCtrl.updateListing);
router.delete("/:id", protect, authorize("host"), listingCtrl.deleteListing);

router.post(
  "/:id/block-dates",
  protect,
  authorize("host"),
  listingCtrl.blockDates
);
router.delete(
  "/:id/block-dates",
  protect,
  authorize("host"),
  listingCtrl.unblockDates
);

// (Optional utility)
router.post("/upload", protect, upload.single("image"), (req, res) => {
  res.json({ imageUrl: req.file.path });
});

module.exports = router;
