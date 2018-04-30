'use strict';
import * as vscode from 'vscode';
import { spawn } from 'child_process';

// Formats a specified file
function format(sourceKittenPath: any, fileName: string) {
    spawn(sourceKittenPath, ['format', '--file', fileName])
        .on('data', (data: any) => console.log(data))
        .on('error', (err: any) => {
            console.error(err);
            vscode.window.showErrorMessage('Schwifty: Error formatting document with SourceKitten', err.message);
        });
}

function getConfig(key: string) {
    return vscode.workspace.getConfiguration('schwifty').get(key)
}

export function activate(context: vscode.ExtensionContext) {
    const formatter = vscode.languages.registerDocumentFormattingEditProvider({ language: 'swift' }, {
        provideDocumentFormattingEdits(document: vscode.TextDocument): any {
            format(getConfig('sourceKittenPath'), document.fileName);
        }
    })

    context.subscriptions.push(formatter)
}

export function deactivate() {
}