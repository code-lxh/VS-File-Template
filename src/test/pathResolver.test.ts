import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import { getTargetDirectory } from '../core/pathResolver';

suite('PathResolver Test Suite', () => {
  test('should return a valid directory path when workspace is available', () => {
    // Skip test if no workspace is available
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
      console.log('Skipping test: no workspace available');
      return;
    }

    const result = getTargetDirectory();
    
    // The result should be defined
    assert.ok(result, 'Should return a directory path');
    
    // The result should be an absolute path
    assert.ok(path.isAbsolute(result!), 'Should return an absolute path');
  });

  test('should return workspace root when no active editor', () => {
    // Skip test if no workspace is available
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
      console.log('Skipping test: no workspace available');
      return;
    }

    // When no active editor, should return workspace root
    const result = getTargetDirectory();
    const expectedRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    
    assert.strictEqual(result, expectedRoot, 'Should return workspace root when no active editor');
  });
});
