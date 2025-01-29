// src/browser/env-vars-widget.tsx

import * as React from 'react';
import { injectable, postConstruct, inject } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MessageService } from '@theia/core';
import { Message } from '@theia/core/lib/browser';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { EnvVarService } from '../common/env-var-service';

interface EnvVariable {
    id: string;
    key: string;
    value: string;
}

@injectable()
export class EnvVarManagerWidget extends ReactWidget {
    static readonly ID = 'env-var-manager:widget';
    static readonly LABEL = 'Environment Variables';

    @inject(MessageService)
    protected readonly messageService!: MessageService;

    @inject(WorkspaceService)
    protected readonly workspaceService!: WorkspaceService;

    @inject(EnvVarService)
    protected readonly envVarService!: EnvVarService;

    private envVars: EnvVariable[] = [];

    constructor() {
        super();
    }

    @postConstruct()
    protected init(): void {
        this.doInit();
    }

    protected async doInit(): Promise<void> {
        this.id = EnvVarManagerWidget.ID;
        this.title.label = EnvVarManagerWidget.LABEL;
        this.title.caption = EnvVarManagerWidget.LABEL;
        this.title.closable = true;
        this.title.iconClass = 'fa fa-key';
        this.update();
    }

    protected onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
    }

    private addNewVariable = () => {
        const newVar: EnvVariable = {
            id: `env-${Date.now()}`,
            key: '',
            value: ''
        };
        this.envVars = [...this.envVars, newVar];
        this.update();
    };

    private updateVariable = (id: string, field: 'key' | 'value', newValue: string) => {
        this.envVars = this.envVars.map(variable =>
            variable.id === id ? { ...variable, [field]: newValue } : variable
        );
        this.update();
    };

    private deleteVariable = (id: string) => {
        this.envVars = this.envVars.filter(variable => variable.id !== id);
        this.update();
    };

    private saveVariables = async () => {
        try {
            const validVars = this.envVars.filter(v => v.key && v.value);
            if (validVars.length === 0) {
                this.messageService.warn('No valid environment variables to save.');
                return;
            }

            const rootUri = this.workspaceService.tryGetRoots()[0]?.resource;
            if (!rootUri) {
                this.messageService.error('No workspace root found. Please open a workspace first.');
                return;
            }

            const envContent = validVars
                .map(v => `${v.key}=${v.value}`)
                .join('\n');

            await this.envVarService.writeEnvFile(envContent, rootUri.toString());
            this.messageService.info('Environment variables saved successfully to .env file!');
        } catch (error) {
            console.error('Error saving environment variables:', error);
            this.messageService.error('Failed to save environment variables. Please try again.');
        }
    };

    render(): React.ReactElement {
        const containerStyle: React.CSSProperties = {
            padding: '20px',
            height: '100%',
            overflow: 'auto',
            backgroundColor: 'var(--theia-editor-background)',
            color: 'var(--theia-foreground)'
        };

        const headerStyle: React.CSSProperties = {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            flexWrap: 'wrap',
            padding: '20px',
            backgroundColor: 'var(--theia-editorWidget-background)',
            borderRadius: '6px',
            marginBottom: '20px',
            boxShadow: '0 2px 4px var(--theia-widget-shadow)'
        };

        const headerContentStyle: React.CSSProperties = {
            flex: '1 1 300px'
        };

        const titleStyle: React.CSSProperties = {
            margin: 0,
            fontSize: '24px',
            color: 'var(--theia-foreground)',
            fontWeight: 'normal'
        };

        const subtitleStyle: React.CSSProperties = {
            margin: '5px 0 0',
            fontSize: '14px',
            color: 'var(--theia-descriptionForeground)'
        };

        const buttonStyle: React.CSSProperties = {
            padding: '8px 16px',
            backgroundColor: 'var(--theia-button-background)',
            color: 'var(--theia-button-foreground)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
        };

        const contentStyle: React.CSSProperties = {
            backgroundColor: 'var(--theia-editorWidget-background)',
            padding: '20px',
            borderRadius: '6px',
            boxShadow: '0 2px 4px var(--theia-widget-shadow)'
        };

        const variableRowStyle: React.CSSProperties = {
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: 'var(--theia-editor-background)',
            borderRadius: '4px',
            marginBottom: '12px',
            flexWrap: 'wrap'
        };

        const inputStyle: React.CSSProperties = {
            flex: '1 1 200px',
            padding: '8px 12px',
            backgroundColor: 'var(--theia-input-background)',
            color: 'var(--theia-input-foreground)',
            border: '1px solid var(--theia-input-border)',
            borderRadius: '4px',
            fontSize: '14px',
            minWidth: 0
        };

        const deleteButtonStyle: React.CSSProperties = {
            padding: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--theia-errorForeground)',
            borderRadius: '4px',
            opacity: 0.7
        };

        const emptyStateStyle: React.CSSProperties = {
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--theia-descriptionForeground)'
        };

        const saveButtonStyle: React.CSSProperties = {
            ...buttonStyle,
            backgroundColor: 'var(--theia-successBackground)',
            marginTop: '20px'
        };

        return (
            <div style={containerStyle}>
                <div style={headerStyle}>
                    <div style={headerContentStyle}>
                        <h1 style={titleStyle}>Environment Variable Manager</h1>
                        <p style={subtitleStyle}>Manage your API keys and environment variables securely</p>
                    </div>
                    <button style={buttonStyle} onClick={this.addNewVariable}>
                        <span>Add Variable</span>
                        <span>+</span>
                    </button>
                </div>

                <div style={contentStyle}>
                    <div>
                        {this.envVars.map(variable => (
                            <div key={variable.id} style={variableRowStyle}>
                                <input
                                    type="text"
                                    value={variable.key}
                                    onChange={(e) => this.updateVariable(variable.id, 'key', e.target.value)}
                                    placeholder="Variable Name"
                                    style={inputStyle}
                                />
                                <input
                                    type="password"
                                    value={variable.value}
                                    onChange={(e) => this.updateVariable(variable.id, 'value', e.target.value)}
                                    placeholder="Variable Value"
                                    style={inputStyle}
                                />
                                <button
                                    onClick={() => this.deleteVariable(variable.id)}
                                    style={deleteButtonStyle}
                                    title="Delete Variable"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>

                    {this.envVars.length === 0 && (
                        <div style={emptyStateStyle}>
                            <h3 style={{ ...titleStyle, fontSize: '18px', marginBottom: '8px' }}>No variables</h3>
                            <p style={subtitleStyle}>Get started by adding a new environment variable.</p>
                        </div>
                    )}

                    {this.envVars.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={this.saveVariables} style={saveButtonStyle}>
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
