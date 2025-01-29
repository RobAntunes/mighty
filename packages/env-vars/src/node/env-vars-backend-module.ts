// src/node/env-vars-backend-module.ts

import { ContainerModule } from '@theia/core/shared/inversify';
import { ConnectionHandler, JsonRpcConnectionHandler } from '@theia/core';
import { EnvVarService, envVarServicePath } from '../common/env-var-service';
import { EnvVarServiceImpl } from './env-vars-service-impl';

export default new ContainerModule(bind => {
    bind(EnvVarService).to(EnvVarServiceImpl).inSingletonScope();
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler(envVarServicePath, () => {
            return ctx.container.get<EnvVarService>(EnvVarService);
        })
    ).inSingletonScope();
});
