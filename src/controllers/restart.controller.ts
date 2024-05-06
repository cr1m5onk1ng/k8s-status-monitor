import MonitorApiKubernetesClient from "@/domain/repositories/status/k8sclientRepository";
import RestartK8sDeploymentCommand from "@/domain/repositories/status/restartRepository";
import { HttpException } from "@/exceptions/HttpException";
import { NextFunction, Request, Response } from "express";

export default class RestartController {
    private readonly restartCommand: RestartK8sDeploymentCommand = new RestartK8sDeploymentCommand(
        MonitorApiKubernetesClient.get()
    );

    public restartService = async (req: Request, res: Response, next: NextFunction) => {
        const deployment = req.params.deployment_name;
        if(deployment === undefined) {
            next(
                new HttpException(
                    400,
                    "malformed request. A path parameter 'deployment_id' of type string was expected",
                ),
            );
        };

        this.restartCommand.setDeployment(deployment);
        
        const result = await this.restartCommand.run();

        if(result.success === true) {
            res.status(204).end();
        } else {
            next(result.error);
        }
    } 
}