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

export function handleDiagnosticErrors(document: vscode.TextDocument, errors: ICheckResult[]) {
    errorDiagnosticCollection.clear();
    warningDiagnosticCollection.clear();

    const diagnosticMap: Map<string, Map<vscode.DiagnosticSeverity, vscode.Diagnostic[]>> = new Map();
    errors.forEach(error => {
        // swiftlint returns <nopath> when using stdin
        const file = `file://${error.file === '<nopath>' ? document.fileName : error.file}`;
        const range = getRange(document, error);
        const severity = getSeverity(error.severity);
        const diagnostic = new vscode.Diagnostic(range, error.msg, severity);
        const diagnostics: any = diagnosticMap.get(file) || new Map<vscode.DiagnosticSeverity, vscode.Diagnostic[]>();

        if (!diagnostics[severity]) {
            diagnostics[severity] = [];
        }

        diagnostics[severity].push(diagnostic);
        diagnosticMap.set(file, diagnostics);
    });

    diagnosticMap.forEach((diagMap: any, file) => {
        const fileUri = vscode.Uri.parse(file);
        const errors = diagMap[vscode.DiagnosticSeverity.Error] || [];
        const warnings = diagMap[vscode.DiagnosticSeverity.Warning] || [];

        const errorLines = errors.map((x: vscode.Diagnostic) => x.range.start.line);
        const filteredWarnings = warnings.filter((x: vscode.Diagnostic) => errorLines.indexOf(x.range.start.line) === -1);

        errorDiagnosticCollection.set(fileUri, errors);
        warningDiagnosticCollection.set(fileUri, filteredWarnings);
    });
}

function getRange(document: vscode.TextDocument, error: ICheckResult) {
    const initialRange = new vscode.Range(error.line - 1, 0, error.line - 1, document.lineAt(error.line - 1).range.end.character + 1);
    const text = document.getText(initialRange);

    const [, leading, trailing]: any = /^(\s*).*(\s*)$/.exec(text);
    const startColumn = leading.length;
    const endColumn = text.length - trailing.length;

    return new vscode.Range(error.line - 1, startColumn, error.line - 1, endColumn);
}

function getSeverity(sev: string): vscode.DiagnosticSeverity {
    switch (sev) {
        case 'error': return vscode.DiagnosticSeverity.Error;
        case 'warning': return vscode.DiagnosticSeverity.Warning;
        default: return vscode.DiagnosticSeverity.Error;
    }
}
