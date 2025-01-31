import { AbstractViewContribution } from '@theia/core/lib/browser';
import { injectable } from '@theia/core/shared/inversify';
import { ApiDockWidget } from './api-dock-widget';
import { Command, CommandRegistry, MenuModelRegistry, CommandContribution, MenuContribution } from '@theia/core/lib/common';

export const ApiDockCommand: Command = {
    id: 'api-dock.toggle',
    label: 'Toggle API Explorer'
};

@injectable()
export class ApiDockContribution extends AbstractViewContribution<ApiDockWidget> implements CommandContribution, MenuContribution {
    constructor() {
        super({
            widgetId: ApiDockWidget.ID,
            widgetName: ApiDockWidget.LABEL,
            defaultWidgetOptions: { area: 'left' },
            toggleCommandId: ApiDockCommand.id
        });
    }

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(ApiDockCommand, {
            execute: () => this.openView()
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        super.registerMenus(menus);
    }
}
