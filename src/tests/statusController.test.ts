import App from "../app";
import StatusRoute from "../routes/status.route";
import request from "supertest";

const timeLimit = 20_000; // gcloud and k8s clients may take quite a long time to connect

let app: App

let token: string;

beforeAll((done) => {
    app = new App([new StatusRoute()]);

    app.initModules().then(() => {
        request('https://www.googleapis.com')
        .post('/identitytoolkit/v3/relyingparty/verifyPassword?key=' + process.env.FIREBASE_TEST_KEY)
        .send({
            email: process.env.FIREBASE_TEST_EMAIL,
            password: process.env.FIREBASE_TEST_PASSWORD,
            returnSecureToken: true
        })
        .end((_, res) => {
            token = res.body.idToken
            done()
        });
    });
});

describe('Testing status controller', () => {
    it('returns status of all internal services with status code 200', async () => {
        const statusRoute = new StatusRoute();
        return request(app.getServer()).get(`/monitor${statusRoute.path}/internal`)
            .send()
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
    }, timeLimit);
    // it('returns status of all external services with status code 200', () => {
    //     const statusRoute = new StatusRoute();
    //     return request(app.getServer()).get(`${statusRoute.path}/external`)
    //         .send()
    //         .set('Accept', 'application/json')
    //         .set('Authorization', 'Bearer ' + token)
    //         .expect(200);
    // });
});

