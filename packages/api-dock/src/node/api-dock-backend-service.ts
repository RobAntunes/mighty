import { injectable } from '@theia/core/shared/inversify';
import {
    ApiDockBackendService,
    AppInfo,
    ActionInfo,
    TriggerInfo
} from '../common/protocol';
import dotenv from "dotenv";
dotenv.config({ "path": "../../.env" })

@injectable()
export class ApiDockBackendServiceImpl implements ApiDockBackendService {
    private readonly baseUrl = 'https://backend.composio.dev';
    private apiKey: string = process.env.composio!;

    private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                ...options.headers,
                'x-api-key': this.apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        return response.json();
    }

    async getAvailableApps(): Promise<AppInfo[]> {
        const response = await this.fetchWithAuth('/api/v1/apps');
        return response.items;
    }

    async getAppDetails(appKey: string): Promise<AppInfo> {
        const response = await this.fetchWithAuth(`/api/v1/apps/${appKey}`);
        return response;
    }

    async getActions(appKey: string): Promise<ActionInfo[]> {
        const response = await this.fetchWithAuth(`/api/v2/actions/list/all?apps=${appKey}`);
        return response.items;
    }

    async executeAction(appKey: string, actionName: string, params: any): Promise<any> {
        const response = await this.fetchWithAuth(`/api/v2/actions/${actionName}/execute`, {
            method: 'POST',
            body: JSON.stringify({
                appName: appKey,
                input: params
            })
        });
        return response;
    }

    async getTriggers(appKey: string): Promise<TriggerInfo[]> {
        const response = await this.fetchWithAuth(`/api/v1/triggers?appNames=${appKey}`);
        return response;
    }

    async enableTrigger(appKey: string, triggerName: string, config: any): Promise<void> {
        await this.fetchWithAuth(`/api/v1/triggers/enable/${appKey}/${triggerName}`, {
            method: 'POST',
            body: JSON.stringify({ triggerConfig: config })
        });
    }

    async disableTrigger(appKey: string, triggerName: string): Promise<void> {
        await this.fetchWithAuth(`/api/v1/triggers/disable/${triggerName}`, {
            method: 'POST'
        });
    }
}
