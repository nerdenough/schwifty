'use strict';
import * as vscode from 'vscode';
import { SwiftCompletionItemProvider } from './swiftComplete';
import { SwiftDocumentFormattingEditProvider } from './swiftFormat';
import { lintCode } from './swiftLint';
import { SWIFT_MODE } from './swiftMode';

export let errorDiagnosticCollection: vscode.DiagnosticCollection;
export let warningDiagnosticCollection: vscode.DiagnosticCollection;

export function activate(ctx: vscode.ExtensionContext) {
    ctx.subscriptions.push(vscode.languages.registerCompletionItemProvider(SWIFT_MODE, new SwiftCompletionItemProvider(), '.'));
    ctx.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(SWIFT_MODE, new SwiftDocumentFormattingEditProvider()));
    ctx.subscriptions.push(vscode.commands.registerCommand('swift.lint.package', lintCode));

    errorDiagnosticCollection = vscode.languages.createDiagnosticCollection('swift-error');
    ctx.subscriptions.push(errorDiagnosticCollection);
    warningDiagnosticCollection = vscode.languages.createDiagnosticCollection('swift-warning');
    ctx.subscriptions.push(warningDiagnosticCollection);
}

export function deactivate() {
}
