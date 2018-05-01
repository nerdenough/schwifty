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
    return vscode.workspace.getConfiguration('schwifty').get(key);
}

export function handleDiagnosticErrors(document: vscode.TextDocument, errors: ICheckResult[], diagnosticSeverity?: vscode.DiagnosticSeverity) {
    if (diagnosticSeverity === undefined || diagnosticSeverity === vscode.DiagnosticSeverity.Error) {
        errorDiagnosticCollection.clear();
    }

    if (diagnosticSeverity === undefined || diagnosticSeverity === vscode.DiagnosticSeverity.Warning) {
        warningDiagnosticCollection.clear();
    }

    let diagnosticMap: Map<string, Map<vscode.DiagnosticSeverity, vscode.Diagnostic[]>> = new Map();
    errors.forEach(error => {
        // TODO: Handle multiple files, this currently just assumes document
        // is the correct file.

        let range = new vscode.Range(error.line - 1, 0, error.line - 1, document.lineAt(error.line - 1).range.end.character + 1);
        let text = document.getText(range);

        // TODO: Find columns

        let diagnostic = new vscode.Diagnostic(range, error.msg, vscode.DiagnosticSeverity.Warning);
        let diagnostics: any = diagnosticMap.get(error.file);
        if (!diagnostics) {
            diagnostics = new Map<vscode.DiagnosticSeverity, vscode.Diagnostic[]>();
        }
        if (!diagnostics[error.severity]) {
            diagnostics[error.severity] = [];
        }
        diagnostics[error.severity].push(diagnostic);
        diagnosticMap.set(error.file, diagnostics);
    });

    // TODO: iterate diagnostic map
}
