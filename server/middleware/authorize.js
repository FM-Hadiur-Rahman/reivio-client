// const authorize = (...roles) => {
//   return (req, res, next) => {
//     console.log("✅ Required roles:", roles);
//     console.log("🧑‍💻 Logged-in user role:", req.user.role);
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ message: "Access denied" });
//     }
//     next();
//   };
// };

// module.exports = authorize;
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];

    // Check if the user has at least one of the allowed roles
    const isAuthorized = allowedRoles.some((role) => userRoles.includes(role));

    if (!isAuthorized) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

module.exports = authorize;
