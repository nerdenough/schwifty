'use strict';
import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { ICheckResult } from './util';
import { diagnosticsStatusBarItem } from './swiftStatus';

export function check(fileName: string, swiftConfig: vscode.WorkspaceConfiguration): Promise<ICheckResult[]> {
    diagnosticsStatusBarItem.hide();

    return new Promise((resolve, reject) => {
        const command = 'swiftc';
        const args = [fileName];
        const child = spawn(command, args);

        child.stderr.on('data', (data: any) => {
            const items: ICheckResult[] = data
                .toString('utf-8')
                .split('\n')
                .map((line: string) => /(.*):(\d+):(\d+): (\w+): (.*)/.exec(line))
                .filter((match: Array<string>) => match !== null)
                .map((match: Array<string>) => {
                    let [,file, lineStr, colStr, severity, msg] = match;
                    let line = +lineStr;
                    let col = +colStr;

                    return { file, line, col, severity, msg };
                });

            return resolve(items);
        });

        child.on('error', (err: Error) => reject(err));
    });
}
