import { NextFunction, Request, Response } from "express";
import logger from "../common/logger";
import { authService } from "../services/auth.service";
import { JwtPayload } from "jsonwebtoken";

export interface CustomRequest extends Request {
    token: string | JwtPayload;
}

class AuthMiddleware {

    static JWT_KEY = process.env.JWT_KEY;

    async validateSigninRequestBodyFields(req: Request, res: Response, next: NextFunction) {
        if (req.body && req.body.emailOrUsername && req.body.password) {
            next();
        } else {
            logger.error('While calling API "' + req.originalUrl + '" missing required field');
            res.status(400).send({ error: 'missing required field' })
        }
    }

    async validateSignupRequestBodyFields(req: Request, res: Response, next: NextFunction) {
        if (req.body && req.body.email && req.body.username && req.body.password) {
            next();
        } else {
            logger.error('While calling API "' + req.originalUrl + '" missing required field');
            res.status(400).send({ error: 'missing required field' })
        }
    }

    async validateUserAuthentication(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');

            if (!token) {
                logger.error('Auth token not found');
                res.status(401).send({ error: 'Auth token not found' })
            } else {
                if (AuthMiddleware.JWT_KEY) {
                    const decoded = await authService.verifyJwt(token, AuthMiddleware.JWT_KEY);
                    // (req as CustomRequest).token = decoded;
                    next();

                } else {
                    logger.error('JWT key not found');
                    res.status(401).send({ error: 'JWT key not found' })
                }

            }
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                logger.error(`[${error.name}] : ${error.message}`);
                res.status(401).send({ error: `[${error.name}] : ${error.message}` });
            } else if (error.name === 'JsonWebTokenError') {
                logger.error(`[${error.name}] : ${error.message}`);
                res.status(401).send({ error: `[${error.name}] : ${error.message}` });
            } else {
                logger.error(`[${error.name}] : ${error.message}`);
                res.status(401).send({ error: `[${error.name}] : ${error.message}` });
            }

        }
    }

}

export default new AuthMiddleware;