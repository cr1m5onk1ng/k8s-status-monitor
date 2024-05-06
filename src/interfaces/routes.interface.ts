import { Router } from 'express';

export interface Routes {
    auth: boolean;
    path?: string;
    router: Router;
}
