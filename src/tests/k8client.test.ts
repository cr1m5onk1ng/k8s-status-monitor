import MonitorApiKubernetesClient from "../domain/repositories/status/k8sclientRepository";

const timeLimit = 20_000; // gcloud and k8s clients may take quite a long time to connect

let client: MonitorApiKubernetesClient;

beforeAll(() => {
    client = MonitorApiKubernetesClient.get(
        {
            clusterId: 'dev',
            zoneId: 'europe-west4-a',
            projectId: 'citypop-dev',
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
        return expect(client.restartDeployment('pop-tribe-api')).resolves.not.toThrow();
    }, timeLimit);
});

