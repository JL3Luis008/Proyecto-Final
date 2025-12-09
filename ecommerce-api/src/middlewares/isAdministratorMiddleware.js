const isAdministrator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'Administrator') {
    return res.status(403).json({ message: 'Administrator access required' });
  }

  next();
}

export default isAdministrator;