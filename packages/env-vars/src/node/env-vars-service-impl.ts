// src/node/env-vars-service-impl.ts

import * as fs from 'fs';
import * as path from 'path';
import { injectable, inject } from '@theia/core/shared/inversify';
import { ILogger } from '@theia/core/lib/common/logger';
import { EnvVarService } from '../common/env-var-service';
import { FileUri } from '@theia/core/lib/common/file-uri';

@injectable()
export class EnvVarServiceImpl implements EnvVarService {
    @inject(ILogger)
    protected readonly logger: ILogger;

    async writeEnvFile(content: string, workspacePath: string): Promise<void> {
        try {
            const envFilePath = path.join(FileUri.fsPath(workspacePath), '.env');
            
            // Ensure proper line endings and formatting
            const formattedContent = content.trim().replace(/\r\n/g, '\n') + '\n';

            // Write the file with restricted permissions (600)
            await fs.promises.writeFile(envFilePath, formattedContent, {
                encoding: 'utf8',
                mode: 0o600 // Read/write for owner only
            });

            this.logger.info(`Successfully wrote .env file at ${envFilePath}`);
        } catch (error) {
            this.logger.error('Failed to write .env file:', error);
            throw error;
        }
    }

    async readEnvFile(workspacePath: string): Promise<string> {
        try {
            const envFilePath = path.join(FileUri.fsPath(workspacePath), '.env');
            
            // Check if file exists
            if (!fs.existsSync(envFilePath)) {
                return '';
            }

            const content = await fs.promises.readFile(envFilePath, {
                encoding: 'utf8'
            });

            return content;
        } catch (error) {
            this.logger.error('Failed to read .env file:', error);
            throw error;
        }
    }
}
