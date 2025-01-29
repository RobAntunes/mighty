import { ContainerModule } from '@theia/core/shared/inversify';
import { WebSocketConnectionProvider } from '@theia/core/lib/browser';
import { WidgetFactory } from '@theia/core/lib/browser';
import { bindViewContribution } from '@theia/core/lib/browser';
import { EnvVarService, envVarServicePath } from '../common/env-var-service';
import { EnvVarManagerWidget } from './env-vars-widget';
import { EnvVarsCommandContribution } from './env-vars-contribution';

export default new ContainerModule(bind => {
    // Bind the widget factory
    bind(EnvVarManagerWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: EnvVarManagerWidget.ID,
        createWidget: () => ctx.container.get<EnvVarManagerWidget>(EnvVarManagerWidget)
    })).inSingletonScope();

    // Bind the contribution
    bindViewContribution(bind, EnvVarsCommandContribution);

    // Bind the EnvVarService proxy
    bind(EnvVarService).toDynamicValue(ctx => {
        const connection = ctx.container.get(WebSocketConnectionProvider);
        return connection.createProxy<EnvVarService>(envVarServicePath);
    }).inSingletonScope();
});
