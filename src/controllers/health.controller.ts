import { NextFunction, Request, Response } from 'express';

class HealthController {
    public getHealthStatus = (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(200).json({ health: 'OK' });
        } catch (error) {
            next(error);
        }
    };
}

export default HealthController;
