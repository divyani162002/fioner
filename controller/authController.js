exports.googleLogin = (req, res) => {
  res.send({ message: "Successfully authenticated", user: req.user });
};

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.send({ message: "Logged out successfully" });
  });
};

exports.getUser = (req, res) => {
  if (req.isAuthenticated()) {
    return res.json(req.user);
  }
  res.status(401).json({ message: "Not authenticated" });
};
