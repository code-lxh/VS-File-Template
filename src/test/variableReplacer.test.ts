import * as assert from 'assert';
import { VariableReplacer } from '../core/variableReplacer';

suite('VariableReplacer Test Suite', () => {
  let replacer: VariableReplacer;

  setup(() => {
    replacer = new VariableReplacer();
  });

  test('should extract custom variables from template', async () => {
    const template = 'Hello {{name}}, your age is {{age}}';
    const { content, variables } = await replacer.replace(template, 'test', '/path', { author: 'Test' });
    
    assert.strictEqual(variables.length, 2);
    assert.ok(variables.find(v => v.name === 'name'));
    assert.ok(variables.find(v => v.name === 'age'));
  });

  test('should replace built-in variable {{filename}}', async () => {
    const template = 'File: {{filename}}';
    const { content, variables } = await replacer.replace(template, 'MyComponent', '/path', { author: 'Test' });
    
    assert.ok(content.includes('MyComponent'));
  });

  test('should replace built-in variable {{date}}', async () => {
    const template = 'Date: {{date}}';
    const { content, variables } = await replacer.replace(template, 'test', '/path', { author: 'Test' });
    
    // 验证日期格式 YYYY-MM-DD
    const dateMatch = content.match(/Date: (\d{4}-\d{2}-\d{2})/);
    assert.ok(dateMatch, 'Date should be replaced with YYYY-MM-DD format');
  });

  test('should not include built-in variables in custom variables list', async () => {
    const template = 'Date: {{date}}, Name: {{customName}}';
    const { content, variables } = await replacer.replace(template, 'test', '/path', { author: 'Test' });
    
    assert.strictEqual(variables.length, 1);
    assert.strictEqual(variables[0].name, 'customName');
  });

  test('should replace custom variables with provided values', () => {
    const template = 'Hello {{name}}, you are {{age}} years old';
    const customVars = [
      { name: 'name', value: 'John' },
      { name: 'age', value: '25' }
    ];
    
    const result = replacer.replaceCustomVariables(template, customVars);
    
    assert.strictEqual(result, 'Hello John, you are 25 years old');
  });

  test('should handle duplicate custom variables', async () => {
    const template = '{{name}} and {{name}}';
    const { content, variables } = await replacer.replace(template, 'test', '/path', { author: 'Test' });
    
    // 应该只提取一个变量
    assert.strictEqual(variables.length, 1);
    assert.strictEqual(variables[0].name, 'name');
  });

  test('should handle template without variables', async () => {
    const template = 'Plain text without variables';
    const { content, variables } = await replacer.replace(template, 'test', '/path', { author: 'Test' });
    
    assert.strictEqual(variables.length, 0);
    assert.strictEqual(content, template);
  });
});
