'use strict';
import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { getConfig } from './util';

export function autoFix(fileName: string) {
    return new Promise((resolve, reject) => {
        spawn(getConfig('swiftLintPath'), ['autocorrect', '--path', fileName])
            .on('exit', (data: any) => resolve())
            .on('error', (err: any) => {
                console.error(err);
                vscode.window.showErrorMessage('Swift: Error auto-fixing files with SwiftLint', err.message);
                reject(err);
            });
    });
}
