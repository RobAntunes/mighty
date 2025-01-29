import { ContainerModule } from '@theia/core/shared/inversify';
import { WebSocketConnectionProvider, WidgetFactory, bindViewContribution } from '@theia/core/lib/browser';
import { EnvVarService, envVarServicePath } from '../common/env-var-service';
import { EnvVarManagerWidget } from './env-vars-widget';
import { EnvVarsCommandContribution } from './env-vars-contribution';

export default new ContainerModule(bind => {
    // Bind the widget
    bind(EnvVarManagerWidget).toSelf();
    
    // Bind the widget factory for async widget creation
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: EnvVarManagerWidget.ID,
        createWidget: async () => ctx.container.get<EnvVarManagerWidget>(EnvVarManagerWidget)
    })).inSingletonScope();

    // Bind the view contribution for menus and commands
    bindViewContribution(bind, EnvVarsCommandContribution);

    // Bind the environment variables service proxy
    bind(EnvVarService).toDynamicValue(ctx => {
        const connection = ctx.container.get(WebSocketConnectionProvider);
        return connection.createProxy<EnvVarService>(envVarServicePath);
    }).inSingletonScope();
});
