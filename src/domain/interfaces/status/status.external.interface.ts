import { MonitorActionResult, MonitorClient } from "./status.interface";

export type ExternalServiceStatus = "OK" | "KO";


export interface ExternalServiceStatusResponse {
    serviceStatus: ExternalServiceStatus,
    metadata: unknown,
};


export interface ExternalAllServicesStatusResult {
    servicesProbes: ExternalServiceStatusResponse[],
};


export interface ExternalServiceInfo {
    serviceName: string,
    healthRoute: string,
};


export interface ExternalServiceMonitorClient extends MonitorClient {
    getServiceStatus(serviceInfo: ExternalServiceInfo): Promise<MonitorActionResult<ExternalServiceStatusResponse>>;
    getAllServicesStatus(servicesInfo: ExternalServiceInfo[]): Promise<MonitorActionResult<ExternalAllServicesStatusResult>>; 
};