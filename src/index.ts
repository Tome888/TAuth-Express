import {
  Request,
  Response,
  NextFunction,
  Handler,
  CookieOptions,
} from "express";
import * as jwt from "jsonwebtoken";
import type { SignOptions, VerifyErrors } from "jsonwebtoken";

const extractToken = (req: Request, cookieName: string): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  if (req.cookies && req.cookies[cookieName]) {
    return req.cookies[cookieName];
  }

  return null;
};

export interface GenerateJwt {
  payload?: any;
  expiresIn?: SignOptions["expiresIn"];
  secret: string;
}

export const generateJwt = ({ payload, expiresIn, secret }: GenerateJwt) => {
  return jwt.sign(payload ?? {}, secret, { expiresIn });
};

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
  cookieName: string = "token-tauth",
): Handler => {
  return (req: Request, res: Response, next: NextFunction) => {
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
  options: CookieOptions = {},
) => {
  const defaultOptions: CookieOptions = {
    httpOnly: true,
    secure: options.secure ?? process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24,
  };

  res.cookie(cookieName, token, {
    ...defaultOptions,
    ...options,
  });
};

export const clearAuthCookie = (
  res: Response,
  cookieName: string = "token-tauth",
  options: CookieOptions = {},
) => {
  res.clearCookie(cookieName, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    ...options,
  });
};
