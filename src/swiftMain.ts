'use strict';
import * as vscode from 'vscode';
import { SwiftCompletionItemProvider } from './swiftComplete';
import { autoFix } from './swiftFix';
import { SwiftDocumentFormattingEditProvider } from './swiftFormat';
import { runLint, lint } from './swiftLint';
import { SWIFT_MODE } from './swiftMode';
import { handleDiagnosticErrors, ICheckResult } from './util';
import { check } from './swiftCheck';

export let errorDiagnosticCollection: vscode.DiagnosticCollection;
export let warningDiagnosticCollection: vscode.DiagnosticCollection;

export function activate(ctx: vscode.ExtensionContext) {
    ctx.subscriptions.push(vscode.languages.registerCompletionItemProvider(SWIFT_MODE, new SwiftCompletionItemProvider(), '.'));
    ctx.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(SWIFT_MODE, new SwiftDocumentFormattingEditProvider()));
    ctx.subscriptions.push(vscode.commands.registerCommand('swift.lint.file', runLint));
    ctx.subscriptions.push(vscode.commands.registerCommand('swift.lint.autoFix', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const fileName = editor.document.fileName;
        autoFix(fileName, true).catch(err => {
            console.error(err);
            vscode.window.showErrorMessage('Swift: Error auto-fixing files with SwiftLint', err.message);
        });
    }));

    errorDiagnosticCollection = vscode.languages.createDiagnosticCollection('swift-error');
    ctx.subscriptions.push(errorDiagnosticCollection);
    warningDiagnosticCollection = vscode.languages.createDiagnosticCollection('swift-warning');
    ctx.subscriptions.push(warningDiagnosticCollection);

    ctx.subscriptions.push(vscode.workspace.onDidSaveTextDocument(document => {
        runBuilds(document, vscode.workspace.getConfiguration());
    }));
}

async function runBuilds(document: vscode.TextDocument, swiftConfig: vscode.WorkspaceConfiguration) {
    if (document.languageId !== 'swift') {
        return;
    }

    errorDiagnosticCollection.clear();
    warningDiagnosticCollection.clear();

    const fileName = document.fileName;

    if (swiftConfig.get('swift.autoFixOnSave')) {
        await autoFix(fileName, true);
    }

    const lintResults: ICheckResult[] = await lint(document);
    const checkResults: ICheckResult[] = await check(fileName, swiftConfig);
    handleDiagnosticErrors(document, [...lintResults, ...checkResults]);
}
