export function getSession(req, res) {
  const session = req.session;

  if (!session?.user) {
    res.status(401).send("No active session");
    return null;
  }
  
  return session.user;
}
