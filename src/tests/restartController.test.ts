import App from "../app";
import { TEST_DEPLOYMENT_ID } from "../config";
import RestartRoute from "../routes/restart.route";
import request from "supertest";

const timeLimit = 20_000; // gcloud and k8s clients may take quite a long time to connect

let app: App;

let token: string;

beforeAll((done) => {
    app = new App([new RestartRoute()]);
    
    app.initModules().then(() => {
        request('https://www.googleapis.com')
        .post('/identitytoolkit/v3/relyingparty/verifyPassword?key=' + process.env.FIREBASE_TEST_KEY)
        .send({
            email: process.env.FIREBASE_TEST_EMAIL,
            password: process.env.FIREBASE_TEST_PASSWORD,
            returnSecureToken: true
        })
        .end((_, res) => {
            token = res.body.idToken;
            done();
        });
    });
});

describe('Testing restart service controller', () => {
    it('restarts a kubernetes deployment with status 204', async () => {
        const restartRoute = new RestartRoute();
        return request(app.getServer())
            .post(`/monitor${restartRoute.path}/${TEST_DEPLOYMENT_ID}`)
            .send()
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)
            .expect(204);
    }, timeLimit);
});