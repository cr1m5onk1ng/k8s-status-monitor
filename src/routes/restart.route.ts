import RestartController from "@/controllers/restart.controller";
import { Routes } from "@/interfaces/routes.interface";
import { Router } from "express";

class RestartRoute implements Routes {
    auth: boolean = true;
    path?: string = '/restart';
    router: Router = Router();

    private readonly restartController: RestartController = new RestartController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/:deployment_name`, this.restartController.restartService);
    }
}

export default RestartRoute;