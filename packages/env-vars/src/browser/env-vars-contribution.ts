import { Command, MenuModelRegistry, CommandRegistry } from '@theia/core/lib/common';
import { AbstractViewContribution, CommonMenus } from '@theia/core/lib/browser';
import { injectable } from '@theia/core/shared/inversify';
import { EnvVarManagerWidget } from './env-vars-widget';

export const EnvVarsCommand: Command = {
    id: 'env-vars:open',
    category: 'View',
    label: 'Environment Variables'
};

@injectable()
export class EnvVarsCommandContribution extends AbstractViewContribution<EnvVarManagerWidget> {
    constructor() {
        super({
            widgetId: EnvVarManagerWidget.ID,
            widgetName: EnvVarManagerWidget.LABEL,
            defaultWidgetOptions: { area: 'left' },
            toggleCommandId: EnvVarsCommand.id
        });
    }

    async registerCommands(registry: CommandRegistry): Promise<void> {
        super.registerCommands(registry);
    }

    registerMenus(menus: MenuModelRegistry): void {
        super.registerMenus(menus);
        menus.registerMenuAction(CommonMenus.VIEW_PRIMARY, {
            commandId: EnvVarsCommand.id,
            label: 'Environment Variables'
        });
    }
}
