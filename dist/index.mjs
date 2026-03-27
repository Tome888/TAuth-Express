// src/index.ts
var simpleAuth = (expectedToken) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === `Bearer ${expectedToken}`) {
      return next();
    }
    res.status(401).json({ error: "Unauthorized: Invalid Token" });
  };
};
export {
  simpleAuth
};
//# sourceMappingURL=index.mjs.map