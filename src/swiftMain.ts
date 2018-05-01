'use strict';
import * as vscode from 'vscode';
import { SwiftCompletionItemProvider } from './swiftComplete';
import { SwiftDocumentFormattingEditProvider } from './swiftFormat';
import { lintCode } from './swiftLint';

export function activate(ctx: vscode.ExtensionContext) {
    const swiftMode = { language: 'swift', scheme: 'file' };
    ctx.subscriptions.push(vscode.languages.registerCompletionItemProvider(swiftMode, new SwiftCompletionItemProvider(), '.'));
    ctx.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(swiftMode, new SwiftDocumentFormattingEditProvider()));
    ctx.subscriptions.push(vscode.commands.registerCommand('swift.lint.package', lintCode));
}

export function deactivate() {
}
