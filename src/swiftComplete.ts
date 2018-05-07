
'use strict';
import * as vscode from 'vscode';
import * as cp from 'child_process';
import { getConfig } from './util';

interface SwiftCodeSuggestion {
    context: string;
    descriptionKey: string;
    kind: string;
    name: string;
    numBytesToErase: number;
    sourceText: string;
    typeName: string;
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

function mapToVSCodeKind(kind: string): vscode.CompletionItemKind {
    switch (kind) {
        case 'class':
            return vscode.CompletionItemKind.Class;
        case 'color':
            return vscode.CompletionItemKind.Color;
        case 'enum':
            return vscode.CompletionItemKind.Enum;
        case 'func':
            return vscode.CompletionItemKind.Function;
        case 'keyword':
            return vscode.CompletionItemKind.Keyword;
        case 'module':
            return vscode.CompletionItemKind.Module;
        case 'struct':
            return vscode.CompletionItemKind.Struct;
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

            const results: SwiftCodeSuggestion[] = JSON.parse(completions.toString());

            const suggestions: vscode.CompletionItem[] = results.map((suggest: any) => {
                const item = new vscode.CompletionItem(suggest.name);
                item.kind = mapToVSCodeKind(suggest.kind.split('.').pop());
                item.detail = suggest.descriptionKey;
                item.insertText = suggest.sourceText;
                item.sortText = 'a';
                return item;
            });

            resolve(suggestions);
        });
    }
}
