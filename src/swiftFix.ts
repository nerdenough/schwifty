'use strict';
import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { getConfig } from './util';

export function autoFix(fileName: string) {
    console.log(fileName);
    spawn(getConfig('swiftLintPath'), ['autocorrect', '--path', fileName])
        .on('data', (data: any) => console.log(data))
        .on('error', (err: any) => {
            console.error(err);
            vscode.window.showErrorMessage('Swift: Error auto-fixing files with SwiftLint', err.message);
        });
}
