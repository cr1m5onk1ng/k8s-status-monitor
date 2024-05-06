import {
    ExternalServiceInfo,
    ExternalServiceMonitorClient,
    ExternalServiceStatusResponse,
    ExternalAllServicesStatusResult,
} from '@/domain/interfaces/status/status.external.interface';
import { MonitorActionResult } from '@/domain/interfaces/status/status.interface';
import axios from 'axios';

export default class ExternalServiceStatusClient implements ExternalServiceMonitorClient {
    async getServiceStatus(serviceInfo: ExternalServiceInfo): Promise<MonitorActionResult<ExternalServiceStatusResponse>> {
        try {
            const response = await axios.get(serviceInfo.healthRoute, {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (response.status !== 200) {
                return {
                    success: true,
                    data: {
                        serviceStatus: 'KO',
                        metadata: undefined,
                    },
                };
            }

            return {
                success: true,
                data: {
                    serviceStatus: 'OK',
                    metadata: undefined,
                },
            };
        } catch (e) {
            return {
                success: false,
                error: new Error(`Failed to get service ${serviceInfo.serviceName} status due to ${e}`),
            };
        }
    }

    async getAllServicesStatus(servicesInfo: ExternalServiceInfo[]): Promise<MonitorActionResult<ExternalAllServicesStatusResult>> {
        const statuses = await Promise.all(
            servicesInfo.map(serviceInfo => {
                return this.getServiceStatus(serviceInfo);
            }),
        );

        const failure = statuses.find(value => value.success === false);

        if (failure !== undefined) {
            return {
                success: false,
                error: failure.error,
            };
        }

        return {
            success: true,
            data: {
                servicesProbes: statuses.map(status => status.data),
            },
        };
    }
}
