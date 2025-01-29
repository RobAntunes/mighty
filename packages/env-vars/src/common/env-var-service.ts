// src/common/env-var-service.ts

export const envVarServicePath = '/services/env-var-service';

export interface EnvVarService {
    writeEnvFile(content: string, workspacePath: string): Promise<void>;
    readEnvFile(workspacePath: string): Promise<string>;
}

export const EnvVarService = Symbol('EnvVarService');

export interface EnvVarEntry {
    key: string;
    value: string;
}
