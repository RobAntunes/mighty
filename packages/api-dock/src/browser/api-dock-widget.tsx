import { inject } from "@theia/core/shared/inversify";
import { MessageService } from "@theia/core";
import {
    ActionInfo,
    ApiDockAIService,
    ApiDockBackendService,
    AppInfo,
    TriggerInfo,
} from "../common/protocol";
import { BaseWidget } from "@theia/core/lib/browser";

export class ApiDockWidget extends BaseWidget {
    static readonly ID = "api-dock-widget";
    static readonly LABEL = "API Explorer";

    private apps: AppInfo[] = [];
    private selectedApp?: AppInfo;
    private actions: ActionInfo[] = [];
    private triggers: TriggerInfo[] = [];
    private searchTimeout?: NodeJS.Timeout;

    constructor(
        @inject(ApiDockBackendService) private readonly apiService:
            ApiDockBackendService,
        @inject(ApiDockAIService) private readonly aiService: ApiDockAIService,
        @inject(MessageService) private readonly messageService: MessageService,
    ) {
        super();
        this.id = ApiDockWidget.ID;
        this.title.label = ApiDockWidget.LABEL;
        this.title.caption = ApiDockWidget.LABEL;
        this.title.closable = true;
        this.title.iconClass = "fa fa-plug";

        this.node.classList.add("api-dock-widget");
        this.initializeView();
    }

    protected async initializeView(): Promise<void> {
        try {
            const apps = await this.apiService.getAvailableApps();
            this.apps = apps;
            this.update();
        } catch (error) {
            this.handleError(error as Error);
        }
    }

    protected onUpdateRequest(): void {
        this.render();
    }

    private render(): void {
        // Clear existing content
        while (this.node.firstChild) {
            this.node.removeChild(this.node.firstChild);
        }

        // Create main container
        const container = document.createElement("div");
        container.className = "api-dock-container";

        // Add search section
        const searchSection = this.createSearchSection();
        container.appendChild(searchSection);

        // Add apps list
        const appsList = this.createAppsList();
        container.appendChild(appsList);

        // Add details section if app is selected
        if (this.selectedApp) {
            const detailsSection = this.createDetailsSection();
            container.appendChild(detailsSection);
        }

        // Add AI assistant section
        const aiSection = this.createAISection();
        container.appendChild(aiSection);

        // Add container to widget
        this.node.appendChild(container);
    }

    private createSearchSection(): HTMLElement {
        const section = document.createElement("div");
        section.className = "search-section";

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Search APIs or ask for suggestions...";
        input.className = "search-input";
        input.addEventListener("input", this.handleSearch.bind(this));

        section.appendChild(input);
        return section;
    }

    private createAppsList(): HTMLElement {
        const list = document.createElement("div");
        list.className = "apps-list";

        this.apps.forEach((app) => {
            const appItem = document.createElement("div");
            appItem.className = `app-item ${
                this.selectedApp?.key === app.key ? "selected" : ""
            }`;
            appItem.addEventListener("click", () => this.handleAppSelect(app));

            const logo = document.createElement("img");
            logo.src = app.logo || "/api/placeholder/32/32";
            logo.alt = app.name;
            logo.className = "app-logo";

            const info = document.createElement("div");
            info.className = "app-info";
            info.innerHTML = `
                <div class="app-name">${app.name}</div>
                <div class="app-description">${app.description}</div>
            `;

            appItem.appendChild(logo);
            appItem.appendChild(info);
            list.appendChild(appItem);
        });

        return list;
    }

    private createDetailsSection(): HTMLElement {
        const section = document.createElement("div");
        section.className = "details-section";

        // Add actions section
        const actionsSection = document.createElement("div");
        actionsSection.className = "actions-section";
        actionsSection.innerHTML = "<h3>Actions</h3>";

        this.actions.forEach((action) => {
            const actionItem = document.createElement("div");
            actionItem.className = "action-item";
            actionItem.innerHTML = `
                <div class="action-info">
                    <div class="action-name">${action.displayName}</div>
                    <div class="action-description">${action.description}</div>
                </div>
            `;

            const executeButton = document.createElement("button");
            executeButton.className = "action-execute";
            executeButton.innerHTML = '<i class="fa fa-play-circle"></i>';
            executeButton.addEventListener(
                "click",
                () => this.handleActionExecute(action),
            );

            actionItem.appendChild(executeButton);
            actionsSection.appendChild(actionItem);
        });

        section.appendChild(actionsSection);

        // Add triggers section
        const triggersSection = document.createElement("div");
        triggersSection.className = "triggers-section";
        triggersSection.innerHTML = "<h3>Triggers</h3>";

        this.triggers.forEach((trigger) => {
            const triggerItem = document.createElement("div");
            triggerItem.className = "trigger-item";
            triggerItem.innerHTML = `
                <div class="trigger-info">
                    <div class="trigger-name">${trigger.display_name}</div>
                    <div class="trigger-description">${trigger.description}</div>
                </div>
            `;

            const toggleButton = document.createElement("button");
            toggleButton.className = `trigger-toggle ${
                trigger.enabled ? "enabled" : ""
            }`;
            toggleButton.innerHTML = '<i class="fa fa-bolt"></i>';
            toggleButton.addEventListener(
                "click",
                () => this.handleTriggerToggle(trigger),
            );

            triggerItem.appendChild(toggleButton);
            triggersSection.appendChild(triggerItem);
        });

        section.appendChild(triggersSection);
        return section;
    }

    private createAISection(): HTMLElement {
        const section = document.createElement("div");
        section.className = "ai-section";

        const header = document.createElement("div");
        header.className = "ai-header";
        header.innerHTML =
            '<i class="fa fa-code"></i><span>AI Assistant</span>';

        const content = document.createElement("div");
        content.className = "ai-content";

        if (this.selectedApp) {
            const explainButton = document.createElement("button");
            explainButton.textContent = "Explain this API";
            explainButton.addEventListener("click", () =>
                this.handleAIAction(
                    async () => {
                        this.aiService.explainApi(this.selectedApp!.key);
                    },
                ));

            const exampleButton = document.createElement("button");
            exampleButton.textContent = "Generate example";
            exampleButton.addEventListener("click", () =>
                this.handleAIAction(
                    async () => {
                        this.aiService.generateActionExample(
                            this.selectedApp!.key,
                            "",
                        );
                    },
                ));

            content.appendChild(explainButton);
            content.appendChild(exampleButton);
        } else {
            const message = document.createElement("div");
            message.className = "ai-message";
            message.textContent = "Select an API to get AI-powered assistance";
            content.appendChild(message);
        }

        section.appendChild(header);
        section.appendChild(content);
        return section;
    }

    private handleSearch = (event: Event): void => {
        const query = (event.target as HTMLInputElement).value.trim();

        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        if (query.length < 3) {
            this.initializeView();
            return;
        }

        this.searchTimeout = setTimeout(async () => {
            try {
                const suggestions = await this.aiService.suggestApis(query);
                this.apps = suggestions;
                this.update();
            } catch (error) {
                this.handleError(error as Error);
            }
        }, 300);
    };

    private handleAppSelect = async (app: AppInfo): Promise<void> => {
        try {
            this.selectedApp = app;

            const [actions, triggers] = await Promise.all([
                this.apiService.getActions(app.key),
                this.apiService.getTriggers(app.key),
            ]);

            this.actions = actions;
            this.triggers = triggers;
            this.update();
        } catch (error) {
            this.handleError(error as Error);
        }
    };

    private handleActionExecute = async (action: ActionInfo): Promise<void> => {
        try {
            if (!this.selectedApp) return;

            // const result = await this.apiService.executeAction(
            //     this.selectedApp.key,
            //     action.name,
            //     {},
            // );

            this.messageService.info(
                `Action ${action.displayName} executed successfully`,
            );
        } catch (error) {
            this.handleError(error as Error);
        }
    };

    private handleTriggerToggle = async (
        trigger: TriggerInfo,
    ): Promise<void> => {
        try {
            if (!this.selectedApp) return;

            if (trigger.enabled) {
                await this.apiService.disableTrigger(
                    this.selectedApp.key,
                    trigger.name,
                );
            } else {
                await this.apiService.enableTrigger(
                    this.selectedApp.key,
                    trigger.name,
                    {},
                );
            }

            const updatedTriggers = await this.apiService.getTriggers(
                this.selectedApp.key,
            );
            this.triggers = updatedTriggers;
            this.update();

            this.messageService.info(
                `Trigger ${trigger.display_name} ${
                    trigger.enabled ? "disabled" : "enabled"
                } successfully`,
            );
        } catch (error) {
            this.handleError(error as Error);
        }
    };

    private async handleAIAction(action: () => Promise<void>): Promise<void> {
        try {
            await action();
        } catch (error) {
            this.handleError(error as Error);
        }
    }

    private handleError = (error: Error): void => {
        this.messageService.error(
            `An error occurred: ${error.message}`,
            { timeout: 5000 },
        );
    };
}
