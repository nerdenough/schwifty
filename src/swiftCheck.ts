'use strict';
import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { ICheckResult } from './util';
import { diagnosticsStatusBarItem } from './swiftStatus';

function extractErrors(data: Buffer): ICheckResult[] {
    return data
        .toString('utf-8')
        .split('\n')
        .map((line: string) => /(.*):(\d+):(\d+): (\w+): (.*)/.exec(line))
        .filter((match: any) => match !== null)
        .map((match: any) => {
            let [, file, lineStr, colStr, severity, msg] = match;
            let line = +lineStr;
            let col = +colStr;

            return { file, line, col, severity, msg };
        })
        .filter((result: ICheckResult) => result.severity !== 'note'); // not sure what to do with this for now
}

export function check(fileName: string, swiftConfig: vscode.WorkspaceConfiguration): Promise<ICheckResult[]> {
    diagnosticsStatusBarItem.hide();

    return new Promise((resolve, reject) => {
        const command = 'swiftc';
        const args = [fileName];
        const child = spawn(command, args);

        child.stderr.on('data', (data: any) => resolve(extractErrors(data)));
        child.on('error', (err: Error) => reject(err));
    });
}
