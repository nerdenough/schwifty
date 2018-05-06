
'use strict';
import * as vscode from 'vscode';
import * as cp from 'child_process';
import { getConfig } from './util';

interface SwiftCodeSuggestion {
    class: string;
    name: string;
    type: string;
}

export function complete(fileName: string, position: vscode.Position): Promise<string> {
    const command = getConfig('sourceKittenPath');
    const args = ['complete', '--file', fileName, '--offset', `${position.character}`];

    return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';

        const p = cp.spawn(command, args);
        p.stdout.on('data', data => stdout += data);
        p.stderr.on('data', data => stderr += data);
        p.on('error', err => reject(err));
        p.on('close', code => {
            if (code !== 0) {
                return reject(stderr);
            }

            return resolve(stdout);
        });
    });
}

function typeNameToVSCodeKind(typeName: string): vscode.CompletionItemKind {
    switch (typeName) {
        case 'Module':
            return vscode.CompletionItemKind.Module;
        default:
            return vscode.CompletionItemKind.Property;
    }
}

export class SwiftCompletionItemProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> {
        return new Promise<vscode.CompletionItem[]>(async (resolve, reject) => {
            const completions = await complete(document.fileName, position);

            if (!completions) {
                return;
            }

            const data = JSON.parse(completions.toString());
            const suggestions = data.map(item => {
                const name = item.name;
                const type = typeNameToVSCodeKind(item.typeName);

                return { type };
            });
        });
    }
}
