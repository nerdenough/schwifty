'use strict';
import * as vscode from 'vscode';
import { SwiftCompletionItemProvider } from './swiftComplete';
import { SwiftDocumentFormattingEditProvider } from './swiftFormat';
import { lintCode } from './swiftLint';
import { autoFix } from './swiftFix';
import { SWIFT_MODE } from './swiftMode';
import { getConfig, handleDiagnosticErrors } from './util';
import { check } from './swiftCheck';

export let errorDiagnosticCollection: vscode.DiagnosticCollection;
export let warningDiagnosticCollection: vscode.DiagnosticCollection;

export function activate(ctx: vscode.ExtensionContext) {
    ctx.subscriptions.push(vscode.languages.registerCompletionItemProvider(SWIFT_MODE, new SwiftCompletionItemProvider(), '.'));
    ctx.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(SWIFT_MODE, new SwiftDocumentFormattingEditProvider()));
    ctx.subscriptions.push(vscode.commands.registerCommand('swift.lint.file', lintCode));
    ctx.subscriptions.push(vscode.commands.registerCommand('swift.lint.autoFix', ()  => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const fileName = editor.document.fileName;
        autoFix(fileName);
    }));

    errorDiagnosticCollection = vscode.languages.createDiagnosticCollection('swift-error');
    ctx.subscriptions.push(errorDiagnosticCollection);
    warningDiagnosticCollection = vscode.languages.createDiagnosticCollection('swift-warning');
    ctx.subscriptions.push(warningDiagnosticCollection);

    ctx.subscriptions.push(vscode.workspace.onDidSaveTextDocument(document => {
        runBuilds(document, vscode.workspace.getConfiguration());
    }));
}

function runBuilds(document: vscode.TextDocument, swiftConfig: vscode.WorkspaceConfiguration) {
    if (document.languageId !== 'swift') {
        return;
    }

    errorDiagnosticCollection.clear();
    warningDiagnosticCollection.clear();

    const fileName = document.fileName;
    check(fileName, swiftConfig)
        .then(res => {
            console.log('RES', res);
            handleDiagnosticErrors(document, res);
            if (getConfig('autoFixOnSave')) {
                autoFix(fileName);
            }
            lintCode();
        });
}
