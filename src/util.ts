'use strict';
import * as vscode from 'vscode';
import { errorDiagnosticCollection, warningDiagnosticCollection } from './swiftMain';

export interface ICheckResult {
    file: string;
    line: number;
    col: number;
    msg: string;
    severity: string;
}

export function getConfig(key: string): any {
    return vscode.workspace.getConfiguration('swift').get(key);
}

export function handleDiagnosticErrors(document: vscode.TextDocument, errors: ICheckResult[], diagnosticSeverity?: vscode.DiagnosticSeverity) {

    errorDiagnosticCollection.clear();
    warningDiagnosticCollection.clear();

    let diagnosticMap: Map<string, Map<vscode.DiagnosticSeverity, vscode.Diagnostic[]>> = new Map();
    errors.forEach(error => {
        // TODO: Handle multiple files, this currently just assumes document
        // is the correct file.

        let range = new vscode.Range(error.line - 1, 0, error.line - 1, document.lineAt(error.line - 1).range.end.character + 1);
        // let text = document.getText(range);

        // let startColumn = 1;
        // let endColumn = 0;

        // let [, leading, trailing]: any = /^(\s*).*(\s*)$/.exec(text);
        // if (!error.col) {
        //     startColumn = leading.length;
        // } else {
        //     startColumn = error.col - 1; // range is 0-indexed
        // }
        // endColumn = text.length - trailing.length;

        const severity = mapSeverityToVSCodeSeverity(error.severity);
        let diagnostic = new vscode.Diagnostic(range, error.msg, severity);
        let diagnostics: any = diagnosticMap.get(error.file);
        if (!diagnostics) {
            diagnostics = new Map<vscode.DiagnosticSeverity, vscode.Diagnostic[]>();
        }
        if (!diagnostics[severity]) {
            diagnostics[severity] = [];
        }
        diagnostics[severity].push(diagnostic);
        diagnosticMap.set(error.file, diagnostics);
    });

    diagnosticMap.forEach((diagMap: any, file) => {
        // swiftlint returns <nopath> when using stdin
        const fileUri = file === '<nopath>' ? document.uri : vscode.Uri.parse(`file://${file}`);

        if (diagnosticSeverity === undefined || diagnosticSeverity === vscode.DiagnosticSeverity.Error) {
            const newErrors = diagMap[vscode.DiagnosticSeverity.Error];
            let existingWarnings = warningDiagnosticCollection.get(fileUri);
            errorDiagnosticCollection.set(fileUri, newErrors);

            // Don't diplay warnings if they coincide with an error
            if (newErrors && existingWarnings) {
                const errorLines = newErrors.map((x: vscode.Diagnostic) => x.range.start.line);
                existingWarnings = existingWarnings.filter((x: vscode.Diagnostic) => errorLines.indexOf(x.range.start.line) === -1);
                warningDiagnosticCollection.set(fileUri, existingWarnings);
            }
        }

        if (diagnosticSeverity === undefined || diagnosticSeverity === vscode.DiagnosticSeverity.Warning) {
            const existingErrors = errorDiagnosticCollection.get(fileUri);
            let newWarnings = diagMap[vscode.DiagnosticSeverity.Warning];

            // Ignore warnings that coincide with errors
            if (existingErrors && newWarnings) {
                const errorLines = existingErrors.map((x: vscode.Diagnostic) => x.range.start.line);
                newWarnings = newWarnings.filter((x: vscode.Diagnostic) => errorLines.indexOf(x.range.start.line) === -1);
            }

            warningDiagnosticCollection.set(fileUri, newWarnings);
        }
    });
}

function mapSeverityToVSCodeSeverity(sev: string): vscode.DiagnosticSeverity {
    switch (sev) {
        case 'error': return vscode.DiagnosticSeverity.Error;
        case 'warning': return vscode.DiagnosticSeverity.Warning;
        default: return vscode.DiagnosticSeverity.Error;
    }
}
