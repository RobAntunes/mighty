import { ConnectionHandler, JsonRpcConnectionHandler } from '@theia/core';
import { ContainerModule } from '@theia/core/shared/inversify';
import { 
    ApiDockBackendService, 
    ApiDockAIService,
    ApiDockAIClient,
    API_DOCK_BACKEND_PATH,
    API_DOCK_AI_PATH
} from '../common/protocol';
import { ApiDockBackendServiceImpl } from './api-dock-backend-service';
import { ApiDockAIServiceImpl } from './api-dock-ai-service';

export default new ContainerModule(bind => {
    // Bind backend service
    bind(ApiDockBackendService).to(ApiDockBackendServiceImpl).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler(API_DOCK_BACKEND_PATH, () => {
            return ctx.container.get<ApiDockBackendService>(ApiDockBackendService);
        })
    ).inSingletonScope();

    // Bind AI service with client support
    bind(ApiDockAIService).to(ApiDockAIServiceImpl).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler<ApiDockAIClient>(API_DOCK_AI_PATH, client => {
            const server = ctx.container.get<ApiDockAIServiceImpl>(ApiDockAIService);
            server.setClient(client);
            client.onDidCloseConnection(() => server.dispose());
            return server;
        })
    ).inSingletonScope();
});