import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Get the target directory for creating a new file.
 * Priority: active editor's directory > workspace root > undefined
 */
export function getTargetDirectory(): string | undefined {
  // Try to get the active text editor's file path
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const activeFilePath = activeEditor.document.uri.fsPath;
    return path.dirname(activeFilePath);
  }

  // Fallback to workspace root
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    return workspaceFolders[0].uri.fsPath;
  }

  return undefined;
}
