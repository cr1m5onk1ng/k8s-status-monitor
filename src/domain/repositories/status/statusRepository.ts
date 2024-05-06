import { DeploymentStatusResult, KubernetesClient } from '@/domain/interfaces/status/status.internal.interface';
import { MonitorActionResult, MonitorCommand } from '@/domain/interfaces/status/status.interface';

export default class GetK8sServicesStatusCommand implements MonitorCommand<'STATUS', DeploymentStatusResult> {
    command: 'STATUS';

    private readonly serviceMonitorClient: KubernetesClient;

    constructor(client: KubernetesClient) {
        this.serviceMonitorClient = client;
    }

    public async run(): Promise<MonitorActionResult<DeploymentStatusResult>> {
        try {
            const deploymentsStatuses = await this.serviceMonitorClient.getDeploymentsStatus();

            return {
                success: true,
                data: {
                    serviceProbes: deploymentsStatuses,
                },
            };
        } catch (e) {
            return {
                success: false,
                error: new Error(`Could not get deployments status due to ${e}`),
            };
        }
    }
}
