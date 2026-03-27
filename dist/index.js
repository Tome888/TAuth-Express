var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  generateJwt: () => generateJwt,
  setAuthCookie: () => setAuthCookie,
  verifyJwtMW: () => verifyJwtMW,
  verifyJwtStrictMW: () => verifyJwtStrictMW
});
module.exports = __toCommonJS(index_exports);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
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
  return import_jsonwebtoken.default.sign(payload ?? {}, secret, { expiresIn });
};
var verifyJwtMW = (secret, attachKey = "user", cookieName = "token-tauth") => {
  return (req, res, next) => {
    const token = extractToken(req, cookieName);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No Token Provided" });
    }
    import_jsonwebtoken.default.verify(token, secret, (err, decoded) => {
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
    import_jsonwebtoken.default.verify(token, secret, (err, decoded) => {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateJwt,
  setAuthCookie,
  verifyJwtMW,
  verifyJwtStrictMW
});
//# sourceMappingURL=index.js.map