import ExternalServiceStatusClient from "../domain/repositories/status/externalClientRepository";
import { ExternalAllServicesStatusResult, ExternalServiceInfo } from "../domain/interfaces/status/status.external.interface";
import { MonitorActionResult } from "../domain/interfaces/status/status.interface";


const timeLimit = 5_000; 

let client: ExternalServiceStatusClient;

let servicesInfo: ExternalServiceInfo[];

beforeAll(() => {
    client = new ExternalServiceStatusClient();

    servicesInfo = [
        {
          serviceName: 'datatrans',
          healthRoute: 'https://api.sandbox.datatrans.com/upp/check',  
        },
    ];
});

describe('Testing external service status client', () => {
    it('returns all external services status without errors', (done) => {
        client.getAllServicesStatus(servicesInfo).then((res: MonitorActionResult<ExternalAllServicesStatusResult>) => {
            expect(res.success).toBe(true);
            expect(res.data?.servicesProbes.length).toBeGreaterThan(0);
            done();
        });
    }, timeLimit);
});