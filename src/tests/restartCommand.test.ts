import MonitorApiKubernetesClient from "../domain/repositories/status/k8sclientRepository";
import RestartK8sDeploymentCommand from "../domain/repositories/status/restartRepository";

const timeLimit = 20_000; // gcloud and k8s clients may take quite a long time to connect

let command: RestartK8sDeploymentCommand;

beforeAll(() => {
    command = new RestartK8sDeploymentCommand(
        MonitorApiKubernetesClient.get(
            {
                clusterId: 'dev',
                zoneId: 'europe-west4-a',
                projectId: 'citypop-dev',
                namespace: 'default',
            },
        )
    );
});

describe('Testing restart service command', () => {
    it(`restarts pop-tribe-api deployment`, done => {
        command.setDeployment('pop-tribe-api');
        command.run().then((res) => {
            expect(res.success).toBe(true);
            done();
        });
    }, timeLimit);
});

