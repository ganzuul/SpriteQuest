export interface DiagnosticAddress { workflowId: string; instancePath: string[]; nodeId: string; }
export interface DiagnosticInput { code?: string; message?: string; nodeId?: string; address?: DiagnosticAddress; }
export interface DiagnosticContext { operation?: string; nodeTitle?: string; inputLabel?: string; outputType?: string; inputType?: string; enabled?: boolean; action?: string; }
export interface DiagnosticView {
    id: string; severity: 'info' | 'warning' | 'error'; title: string; message: string;
    technical: { code: string; message: string } | null; address?: DiagnosticAddress;
}
export function presentDiagnostic(input: string | DiagnosticInput | unknown, context?: DiagnosticContext): DiagnosticView;
export function diagnosticText(input: string | DiagnosticInput | unknown, context?: DiagnosticContext): string;
export function presentDiagnostics(inputs: readonly (string | DiagnosticInput | unknown)[], context?: DiagnosticContext): DiagnosticView[];
