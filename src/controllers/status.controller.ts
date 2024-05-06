import { NextFunction, Request, Response } from 'express';
import MonitorApiKubernetesClient from '@/domain/repositories/status/k8sclientRepository';
import GetK8sServicesStatusCommand from '@/domain/repositories/status/statusRepository';
import ExternalServiceStatusClient from '@/domain/repositories/status/externalClientRepository';
import { ExternalServiceInfo } from '@/domain/interfaces/status/status.external.interface';

export default class StatusController {
    private readonly internalStatusMonitorCommand = new GetK8sServicesStatusCommand(MonitorApiKubernetesClient.get());
    private readonly externalStatusMonitorCommand = new ExternalServiceStatusClient();
    private readonly services: ExternalServiceInfo[];

    constructor(servicesInfo: ExternalServiceInfo[]) {
        this.services = servicesInfo;
    }

    public getInternalStatus = async (_: Request, res: Response, next: NextFunction) => {
        const result = await this.internalStatusMonitorCommand.run();

        if (result.success) {
            res.status(200).json(result);
        } else {
            next(result.error);
        }
    };

    public getExternalStatus = async (_: Request, res: Response, next: NextFunction) => {
        const result = await this.externalStatusMonitorCommand.getAllServicesStatus(this.services);

        if (result.success) {
            res.status(200).json(result);
        } else {
            next(result.error);
        }
    };
}
