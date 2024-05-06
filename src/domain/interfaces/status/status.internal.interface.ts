import { V1Deployment } from "@kubernetes/client-node";
import { MonitorActionResult, MonitorClient } from "./status.interface";


export type DeploymentState = "OK" | "KO" | "WARNING";


export interface DeploymentsStatusResponse {
    deploymentName: string,
    deploymentState: DeploymentState,
};


export interface DeploymentStatusResult {
    serviceProbes: DeploymentsStatusResponse[],
};


export interface RestartDeploymentResult extends MonitorActionResult<never> {};


export interface KubernetesClient extends MonitorClient {
    getDeploymentStatus(deployment: V1Deployment): Promise<DeploymentsStatusResponse>;
    getDeploymentsStatus(): Promise<DeploymentsStatusResponse[]>;
    restartDeployment(deploymentName: string): Promise<void>;
};