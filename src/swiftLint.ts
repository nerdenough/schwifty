import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { outputChannel, diagnosticsStatusBarItem } from './swiftStatus';
import { ICheckResult, handleDiagnosticErrors } from './util';

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

    outputChannel.clear();
    diagnosticsStatusBarItem.show();
    diagnosticsStatusBarItem.text = 'Linting...';

    swiftLint(editor.document)
        .then((warnings: ICheckResult[]) => {
            handleDiagnosticErrors(editor.document, warnings);
            diagnosticsStatusBarItem.hide();
            running = false;
        })
        .catch((err: Error) => {
            vscode.window.showErrorMessage(`Error: ${err.message}`);
            diagnosticsStatusBarItem.text = 'Linting Failed';
        });
}

export function swiftLint(document: vscode.TextDocument): Promise<ICheckResult[]> {
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
            const items: ICheckResult[] = data
                .toString('utf-8')
                .split('\n')
                .filter((text: string) => text !== '')
                .map((text: string) => {
                    const regex = /(.*):(\d+):(\d+): (\w+): (.+?): (.*)/;
                    let match = regex.exec(text);

                    if (!match) {
                        // TODO: Handle
                        return;
                    }

                    let [, file, lineStr, colStr,,, msg] = match;
                    let line = +lineStr;
                    let col = +colStr;
                    const severity = vscode.DiagnosticSeverity.Warning;

                    return { file, line, col, severity, msg };
                });

            return resolve(items);
        });

        child.stdout.on('error', (err: Error) => reject(err));

        child.stdin.write(input);
        child.stdin.end();
    });
}
