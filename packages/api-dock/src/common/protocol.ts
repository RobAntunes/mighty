import { JsonRpcServer } from '@theia/core/lib/common/messaging';

// API types based on the Composio API spec
export interface AppInfo {
    key: string;
    name: string;
    description: string;
    logo: string;
    categories: string[];
    tags: string[];
    appId: string;
    enabled: boolean;
    no_auth: boolean;
    createdAt: string;
    updatedAt: string;
    meta: {
        is_custom_app: boolean;
        triggersCount: number;
        actionsCount: number;
    };
}

export interface ActionInfo {
    parameters: Record<string, any>;
    response: Record<string, any>;
    appKey: string;
    appName: string;
    description: string;
    displayName: string;
    name: string;
    tags: string[];
    deprecated?: boolean;
}

export interface TriggerInfo {
    name: string;
    display_name: string;
    description: string;
    type: string;
    enabled: boolean;
    config: Record<string, any>;
    payload: Record<string, any>;
    logo?: string;
    appKey: string;
    appName: string;
}

// Backend service for API operations
export const ApiDockBackendService = Symbol('ApiDockBackendService');
export const API_DOCK_BACKEND_PATH = '/services/apidock';

export interface ApiDockBackendService {
    // App management
    getAvailableApps(): Promise<AppInfo[]>;
    getAppDetails(appKey: string): Promise<AppInfo>;
    
    // Action management
    getActions(appKey: string): Promise<ActionInfo[]>;
    executeAction(appKey: string, actionName: string, params: any): Promise<any>;
    
    // Trigger management
    getTriggers(appKey: string): Promise<TriggerInfo[]>;
    enableTrigger(appKey: string, triggerName: string, config: any): Promise<void>;
    disableTrigger(appKey: string, triggerName: string): Promise<void>;
}

// AI-assisted operations
export const ApiDockAIService = Symbol('ApiDockAIService');
export const API_DOCK_AI_PATH = '/services/apidock/ai';

export interface ApiDockAIService extends JsonRpcServer<ApiDockAIClient> {
    // AI-assisted API exploration
    suggestApis(description: string): Promise<AppInfo[]>;
    explainApi(appKey: string): Promise<string>;
    generateActionExample(appKey: string, actionName: string): Promise<string>;
    
    // AI-assisted implementation
    generateImplementation(description: string): Promise<string>;
    explainError(error: any): Promise<string>;
}

// Client interface for AI service callbacks
export const ApiDockAIClient = Symbol('ApiDockAIClient');
export interface ApiDockAIClient {
    onSuggestionUpdate(suggestions: AppInfo[]): void;
    onImplementationProgress(progress: string): void;
}