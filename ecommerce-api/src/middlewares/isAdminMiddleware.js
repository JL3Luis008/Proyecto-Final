const isAdmin = (req, res, next) => {
  console.log("Checking admin privileges for user:", req.user?.userId, "Role:", req.user?.role);
  if (!req.user) {
    console.log("No user found in request");
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== "admin") {
    console.log("User is not an admin. Role:", req.user.role);
    return res.status(403).json({ message: "Admin access required" });
  }

  console.log("Admin access granted");
  next();
};

export default isAdmin;
