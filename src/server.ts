import App from '@/app';
import HealthRoute from '@routes/health.route';
import validateEnv from '@utils/validateEnv';
import StatusRoute from './routes/status.route';
import RestartRoute from './routes/restart.route';

validateEnv();

const app = new App([new HealthRoute(), new StatusRoute(), new RestartRoute()]);

app.initModules().then(() => {
    app.listen();
});
