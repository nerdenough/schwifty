'use strict';
import * as vscode from 'vscode';
import { SWIFT_MODE } from './swiftMode';

export const outputChannel = vscode.window.createOutputChannel('Swift');
export const diagnosticsStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

let statusBarEntry: vscode.StatusBarItem;

export function showHideStatus() {
    if (!statusBarEntry) {
        return;
    }

    if (!vscode.window.activeTextEditor) {
        statusBarEntry.hide();
        return;
    }

    if (vscode.languages.match(SWIFT_MODE, vscode.window.activeTextEditor.document)) {
        statusBarEntry.show();
        return;
    }

    statusBarEntry.hide();
}

export function hideSwiftStatus() {
    if (statusBarEntry) {
        statusBarEntry.hide();
    }
}

export function showSwiftStatus(message: string, command: string, tooltip?: string) {
    statusBarEntry = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, Number.MIN_VALUE);
    statusBarEntry.text = message;
    statusBarEntry.command = command;
    statusBarEntry.color = 'yellow';
    statusBarEntry.tooltip = tooltip;
    statusBarEntry.show();
}
