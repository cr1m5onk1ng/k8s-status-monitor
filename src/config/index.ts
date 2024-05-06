import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            [key: string]: string | undefined;
            LOG_DIR: string;
            ORIGIN: string;
            FIREBASE_PROJECT_ID: string;
            FIREBASE_CLIENT_EMAIL: string;
            FIREBASE_PRIVATE_KEY: string;
            NAMESPACE: string;
            CLUSTER_NAME: string;
            AUTH_PROVIDER: string;
            ZONE_ID: string;
            CLUSTER_ID: string;
            PROJECT_ID: string;
            TEST_ZONE_ID: string;
            TEST_CLUSTER_ID: string;
            TEST_PROJECT_ID: string;
            TEST_DEPLOYMENT_ID: string;
        }
    }
}

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const DB_LOGGING = process.env.DB_LOGGING.split(',');

export const {
    NODE_ENV,
    PORT,
    SECRET_KEY,
    LOG_FORMAT,
    LOG_DIR,
    ORIGIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_DATABASE_URL,
    NAMESPACE, 
    CLUSTER_NAME, 
    AUTH_PROVIDER, 
    ZONE_ID, 
    CLUSTER_ID, 
    PROJECT_ID,
    TEST_ZONE_ID,
    TEST_CLUSTER_ID,
    TEST_PROJECT_ID,
    TEST_DEPLOYMENT_ID
} = process.env;
