import * as vscode from 'vscode';
import { spawn } from 'child_process';

let tokenSource = new vscode.CancellationTokenSource();
let running = false;

export function lintCode(lintWorkspace?: boolean) {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showInformationMessage('No editor is active, cannot find current package to lint');
        return;
    }

    if (editor.document.languageId !== 'swift' && !lintWorkspace) {
        vscode.window.showInformationMessage('File in the active editor is not a Swift file, cannot find current package to lint');
        return;
    }

    swiftLint(editor.document)
        .then((data: any) => {
            running = false;
        })
        .catch((err: Error) => {
            console.error(err);
            vscode.window.showErrorMessage(err.message);
        });
}

export function swiftLint(document: vscode.TextDocument): any {
    if (running) {
        tokenSource.cancel();
    }

    const command = 'swiftlint';
    const args = ['lint', '--use-stdin'];
    const input = document.getText();

    running = true;

    return new Promise((resolve, reject) => {
        const child = spawn(command, args);

        child.stdout.on('data', (data: any) => {
            const items = data
                .toString('utf-8')
                .split('\n')
                .filter((line: String) => line !== '')
                .map((line: String) => {
                    const arr = line.split(':');
                    const item = {
                        path: arr[0],
                        line: arr[1],
                        column: arr[2],
                        type: arr[3].trim(),
                        message: arr[4].trim(),
                        description: arr[5].trim()
                    };

                    return item;
                });
            console.log('items', items);

            return resolve(items);
        });

        child.stdout.on('error', (err: Error) => reject(err));

        child.stdin.write(input);
        child.stdin.end();
    });
}
