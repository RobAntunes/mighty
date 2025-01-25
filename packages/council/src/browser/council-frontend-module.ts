import { ContainerModule } from '@theia/core/shared/inversify';
import { CouncilWidget } from './council-widget';
import { CouncilContribution } from './council-contribution';
import { bindViewContribution, FrontendApplicationContribution, WidgetFactory } from '@theia/core/lib/browser';

import '../../src/browser/style/index.css';

export default new ContainerModule(bind => {
    bindViewContribution(bind, CouncilContribution);
    bind(FrontendApplicationContribution).toService(CouncilContribution);
    bind(CouncilWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: CouncilWidget.ID,
        createWidget: () => ctx.container.get<CouncilWidget>(CouncilWidget)
    })).inSingletonScope();
});
