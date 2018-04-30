'use strict';
import * as vscode from 'vscode';
import { spawn } from 'child_process';

// Formats a specified file
function format(sourceKittenPath: string, fileName: string) {
    spawn(sourceKittenPath, ['format', '--file', fileName])
        .on('data', (data: any) => console.log(data))
        .on('error', (err: any) => {
            console.error(err);
            vscode.window.showErrorMessage('Schwifty: Error formatting document with SourceKitten', err.message);
        });
}

export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('schwifty');
    const sourceKittenPath: string = config.get('sourceKittenPath') || 'sourcekitten';

    const formatter = vscode.languages.registerDocumentFormattingEditProvider({ language: 'swift' }, {
        provideDocumentFormattingEdits(document: vscode.TextDocument): any {
            format(sourceKittenPath, document.fileName);
        }
    })

    context.subscriptions.push(formatter)
}

export function deactivate() {
}