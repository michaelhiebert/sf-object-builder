export const requireAuth = (req, res, next) => {
  if (req.user || req.session?.user) {
    req.user = req.user || req.session.user;
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
