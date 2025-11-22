// export const requireAuth = (req, res, next) => {
//   if (!req.user) return res.status(401).json({ message: "Unauthenticated" });
//   next();
// };
// export const requireAdmin = (req, res, next) => {
//   if (!req.user?.roles?.includes("admin")) {
//     return res.status(403).json({ message: "Admin only" });
//   }
//   next();
// };
