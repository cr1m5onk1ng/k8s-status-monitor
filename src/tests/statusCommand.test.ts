import MonitorApiKubernetesClient from "../domain/repositories/status/k8sclientRepository";
import GetK8sServicesStatusCommand from "../domain/repositories/status/statusRepository";
import { TEST_CLUSTER_ID, TEST_ZONE_ID, TEST_PROJECT_ID } from "../config"

const timeLimit = 20_000; // gcloud and k8s clients may take quite a long time to connect

let command: GetK8sServicesStatusCommand;

beforeAll(() => {
    command = new GetK8sServicesStatusCommand(
        MonitorApiKubernetesClient.get(
            {
                clusterId: TEST_CLUSTER_ID,
                zoneId: TEST_ZONE_ID,
                projectId: TEST_PROJECT_ID,
                namespace: 'default',
            },
        ),
    );
});

describe('Testing services status command', () => {
    it('gets deployments status without errors', done => {
        command.run().then((res) => {
            expect(res.success).toBe(true);

            done();
        });
    }, timeLimit);
});