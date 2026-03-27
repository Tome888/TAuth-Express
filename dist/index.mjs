// src/index.ts
import jwt from "jsonwebtoken";
var extractToken = (req, cookieName) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  if (req.cookies && req.cookies[cookieName]) {
    return req.cookies[cookieName];
  }
  return null;
};
var generateJwt = ({ payload, expiresIn, secret }) => {
  return jwt.sign(payload ?? {}, secret, { expiresIn });
};
var verifyJwtMW = (secret, attachKey = "user", cookieName = "token-tauth") => {
  return (req, res, next) => {
    const token = extractToken(req, cookieName);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No Token Provided" });
    }
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Unauthorized: Invalid Token" });
      }
      req[attachKey] = decoded;
      next();
    });
  };
};
var verifyJwtStrictMW = (secret, validator, attachKey = "user", cookieName = "token-tauth") => {
  return (req, res, next) => {
    const token = extractToken(req, cookieName);
    if (!token) {
      res.status(401).json({ error: "Unauthorized: No Token Provided" });
      return;
    }
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.status(401).json({ error: "Unauthorized: Invalid Token" });
        return;
      }
      if (!validator(decoded)) {
        res.status(422).json({
          error: "Unprocessable Entity: Token payload failed validation"
        });
        return;
      }
      req[attachKey] = decoded;
      next();
    });
  };
};
var setAuthCookie = (res, token, cookieName = "token-tauth", options = {}, env = "development") => {
  const defaultOptions = {
    httpOnly: true,
    secure: options.secure ?? process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1e3 * 60 * 60 * 24
    // 1 day default
  };
  res.cookie(cookieName, token, {
    ...defaultOptions,
    ...options
  });
};
export {
  generateJwt,
  setAuthCookie,
  verifyJwtMW,
  verifyJwtStrictMW
};
//# sourceMappingURL=index.mjs.map