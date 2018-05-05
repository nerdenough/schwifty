import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { outputChannel, diagnosticsStatusBarItem } from './swiftStatus';
import { ICheckResult, handleDiagnosticErrors } from './util';

let tokenSource = new vscode.CancellationTokenSource();
let running = false;

function extractErrors(data: Buffer): ICheckResult[] {
    return data
        .toString('utf-8')
        .split('\n')
        .map((line: string) => /(.*):(\d+):(\d+): (\w+): (.+?): (.*)/.exec(line))
        .filter((match: any) => match !== null)
        .map((match: any) => {
            let [, file, lineStr, colStr, , , msg] = match;
            let line = +lineStr;
            let col = +colStr;

            // SwiftLint style errors should just be treated as warnings
            const severity = 'warning';

            return { file, line, col, severity, msg };
        });
}

export function lint(document: vscode.TextDocument): Promise<ICheckResult[]> {
    if (running) {
        tokenSource.cancel();
    }

    const command = 'swiftlint';
    const args = ['lint', '--use-stdin'];
    const input = document.getText();

    running = true;

    return new Promise((resolve, reject) => {
        const child = spawn(command, args);

        child.stdout.on('data', (data: any) => resolve(extractErrors(data)));
        child.stdout.on('error', (err: Error) => reject(err));

        child.stdin.write(input);
        child.stdin.end();
    });
}

export async function runLint() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showInformationMessage('No editor is active, cannot find current package to lint');
        return;
    }

    if (editor.document.languageId !== 'swift') {
        vscode.window.showInformationMessage('File in the active editor is not a Swift file, cannot find current package to lint');
        return;
    }

    outputChannel.clear();
    diagnosticsStatusBarItem.show();
    diagnosticsStatusBarItem.text = 'Linting...';

    try {
        const warnings: ICheckResult[] = await lint(editor.document);
        diagnosticsStatusBarItem.hide();
        handleDiagnosticErrors(editor.document, warnings);

    } catch (err) {
        vscode.window.showErrorMessage(`Error: ${err.message}`);
        diagnosticsStatusBarItem.text = 'Linting Failed';
    }
}
