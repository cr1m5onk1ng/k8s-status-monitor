import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import morganBody from 'morgan-body';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import {
    NODE_ENV,
    PORT,
    LOG_FORMAT,
    ORIGIN,
    CREDENTIALS,
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_DATABASE_URL,
} from '@config';
import AuthService from '@/interceptors/auth.middleware';
import { Routes } from '@interfaces/routes.interface';
import errorMiddleware from '@/interceptors/error.middleware';
import { logger, stream } from '@utils/logger';

class App {
    private readonly routes: Routes[];
    public app: express.Application;
    public env: string;
    public port: string | number;

    constructor(routes: Routes[]) {
        this.app = express();
        this.env = NODE_ENV || 'development';
        this.port = PORT || 3000;
        this.routes = routes;
    }

    public listen() {
        this.app.listen(this.port, () => {
            logger.info(`=================================`);
            logger.info(`======= ENV: ${this.env} =======`);
            logger.info(`🚀 App listening on port ${this.port}`);
            logger.info(`=================================`);
        });
    }

    public getServer() : express.Application {
        return this.app;
    }

    public async initModules() {
        this.setupSwagger();
        this.initMiddlewares();
        this.initRoutes(this.routes);
        this.setupErrorHandling();
    }

    private initMiddlewares() {
        this.app.use(morgan(LOG_FORMAT, { stream }));
        this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
        this.app.use(hpp());
        this.app.use(helmet());
        this.app.use(compression());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        morganBody(this.app);
    }

    private initRoutes(routes: Routes[]) {
        const auth = new AuthService(FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_DATABASE_URL);
        // Setup all unauth routes
        logger.info(`=================================`);
        const noAuthRoutes = routes.filter(route => {
            !route.auth
        })
        
        noAuthRoutes.forEach(route => {
            logger.info(`No auth route ${route.path} up and running`);
            this.app.use('/monitor', route.router);
        });

        logger.info(`=================================`);

        // Setup all auth routes
        const authRoutes = routes.filter(route => {
            route.auth
        })

        authRoutes.forEach(route => {
            logger.info(`Auth route ${route.path} up and running`);
                this.app.use(auth.tokenVerificationMiddleware);
                this.app.use('/monitor', route.router);
        });

        logger.info(`=================================`);
    }

    private setupSwagger() {
        const options = {
            swaggerDefinition: {
                openapi: '3.0.0',
                info: {
                    title: 'Status Monitor API',
                    version: '0.0.1',
                    description: 'Documentation',
                },
            },
            apis: ['docs/swagger.yaml'],
        };

        const specs = swaggerJSDoc(options);
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
    }

    private setupErrorHandling() {
        this.app.use(errorMiddleware);
    }
}

export default App;
