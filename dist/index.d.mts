import { Request, Response, CookieOptions, NextFunction, Handler } from 'express';
import { SignOptions } from 'jsonwebtoken';

interface GenerateJwt {
    payload?: any;
    expiresIn?: SignOptions["expiresIn"];
    secret: string;
}
declare const generateJwt: ({ payload, expiresIn, secret }: GenerateJwt) => string;
type TAuthRequest<T = any, K extends string = "user"> = Request & {
    [P in K]?: T;
};
declare const verifyJwtMW: <T = any, K extends string = "user">(secret: string, attachKey?: K, cookieName?: string) => (req: TAuthRequest<T, K>, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
declare const verifyJwtStrictMW: <T = any, K extends string = "user">(secret: string, validator: (data: any) => data is T, attachKey?: K, cookieName?: string) => Handler;
declare const setAuthCookie: (res: Response, token: string, cookieName?: string, options?: CookieOptions, env?: "development" | "production") => void;

export { type GenerateJwt, type TAuthRequest, generateJwt, setAuthCookie, verifyJwtMW, verifyJwtStrictMW };
