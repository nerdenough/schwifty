'use strict';
import * as vscode from 'vscode';

export function getConfig(key: string): any {
    return vscode.workspace.getConfiguration('schwifty').get(key);
}
