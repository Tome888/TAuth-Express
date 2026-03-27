import {
  Request,
  Response,
  NextFunction,
  Handler,
  CookieOptions,
} from "express";
import jwt, { JwtPayload, SignOptions, VerifyErrors } from "jsonwebtoken";

const extractToken = (req: Request, cookieName: string): string | null => {
  // 1. Check Header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  // 2. Check Cookie (fallback)
  if (req.cookies && req.cookies[cookieName]) {
    return req.cookies[cookieName];
  }

  return null;
};

/**
 * 1. TOKEN GENERATION
 */
export interface GenerateJwt {
  payload?: any;
  expiresIn?: SignOptions["expiresIn"];
  secret: string;
}

export const generateJwt = ({ payload, expiresIn, secret }: GenerateJwt) => {
  return jwt.sign(payload ?? {}, secret, { expiresIn });
};

/**
 * 2. DYNAMIC REQUEST TYPE
 * K represents the property name (defaulting to 'user')
 * T represents the data shape
 */
export type TAuthRequest<T = any, K extends string = "user"> = Request & {
  [P in K]?: T;
};

export const verifyJwtMW = <T = any, K extends string = "user">(
  secret: string,
  attachKey: K = "user" as K,
  cookieName: string = "token-tauth",
) => {
  return (req: TAuthRequest<T, K>, res: Response, next: NextFunction) => {
    const token = extractToken(req, cookieName);

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No Token Provided" });
    }

    jwt.verify(token, secret, (err: VerifyErrors | null, decoded: any) => {
      if (err) {
        return res.status(401).json({ error: "Unauthorized: Invalid Token" });
      }

      (req as any)[attachKey] = decoded;
      next();
    });
  };
};

export const verifyJwtStrictMW = <T = any, K extends string = "user">(
  secret: string,
  validator: (data: any) => data is T,
  attachKey: K = "user" as K,
  cookieName: string = "token-tauth", // Added cookieName param
): Handler => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Use our helper
    const token = extractToken(req, cookieName);

    if (!token) {
      res.status(401).json({ error: "Unauthorized: No Token Provided" });
      return;
    }

    jwt.verify(token, secret, (err: VerifyErrors | null, decoded: any) => {
      if (err) {
        res.status(401).json({ error: "Unauthorized: Invalid Token" });
        return;
      }

      if (!validator(decoded)) {
        res.status(422).json({
          error: "Unprocessable Entity: Token payload failed validation",
        });
        return;
      }

      (req as any)[attachKey] = decoded;
      next();
    });
  };
};

export const setAuthCookie = (
  res: Response,
  token: string,
  cookieName: string = "token-tauth",
  // 1. Use CookieOptions for better IntelliSense
  // 2. Default to an empty object
  options: CookieOptions = {},
  env: "development" | "production" = "development",
) => {
  const defaultOptions: CookieOptions = {
    httpOnly: true,
    secure: options.secure ?? process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24, // 1 day default
  };

  // The 'options' passed by the user will override the defaults
  res.cookie(cookieName, token, {
    ...defaultOptions,
    ...options,
  });
};
