import { Request, Response, NextFunction } from 'express';

/**
 * A simple middleware that checks for a specific Bearer token
 */
declare const simpleAuth: (expectedToken: string) => (req: Request, res: Response, next: NextFunction) => void;

export { simpleAuth };
