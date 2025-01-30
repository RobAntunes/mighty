import { injectable } from '@theia/core/shared/inversify';
import { ApiDockAIClient, AppInfo } from '../common/protocol';

@injectable()
export class ApiDockAIClientImpl implements ApiDockAIClient {
    onSuggestionUpdate(suggestions: AppInfo[]): void {
        // Handle updated suggestions in the UI
        console.log('Received suggestion update:', suggestions);
        // You would typically update your UI components here
    }

    onImplementationProgress(progress: string): void {
        // Handle implementation progress updates in the UI
        console.log('Implementation progress:', progress);
        // You would typically update a progress indicator in your UI
    }
}