import { AbstractViewContribution } from '@theia/core/lib/browser';
import { ApiDockWidget } from './api-dock-widget';
import { Command, CommandRegistry, MenuModelRegistry } from '@theia/core';

export const ApiDockCommand: Command = {
    id: 'api-dock:toggle',
    label: 'Toggle API Explorer'
};

export class ApiDockContribution extends AbstractViewContribution<ApiDockWidget> {
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
            execute: () => super.openView()
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        super.registerMenus(menus);
    }
}