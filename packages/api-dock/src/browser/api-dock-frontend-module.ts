import { ContainerModule } from '@theia/core/shared/inversify';
import { WebSocketConnectionProvider } from '@theia/core/lib/browser';
import { bindViewContribution, FrontendApplicationContribution, WidgetFactory } from '@theia/core/lib/browser';
import { 
    ApiDockBackendService,
    ApiDockAIService,
    ApiDockAIClient,
    API_DOCK_BACKEND_PATH,
    API_DOCK_AI_PATH
} from '../common/protocol';
import { ApiDockAIClientImpl } from './api-dock-ai-client';
import { ApiDockWidget } from './api-dock-widget';
import { ApiDockContribution } from './api-dock-contribution';

export default new ContainerModule(bind => {
    // Bind the widget
    bind(ApiDockWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: ApiDockWidget.ID,
        createWidget: () => ctx.container.get(ApiDockWidget)
    }));

    // Bind the contribution
    bindViewContribution(bind, ApiDockContribution);
    bind(FrontendApplicationContribution).toService(ApiDockContribution);

    // Bind the AI Client implementation
    bind(ApiDockAIClient).to(ApiDockAIClientImpl).inSingletonScope();

    // Connect to backend service
    bind(ApiDockBackendService).toDynamicValue(ctx => {
        const connection = ctx.container.get(WebSocketConnectionProvider);
        return connection.createProxy<ApiDockBackendService>(API_DOCK_BACKEND_PATH);
    }).inSingletonScope();

    // Connect to AI service
    bind(ApiDockAIService).toDynamicValue(ctx => {
        const connection = ctx.container.get(WebSocketConnectionProvider);
        const client = ctx.container.get<ApiDockAIClient>(ApiDockAIClient);
        return connection.createProxy<ApiDockAIService>(API_DOCK_AI_PATH, client);
    }).inSingletonScope();
});