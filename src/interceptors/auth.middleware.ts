import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';

import FirebaseAdmin from 'firebase-admin';

export default class AuthService {
    private app: FirebaseAdmin.app.App;

    constructor(projectId: string, clientEmail: string, privateKey: string, databaseUrl: string) {
        this.initialize(projectId, clientEmail, privateKey, databaseUrl);
    }

    private async initialize(projectId: string, clientEmail: string, privateKey: string, databaseUrl: string) {
        if (this.app == undefined) {
            try {
                this.createFirebaseApp(projectId, clientEmail, privateKey, databaseUrl);
            } catch (err) {
                logger.error('[FirabaseAdminAuth]', err);
            }
            logger.info('[FirabaseAdminAuth] Initialized');
        } else {
            logger.warn('[FirabaseAdminAuth] instance already exists');
        }
    }

    private async createFirebaseApp(projectId: string, clientEmail: string, privateKey: string, databaseUrl: string) {
        this.app = FirebaseAdmin.initializeApp({
            credential: FirebaseAdmin.credential.cert({
                projectId: projectId,
                clientEmail: clientEmail,
                privateKey: privateKey,
            }),
            databaseURL: databaseUrl,
        });
    }

    private async verifyToken(bearerToken: string): Promise<FirebaseAdmin.auth.DecodedIdToken> {
        try {
            return this.app
                .auth()
                .verifyIdToken(bearerToken)
        } catch(e) {
            logger.error(e.toString());
        }
    }

    private async populateRequestObject(res: Response, decodedTokenObj: any, bearerToken: string) {
        res.locals.firebase_uid = decodedTokenObj.user_id;
        res.locals.decoded_token = decodedTokenObj;
        res.locals.bearer_token = bearerToken;
    }

    public tokenVerificationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authorization =
                req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
            if (!authorization) {
                next(new HttpException(401, 'Invalid token'));
            }

            const split = req.headers.authorization.split(' ');

            if (split.length < 2) {
                next(new HttpException(400, 'Invalid authorization header'));
            }

            const bearerToken = req.headers.authorization.split(' ')[1];

            if (bearerToken) {
                try {
                    const decodedToken = this.verifyToken(bearerToken);
                    this.populateRequestObject(res, decodedToken, bearerToken);
                } catch(e) {
                    next(new HttpException(401, e.message));
                }
            } else {
                next(new HttpException(400, 'Missing auth token'));
            }
        } catch (error) {
            next(new HttpException(401, 'Invalid token'));
        }
    };
}
