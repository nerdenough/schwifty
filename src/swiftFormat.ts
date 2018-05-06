'use strict';
import { DocumentFormattingEditProvider, TextDocument, window } from 'vscode';
import { spawn } from 'child_process';
import { getConfig } from './util';

export function format(fileName: string, format?: boolean) {
    const command = getConfig('sourceKittenPath');
    const args = ['format', '--file', fileName];

    return new Promise((resolve, reject) => {
        spawn(command, args)
            .on('exit', () => resolve())
            .on('error', (err: Error) => reject(err));
    });
}

export class SwiftDocumentFormattingEditProvider implements DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(document: TextDocument): any {
        format(document.fileName)
            .then(data => data)
            .catch(err => {
                console.error(err);
                window.showErrorMessage('Schwifty: Error formatting document with SourceKitten', err.message);
            });
    }
}
