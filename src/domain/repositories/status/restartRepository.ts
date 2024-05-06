import { KubernetesClient, RestartDeploymentResult } from '@/domain/interfaces/status/status.internal.interface';
import { MonitorCommand } from '@/domain/interfaces/status/status.interface';

export default class RestartK8sDeploymentCommand implements MonitorCommand<'RESTART', RestartDeploymentResult> {
    command: 'RESTART';

    private readonly serviceMonitorClient: KubernetesClient;

    private deployment: string;

    constructor(client: KubernetesClient) {
        this.serviceMonitorClient = client;
    }

    setDeployment(deployment: string) {
        this.deployment = deployment;
    }

    async run(): Promise<RestartDeploymentResult> {
        try {
            await this.serviceMonitorClient.restartDeployment(this.deployment);

            return {
                success: true,
            };
        } catch (e) {
            return {
                success: false,
                error: new Error(`Failed restarting k8s deployment ${this.deployment} because of ${e}`),
            };
        }
    }
}
