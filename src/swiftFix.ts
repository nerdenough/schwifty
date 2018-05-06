'use strict';
import { spawn } from 'child_process';
import { getConfig } from './util';

export function autoFix(fileName: string, format?: boolean) {
    const command = getConfig('swiftLintPath');
    const args = ['autocorrect', '--path', fileName];

    if (format) {
        args.push('--format');
    }

    return new Promise((resolve, reject) => {
        spawn(command, args)
            .on('exit', (data: any) => resolve())
            .on('error', (err: Error) => reject(err));
    });
}
