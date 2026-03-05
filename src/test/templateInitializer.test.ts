import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { TemplateInitializer } from '../core/templateInitializer';

suite('TemplateInitializer Test Suite', () => {
  let tempDir: string;

  setup(() => {
    // Create a temporary directory for each test
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'template-test-'));
  });

  teardown(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('should create example templates when directory does not exist', async () => {
    const nonExistentDir = path.join(tempDir, 'non-existent', 'templates');
    const initializer = new TemplateInitializer(nonExistentDir);

    const created = await initializer.initializeIfNeeded();

    assert.strictEqual(created, true, 'Should return true when templates are created');
    assert.strictEqual(fs.existsSync(nonExistentDir), true, 'Directory should be created');
    
    // Check that example templates were created
    assert.strictEqual(fs.existsSync(path.join(nonExistentDir, 'react', 'Component.tsx')), true);
    assert.strictEqual(fs.existsSync(path.join(nonExistentDir, 'python', 'main.py')), true);
    assert.strictEqual(fs.existsSync(path.join(nonExistentDir, 'javascript', 'module.js')), true);
    assert.strictEqual(fs.existsSync(path.join(nonExistentDir, 'readme.md')), true);
  });

  test('should create example templates when directory exists but is empty', async () => {
    const emptyDir = path.join(tempDir, 'empty-templates');
    fs.mkdirSync(emptyDir, { recursive: true });
    const initializer = new TemplateInitializer(emptyDir);

    const created = await initializer.initializeIfNeeded();

    assert.strictEqual(created, true, 'Should return true when templates are created');
    assert.strictEqual(fs.existsSync(path.join(emptyDir, 'react', 'Component.tsx')), true);
    assert.strictEqual(fs.existsSync(path.join(emptyDir, 'readme.md')), true);
  });

  test('should not create templates when directory already has content', async () => {
    const existingDir = path.join(tempDir, 'existing-templates');
    fs.mkdirSync(existingDir, { recursive: true });
    // Create an existing template file
    fs.writeFileSync(path.join(existingDir, 'my-template.txt'), 'existing content');
    
    const initializer = new TemplateInitializer(existingDir);
    const created = await initializer.initializeIfNeeded();

    assert.strictEqual(created, false, 'Should return false when directory is not empty');
    // Example templates should NOT be created
    assert.strictEqual(fs.existsSync(path.join(existingDir, 'react')), false);
    assert.strictEqual(fs.existsSync(path.join(existingDir, 'readme.md')), false);
    // Existing file should still be there
    assert.strictEqual(fs.existsSync(path.join(existingDir, 'my-template.txt')), true);
  });

  test('should create templates with correct content', async () => {
    const testDir = path.join(tempDir, 'content-test');
    const initializer = new TemplateInitializer(testDir);

    await initializer.initializeIfNeeded();

    // Check React template content
    const reactContent = fs.readFileSync(path.join(testDir, 'react', 'Component.tsx'), 'utf-8');
    assert.ok(reactContent.includes('{{filename}}'), 'React template should contain filename variable');
    assert.ok(reactContent.includes('{{author}}'), 'React template should contain author variable');
    assert.ok(reactContent.includes('{{date}}'), 'React template should contain date variable');
    assert.ok(reactContent.includes('{{componentName}}'), 'React template should contain componentName variable');

    // Check Python template content
    const pythonContent = fs.readFileSync(path.join(testDir, 'python', 'main.py'), 'utf-8');
    assert.ok(pythonContent.includes('def main():'), 'Python template should contain main function');

    // Check README template content
    const readmeContent = fs.readFileSync(path.join(testDir, 'readme.md'), 'utf-8');
    assert.ok(readmeContent.includes('# {{filename}}'), 'README template should have title placeholder');
  });
});
