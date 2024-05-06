import MonitorApiKubernetesClient from "../domain/repositories/status/k8sclientRepository";
import RestartK8sDeploymentCommand from "../domain/repositories/status/restartRepository";
import { TEST_CLUSTER_ID, TEST_ZONE_ID, TEST_PROJECT_ID, TEST_DEPLOYMENT_ID } from "../config"


const timeLimit = 20_000; // gcloud and k8s clients may take quite a long time to connect

let command: RestartK8sDeploymentCommand;

beforeAll(() => {
    command = new RestartK8sDeploymentCommand(
        MonitorApiKubernetesClient.get(
            {
                clusterId: TEST_CLUSTER_ID,
                zoneId: TEST_ZONE_ID,
                projectId: TEST_PROJECT_ID,
                namespace: 'default',
            },
        )
    );
});

describe('Testing restart service command', () => {
    it(`restarts pop-tribe-api deployment`, done => {
        command.setDeployment(TEST_DEPLOYMENT_ID);
        command.run().then((res) => {
            expect(res.success).toBe(true);
            done();
        });
    }, timeLimit);
});

