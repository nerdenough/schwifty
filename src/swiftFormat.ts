'use strict';
import { DocumentFormattingEditProvider, TextDocument, window } from 'vscode';
import { spawn } from 'child_process';
import { getConfig } from './util';

function format(fileName: string) {
    spawn(getConfig('sourceKittenPath'), ['format', '--file', fileName])
        .on('data', (data: any) => console.log(data))
        .on('error', (err: any) => {
            console.error(err);
            window.showErrorMessage('Schwifty: Error formatting document with SourceKitten', err.message);
        });
}

export class SwiftDocumentFormattingEditProvider implements DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(document: TextDocument): any {
        format(document.fileName)
    }
}
