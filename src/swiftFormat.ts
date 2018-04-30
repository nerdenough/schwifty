'use strict';
import { spawn } from 'child_process';
import { window } from 'vscode';

export function format(sourceKittenPath: any, fileName: string) {
  spawn(sourceKittenPath, ['format', '--file', fileName])
    .on('data', (data: any) => console.log(data))
    .on('error', (err: any) => {
      console.error(err);
      window.showErrorMessage('Schwifty: Error formatting document with SourceKitten', err.message);
    });
}
