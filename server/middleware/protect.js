// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const protect = async (req, res, next) => {
//   const auth = req.headers.authorization;

//   if (!auth || !auth.startsWith("Bearer ")) {
//     console.warn("⛔ No or invalid Authorization header");
//     return res
//       .status(401)
//       .json({ message: "Unauthorized: Token missing or malformed" });
//   }

//   const token = auth.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.id).select("-password");
//     if (!user) {
//       console.warn("⛔ User not found from token");
//       return res.status(401).json({ message: "Unauthorized: User not found" });
//     }

//     req.user = {
//       id: user._id,
//       email: user.email,
//       roles: user.roles || [],
//       primaryRole: user.primaryRole || "user",
//       name: user.name,
//     };

//     console.log("✅ Authenticated as:", user.email, "| Roles:", req.user.roles);
//     next();
//   } catch (err) {
//     console.error("❌ Token verification failed:", err.message);
//     return res.status(401).json({ message: "Unauthorized: Invalid token" });
//   }
// };

// module.exports = protect;

// middleware/protect.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function protect(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    console.warn("⛔ No or invalid Authorization header");
    return res
      .status(401)
      .json({ message: "Unauthorized: Token missing or malformed" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Select EVERYTHING you will check later in guards/UI.
    // If any of these paths are `select:false` in your schema,
    // switch this .select(...) line to the commented "+" version below.
    const user = await User.findById(decoded.id)
      .select([
        "name",
        "email",
        "phone",
        "roles",
        "primaryRole",
        "kyc.status",
        "identityVerified",
        "phoneVerified",
        "paymentDetails.verified",
        "isDeleted",
      ])
      .lean();

    // If your schema uses select:false on nested fields, use this instead:
    // const user = await User.findById(decoded.id)
    //   .select("+kyc.status +paymentDetails.verified -password name email phone roles primaryRole identityVerified phoneVerified isDeleted")
    //   .lean();

    if (!user) {
      console.warn("⛔ User not found from token");
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }
    if (user.isDeleted) {
      return res.status(403).json({ message: "Account is deactivated." });
    }

    req.user = user; // fresh snapshot (includes flags)
    req.userId = String(user._id); // convenience for other middlewares

    console.log(
      "✅ Authenticated:",
      user.email,
      "| roles:",
      user.roles,
      "| kyc:",
      user.kyc?.status,
      "| identity:",
      user.identityVerified,
      "| phone:",
      user.phoneVerified,
      "| payout:",
      user.paymentDetails?.verified
    );

    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
