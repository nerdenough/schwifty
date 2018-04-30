'use strict';
import * as vscode from 'vscode';
import { format } from './swiftFormat';

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
