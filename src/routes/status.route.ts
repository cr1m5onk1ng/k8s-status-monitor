import { Routes } from "@/interfaces/routes.interface";
import { Router } from "express";
import StatusController from "../controllers/status.controller";

class StatusRoute implements Routes {
    public auth: boolean = true;
    public path?: string = '/status';
    public router: Router = Router();

    // TODO: Add services info
    private readonly statusController = new StatusController([]); 

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/internal`, this.statusController.getInternalStatus);
        this.router.get(`${this.path}/external`, this.statusController.getExternalStatus);
    }
}

export default StatusRoute;