import MonitorApiKubernetesClient from "../domain/repositories/status/k8sclientRepository";
import { TEST_CLUSTER_ID, TEST_ZONE_ID, TEST_PROJECT_ID, TEST_DEPLOYMENT_ID } from "../config"

const timeLimit = 20_000; // gcloud and k8s clients may take quite a long time to connect

let client: MonitorApiKubernetesClient;

beforeAll(() => {
    client = MonitorApiKubernetesClient.get(
        {
            clusterId: TEST_CLUSTER_ID,
            zoneId: TEST_ZONE_ID,
            projectId: TEST_PROJECT_ID,
            namespace: 'default',
        },
    );
});

describe('Testing K8s client', () => {
    it('connects to kubernetes cluster', () => {
        return expect(client.getCredentials()).resolves.toBeDefined();
    }, timeLimit);

    it('creates kubernetes API client', () => {
        return expect(client.getApi()).resolves.toBeDefined();
    }, timeLimit);

    it('returns deployments status', () => {
        return expect(client.getDeploymentsStatus()).resolves.toBeDefined();
    }, timeLimit);

    it('returns non-empty deployments status', done => {
        client.getDeploymentsStatus().then((statuses) => {
            expect(statuses.length).toBeGreaterThan(0);

            done();
        });
    }, timeLimit);

    it('restarts deployment successfully', () => {
        return expect(client.restartDeployment(TEST_DEPLOYMENT_ID)).resolves.not.toThrow();
    }, timeLimit);
});

