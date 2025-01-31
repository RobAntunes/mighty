import { BaseWidget, Message } from "@theia/core/lib/browser";
import { inject } from "@theia/core/shared/inversify";
import { MessageService } from "@theia/core";
import React, { ReactElement, useState } from 'react';
import { Grid, List, ChevronRight, Command, Zap, PlayCircle } from 'lucide-react';
import {
    ActionInfo,
    ApiDockAIService,
    ApiDockBackendService,
    AppInfo,
    TriggerInfo,
} from "../common/protocol";
import { CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';

interface StyleMap {
    [key: string]: CSSProperties;
}

export const styles: StyleMap = {
    container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--theia-editor-background)',
        color: 'var(--theia-foreground)'
    },
    header: {
        padding: '8px 16px',
        borderBottom: '1px solid var(--theia-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        margin: 0,
        fontSize: '18px',
        color: 'var(--theia-titleBar-activeForeground)'
    },
    searchContainer: {
        padding: '16px',
        borderBottom: '1px solid var(--theia-border)'
    },
    searchInput: {
        width: '80%',
        padding: '12px',
        borderRadius: '4px',
        border: '1px solid var(--theia-input-border)',
        backgroundColor: 'var(--theia-input-background)',
        color: 'var(--theia-input-foreground)',
        outline: 'none',
        fontSize: '14px',
        margin: "0 auto"
    },
    gridContainer: {
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
        overflowY: 'auto'
    },
    listContainer: {
        overflowY: 'auto'
    },
    card: {
        padding: '16px',
        borderRadius: '4px',
        border: '1px solid var(--theia-border)',
        backgroundColor: 'var(--theia-editor-background)',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    cardSelected: {
        borderColor: 'var(--theia-focusBorder)',
        backgroundColor: 'var(--theia-list-activeSelectionBackground)'
    },
    listItem: {
        padding: '16px',
        borderBottom: '1px solid var(--theia-border)',
        borderLeft: '4px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    listItemSelected: {
        borderLeftColor: 'var(--theia-focusBorder)',
        backgroundColor: 'var(--theia-list-activeSelectionBackground)'
    },
    iconButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        cursor: 'pointer',
        border: 'none',
        background: 'transparent',
        color: 'var(--theia-icon-foreground)'
    },
    iconButtonActive: {
        backgroundColor: 'var(--theia-toolbar-activeBackground)',
        color: 'var(--theia-activityBar-activeBorder)'
    },
    section: {
        borderBottom: '1px solid var(--theia-border)'
    },
    sectionHeader: {
        margin: 0,
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--theia-descriptionForeground)',
        backgroundColor: 'var(--theia-editor-background)'
    },
    item: {
        padding: '16px',
        borderBottom: '1px solid var(--theia-border)',
        transition: 'background-color 0.2s'
    },
    itemTitle: {
        margin: 0,
        fontSize: '16px',
        color: 'var(--theia-foreground)'
    },
    itemDescription: {
        margin: '4px 0 0 0',
        fontSize: '14px',
        color: 'var(--theia-descriptionForeground)'
    },
    content: {
        flex: 1,
        overflow: 'hidden'
    },
    details: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    },
    detailsHeader: {
        padding: '16px',
        borderBottom: '1px solid var(--theia-border)',
        backgroundColor: 'var(--theia-editor-background)'
    },
    detailsApp: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    detailsLogo: {
        width: '48px',
        height: '48px',
        borderRadius: '8px'
    },
    detailsInfo: {
        flex: 1
    },
    detailsTitle: {
        margin: '0 0 4px 0',
        fontSize: '18px',
        color: 'var(--theia-foreground)'
    },
    detailsDescription: {
        margin: 0,
        fontSize: '14px',
        color: 'var(--theia-descriptionForeground)'
    },
    detailsContent: {
        flex: 1,
        overflowY: 'auto'
    },
    apps: {
        height: '100%',
        overflowY: 'auto'
    },
    cardContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    cardLogo: {
        width: '48px',
        height: '48px',
        borderRadius: '8px'
    },
    cardInfo: {
        flex: 1
    },
    itemHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    itemIcon: {
        color: 'var(--theia-descriptionForeground)'
    },
    viewToggle: {
        display: 'flex',
        gap: '8px'
    }
};

// Component Props Interfaces
interface ViewToggleProps {
    isGridView: boolean;
    onToggle: (isGrid: boolean) => void;
}

interface SearchBarProps {
    onSearch: (query: string) => void;
}

interface AppCardProps {
    app: AppInfo;
    isSelected: boolean;
    onClick: () => void;
}

interface AppListProps {
    app: AppInfo;
    isSelected: boolean;
    onClick: () => void;
}

interface ActionPanelProps {
    action: ActionInfo;
    onExecute: (action: ActionInfo) => void;
}

interface TriggerPanelProps {
    trigger: TriggerInfo;
    onToggle: (trigger: TriggerInfo) => void;
}

interface ApiDockContentProps {
    apps: AppInfo[];
    selectedApp?: AppInfo;
    actions: ActionInfo[];
    triggers: TriggerInfo[];
    onAppSelect: (app: AppInfo) => Promise<void>;
    onSearch: (query: string) => void;
    onActionExecute: (action: ActionInfo) => Promise<void>;
    onTriggerToggle: (trigger: TriggerInfo) => Promise<void>;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ isGridView, onToggle }): ReactElement => (
    <div style={styles.viewToggle}>
        <button
            onClick={() => onToggle(true)}
            style={{
                ...styles.iconButton,
                ...(isGridView ? styles.iconButtonActive : {})
            }}
            aria-label="Grid view"
        >
            <Grid size={20} />
        </button>
        <button
            onClick={() => onToggle(false)}
            style={{
                ...styles.iconButton,
                ...(!isGridView ? styles.iconButtonActive : {})
            }}
            aria-label="List view"
        >
            <List size={20} />
        </button>
    </div>
);

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }): ReactElement => (
    <div style={styles.searchContainer}>
        <input
            type="text"
            placeholder="Search APIs or ask for suggestions..."
            style={styles.searchInput}
            onChange={(e) => onSearch(e.target.value)}
        />
    </div>
);

const DEFAULT_ICON = '/api/placeholder/48/48';

const AppCard: React.FC<AppCardProps> = ({ app, isSelected, onClick }): ReactElement => {
    const [imgSrc, setImgSrc] = useState(app.logo || DEFAULT_ICON);

    const handleImageError = () => {
        setImgSrc(DEFAULT_ICON);
    };
    return (<div
        style={{
            ...styles.card,
            ...(isSelected ? styles.cardSelected : {})
        }}
        onClick={onClick}
    >
        <div style={styles.cardContent}>
            <img
                src={imgSrc}
                alt={app.name}
                style={styles.cardLogo}
                onError={handleImageError}
            />
            <div style={styles.cardInfo}>
                <h3 style={styles.itemTitle}>{app.name}</h3>
                <p style={styles.itemDescription}>{app.description}</p>
            </div>
            {isSelected && <ChevronRight style={{ color: 'var(--theia-focusBorder)' }} />}
        </div>
    </div>
    );
}

const AppList: React.FC<AppListProps> = ({ app, isSelected, onClick }): ReactElement => {
    const [imgSrc, setImgSrc] = useState(app.logo || DEFAULT_ICON);

    const handleImageError = () => {
        setImgSrc(DEFAULT_ICON);
    };
    return (<div
        style={{
            ...styles.listItem,
            ...(isSelected ? styles.listItemSelected : {})
        }}
        onClick={onClick}
    >
        <div style={styles.cardContent}>
            <img
                src={imgSrc}
                alt={app.name}
                style={styles.cardLogo}
                onError={handleImageError}
            />
            <div style={styles.cardInfo}>
                <h3 style={styles.itemTitle}>{app.name}</h3>
                <p style={styles.itemDescription}>{app.description}</p>
            </div>
            {isSelected && <ChevronRight style={{ color: 'var(--theia-focusBorder)' }} />}
        </div>
    </div>)
}

const ActionPanel: React.FC<ActionPanelProps> = ({ action, onExecute }): ReactElement => (
    <div style={styles.item}>
        <div style={styles.cardContent}>
            <div style={styles.cardInfo}>
                <div style={styles.itemHeader}>
                    <Command size={16} style={styles.itemIcon} />
                    <h3 style={styles.itemTitle}>{action.displayName}</h3>
                </div>
                <p style={styles.itemDescription}>{action.description}</p>
            </div>
            <button
                onClick={() => onExecute(action)}
                style={styles.iconButton}
                aria-label="Execute action"
            >
                <PlayCircle size={20} />
            </button>
        </div>
    </div>
);

const TriggerPanel: React.FC<TriggerPanelProps> = ({ trigger, onToggle }): ReactElement => (
    <div style={styles.item}>
        <div style={styles.cardContent}>
            <div style={styles.cardInfo}>
                <div style={styles.itemHeader}>
                    <Zap size={16} style={styles.itemIcon} />
                    <h3 style={styles.itemTitle}>{trigger.display_name}</h3>
                </div>
                <p style={styles.itemDescription}>{trigger.description}</p>
            </div>
            <button
                onClick={() => onToggle(trigger)}
                style={{
                    ...styles.iconButton,
                    color: trigger.enabled ? 'var(--theia-successBackground)' : 'var(--theia-icon-foreground)'
                }}
                aria-label={`${trigger.enabled ? 'Disable' : 'Enable'} trigger`}
            >
                <Zap size={20} />
            </button>
        </div>
    </div>
);

const ApiDockContent: React.FC<ApiDockContentProps> = ({
    apps,
    selectedApp,
    actions,
    triggers,
    onAppSelect,
    onSearch,
    onActionExecute,
    onTriggerToggle
}): ReactElement => {
    const [isGridView, setIsGridView] = React.useState<boolean>(true);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>API Explorer</h2>
                <ViewToggle isGridView={isGridView} onToggle={setIsGridView} />
            </div>
            <SearchBar onSearch={onSearch} />

            <div style={styles.content}>
                {selectedApp ? (
                    <div style={styles.details}>
                        <div style={styles.detailsHeader}>
                            <div style={styles.detailsApp}>
                                <img
                                    src={selectedApp.logo || DEFAULT_ICON}
                                    alt={selectedApp.name}
                                    style={styles.detailsLogo}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = DEFAULT_ICON;
                                    }}
                                />
                                <div style={styles.detailsInfo}>
                                    <h2 style={styles.detailsTitle}>
                                        {selectedApp.name}
                                    </h2>
                                    <p style={styles.detailsDescription}>
                                        {selectedApp.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={styles.detailsContent}>
                            {actions.length > 0 && (
                                <div style={styles.section}>
                                    <h3 style={styles.sectionHeader}>
                                        Actions
                                    </h3>
                                    {actions.map(action => (
                                        <ActionPanel
                                            key={action.name}
                                            action={action}
                                            onExecute={onActionExecute}
                                        />
                                    ))}
                                </div>
                            )}

                            {triggers.length > 0 && (
                                <div style={styles.section}>
                                    <h3 style={styles.sectionHeader}>
                                        Triggers
                                    </h3>
                                    {triggers.map(trigger => (
                                        <TriggerPanel
                                            key={trigger.name}
                                            trigger={trigger}
                                            onToggle={onTriggerToggle}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={styles.apps}>
                        {isGridView ? (
                            <div style={styles.gridContainer}>
                                {apps.map((app) => (
                                    <AppCard
                                        key={app.key}
                                        app={app}
                                        isSelected={(selectedApp as AppInfo | undefined)?.key === app.key}
                                        onClick={() => onAppSelect(app)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div style={styles.listContainer}>
                                {apps.map(app => (
                                    <AppList
                                        key={app.key}
                                        app={app}
                                        isSelected={(selectedApp as AppInfo | undefined)?.key === app.key}
                                        onClick={() => onAppSelect(app)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export class ApiDockWidget extends BaseWidget {
    static readonly ID = "api-dock-widget";
    static readonly LABEL = "API Explorer";

    private apps: AppInfo[] = [];
    private selectedApp?: AppInfo;
    private actions: ActionInfo[] = [];
    private triggers: TriggerInfo[] = [];
    private searchTimeout?: NodeJS.Timeout;

    constructor(
        @inject(ApiDockBackendService) private readonly apiService: ApiDockBackendService,
        @inject(ApiDockAIService) private readonly aiService: ApiDockAIService,
        @inject(MessageService) private readonly messageService: MessageService,
    ) {
        super();
        this.id = ApiDockWidget.ID;
        this.title.label = ApiDockWidget.LABEL;
        this.title.caption = ApiDockWidget.LABEL;
        this.title.closable = true;
        this.title.iconClass = "fa fa-plug";
        this.node.style.height = '100%';
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

    private root: ReturnType<typeof createRoot> | null = null;

    protected onUpdateRequest(): void {
        if (!this.root) {
            this.root = createRoot(this.node);
        }

        this.root.render(
            <ApiDockContent
                apps={this.apps}
                selectedApp={this.selectedApp}
                actions={this.actions}
                triggers={this.triggers}
                onAppSelect={this.handleAppSelect}
                onSearch={this.handleSearch}
                onActionExecute={this.handleActionExecute}
                onTriggerToggle={this.handleTriggerToggle}
            />
        );
    }

    protected onAfterDetach(): void {
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
    }

    protected onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        const searchInput = this.node.querySelector('input') as HTMLInputElement;
        if (searchInput) {
            searchInput.focus();
        }
    }

    private handleSearch = (query: string): void => {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        if (query.length < 3) {
            void this.initializeView();
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
            console.log('Selecting app:', app);
            this.selectedApp = app;

            console.log('Fetching actions and triggers...');
            const [actions, triggers] = await Promise.all([
                this.apiService.getActions(app.key),
                this.apiService.getTriggers(app.key)
            ]);

            console.log('Received actions:', actions);
            console.log('Received triggers:', triggers);

            this.actions = actions;
            this.triggers = triggers;
            this.update();
        } catch (error) {
            this.handleError(error as Error);
        }
    };

    private handleActionExecute = async (action: ActionInfo): Promise<void> => {
        try {
            if (!this.selectedApp) {
                throw new Error('No app selected');
            }

            await this.apiService.executeAction(
                this.selectedApp.key,
                action.name,
                {}
            );

            this.messageService.info(
                `Action ${action.displayName} executed successfully`,
                { timeout: 3000 }
            );
        } catch (error) {
            this.handleError(error as Error);
        }
    };

    private handleTriggerToggle = async (trigger: TriggerInfo): Promise<void> => {
        try {
            if (!this.selectedApp) {
                throw new Error('No app selected');
            }

            if (trigger.enabled) {
                await this.apiService.disableTrigger(
                    this.selectedApp.key,
                    trigger.name
                );
            } else {
                await this.apiService.enableTrigger(
                    this.selectedApp.key,
                    trigger.name,
                    {}
                );
            }

            const updatedTriggers = await this.apiService.getTriggers(
                this.selectedApp.key
            );
            this.triggers = updatedTriggers;
            this.update();

            this.messageService.info(
                `Trigger ${trigger.display_name} ${trigger.enabled ? 'disabled' : 'enabled'} successfully`,
                { timeout: 3000 }
            );
        } catch (error) {
            this.handleError(error as Error);
        }
    };

    private handleError = (error: Error): void => {
        console.error('API Dock Error:', error);
        this.messageService.error(
            `An error occurred: ${error.message}`,
            { timeout: 5000 }
        );
    };

    storeState(): object {
        return {
            selectedAppKey: this.selectedApp?.key
        };
    }

    restoreState(oldState: object): void {
        const state = oldState as { selectedAppKey?: string };
        if (state.selectedAppKey && this.apps.length > 0) {
            const app = this.apps.find(a => a.key === state.selectedAppKey);
            if (app) {
                void this.handleAppSelect(app);
            }
        }
    }
}

export default ApiDockWidget;
