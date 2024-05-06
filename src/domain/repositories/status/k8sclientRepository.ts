import { DeploymentState, DeploymentsStatusResponse, KubernetesClient } from '@/domain/interfaces/status/status.internal.interface';
import { NAMESPACE, CLUSTER_ID, ZONE_ID, PROJECT_ID } from '@/config';
import { ClusterManagerClient } from '@google-cloud/container';
import { AppsV1Api, KubeConfig, V1Deployment } from '@kubernetes/client-node';

type ClusterConfig = {
    projectId: string;
    zoneId: string;
    clusterId: string;
    namespace: string;
};

type ClusterCredentials = {
    endpoint: string;
    certificateAuthority: string;
    accessToken: string;
};

/*
 * Wrapper to interact with the Kubenetes API and extract deployment-related information
 */
export default class MonitorApiKubernetesClient implements KubernetesClient {
    private clusterManagerClient: ClusterManagerClient = new ClusterManagerClient();
    private k8Client: AppsV1Api | undefined = undefined;
    private readonly config: ClusterConfig | undefined = undefined;
    private static _instance: MonitorApiKubernetesClient;

    private constructor(configuration?: ClusterConfig) {
        this.config = configuration;
    }

    public static get(configuration?: ClusterConfig): MonitorApiKubernetesClient {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new MonitorApiKubernetesClient(configuration);
        return this._instance;
    }

    /*
     * performs a rolling update by changing the restartedAt field
     * this should trigger a hot restart of all the pods in the deployment
     */
    public async restartDeployment(deployment: string): Promise<void> {
        const fieldManager = 'kubectl-rollout';
        const patchBody = {
            spec: {
                template: {
                    metadata: {
                        annotations: {
                            'kubectl.kubernetes.io/restartedAt': new Date(),
                        },
                    },
                },
            },
        };

        (await this.getApi()).patchNamespacedDeployment(
            deployment,
            this.config !== undefined ? this.config.namespace : NAMESPACE,
            patchBody,
            'true',
            undefined,
            fieldManager,
            undefined,
            undefined,
            {
                headers: {
                    'Content-Type': 'application/strategic-merge-patch+json',
                },
            },
        );
    }

    public async getDeploymentStatus(deployment: V1Deployment): Promise<DeploymentsStatusResponse> {
        const deploymentState = await this.getDeploymentState(deployment);

        return {
            deploymentName: deployment.metadata.name,
            deploymentState: deploymentState,
        };
    }

    public async getDeploymentsStatus(): Promise<DeploymentsStatusResponse[]> {
        const deploymentsStatuses: DeploymentsStatusResponse[] = [];
        const deployments = await this.getDeployments();

        for (const deployment of deployments) {
            const deploymentState = await this.getDeploymentState(deployment);

            deploymentsStatuses.push({
                deploymentName: deployment.metadata.name,
                deploymentState,
            });
        }

        return deploymentsStatuses;
    }

    public async getCredentials(): Promise<ClusterCredentials> {
        const accessToken = await this.clusterManagerClient.auth.getAccessToken();

        const [response] = await this.clusterManagerClient.getCluster({
            projectId: this.config !== undefined ? this.config.projectId : PROJECT_ID,
            clusterId: this.config !== undefined ? this.config.clusterId : CLUSTER_ID,
            zone: this.config !== undefined ? this.config.zoneId : ZONE_ID,
        });

        // the following are the parameters added when a new k8s context is created
        return {
            // the endpoint set as 'cluster.server'
            endpoint: response.endpoint,
            // the certificate set as 'cluster.certificate-authority-data'
            certificateAuthority: response.masterAuth.clusterCaCertificate,
            // the accessToken set as 'user.auth-provider.config.access-token'
            accessToken: accessToken,
        };
    }

    public async getApi(): Promise<AppsV1Api> {
        if (this.k8Client !== undefined) {
            return this.k8Client;
        } else {
            const k8sCredentials = await this.getCredentials();
            const k8sClientConfig = new KubeConfig();

            k8sClientConfig.loadFromOptions({
                clusters: [
                    {
                        name: `citypop-cluster_${CLUSTER_ID}`, // any name can be used here
                        caData: k8sCredentials.certificateAuthority,
                        server: `https://${k8sCredentials.endpoint}`,
                    },
                ],
                users: [
                    {
                        name: `citypop-cluster_${CLUSTER_ID}`,
                        authProvider: 'gcp', // this is not a required field
                        token: k8sCredentials.accessToken,
                    },
                ],
                contexts: [
                    {
                        name: `citypop-cluster_${CLUSTER_ID}`,
                        user: `citypop-cluster_${CLUSTER_ID}`,
                        cluster: `citypop-cluster_${CLUSTER_ID}`,
                    },
                ],
                currentContext: `citypop-cluster_${CLUSTER_ID}`,
            });

            const k8sApi = k8sClientConfig.makeApiClient(AppsV1Api);
            this.k8Client = k8sApi;
            return k8sApi;
        }
    }

    private async getDeployments(): Promise<V1Deployment[]> {
        const deployments = (await this.getApi()).listDeploymentForAllNamespaces();
        return (await deployments).body.items;
    }

    private async getDeploymentState(deployment: V1Deployment): Promise<DeploymentState> {
        const status = deployment.status;
        const replicas = status.replicas;
        const unavailableReplicas = status.unavailableReplicas;

        if (replicas == unavailableReplicas) {
            // Deployment replicas and number of unavailable replicas match, hence
            // the deployment might be down
            return 'KO';
        }

        for (const condition of status.conditions) {
            const { type, status, reason } = condition;
            if (type === 'Available' && status === 'True' && reason === 'MinimumReplicasAvailable') {
                return 'OK';
            } else if (type === 'Progressing' && status === 'True' && reason !== 'NewReplicaSetAvailable') {
                // Deployment is still waiting for the replicas to be available
                return 'WARNING';
            }
        }

        return 'KO';
    }
}
