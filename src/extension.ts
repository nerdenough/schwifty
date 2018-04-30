'use strict';
import * as vscode from 'vscode';
import * as cp from 'child_process';

// Formats a specified file
function format (fileName: String) {
    cp.execSync(`sourcekitten format --file ${fileName}`);
}

export function activate(context: vscode.ExtensionContext) {
    const formatter = vscode.languages.registerDocumentFormattingEditProvider({ language: 'swift' }, {
        provideDocumentFormattingEdits(document: vscode.TextDocument): any {
            format(document.fileName);
        }
    })

    context.subscriptions.push(formatter)
}

export function deactivate() {
}