'use strict';
import * as vscode from 'vscode';
import { SwiftCompletionItemProvider } from './swiftComplete';
import { SwiftDocumentFormattingEditProvider } from './swiftFormat';
import { lintCode } from './swiftLint';
import { autoFix } from './swiftFix';
import { SWIFT_MODE } from './swiftMode';
import { getConfig } from './util';

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
        if (document.languageId !== 'swift' || !getConfig('autoFixOnSave')) {
            return;
        }

        errorDiagnosticCollection.clear();
        warningDiagnosticCollection.clear();

        const fileName = document.fileName;

        autoFix(fileName);
        lintCode();
    }));
}

export function deactivate() {
}
