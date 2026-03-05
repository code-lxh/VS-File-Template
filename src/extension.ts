import * as vscode from 'vscode';
import { TemplateLoader } from './core/templateLoader';
import { VariableReplacer } from './core/variableReplacer';
import { FileCreator } from './core/fileCreator';
import { TemplateInitializer } from './core/templateInitializer';
import { TemplateVariable } from './types';

export async function activate(context: vscode.ExtensionContext) {
  const templateLoader = new TemplateLoader();
  
  // Initialize example templates on first use
  const initializer = new TemplateInitializer(templateLoader.getGlobalTemplatesPath());
  const created = await initializer.initializeIfNeeded();
  if (created) {
    vscode.window.showInformationMessage(
      'File Template: Example templates created in ' + templateLoader.getGlobalTemplatesPath()
    );
  }

  const variableReplacer = new VariableReplacer();
  const fileCreator = new FileCreator();

  const disposable = vscode.commands.registerCommand('fileTemplate.createFile', async () => {
    try {
      // 1. 加载模板
      const templates = await templateLoader.loadTemplates();
      
      if (templates.length === 0) {
        vscode.window.showInformationMessage(
          'No templates found. Create templates in ~/.vscode-templates/ or .vscode/templates/'
        );
        return;
      }

      // 2. 选择模板
      const selectedTemplate = await vscode.window.showQuickPick(
        templates.map(t => ({
          label: t.label,
          description: t.description,
          detail: t.path,
          template: t
        })),
        { placeHolder: 'Select a template' }
      );

      if (!selectedTemplate) return;

      // 3. 获取模板后缀
      const templateName = selectedTemplate.template.name;
      const templateExt = templateName.includes('.') 
        ? templateName.substring(templateName.lastIndexOf('.')) 
        : '';
      const templateNameWithoutExt = templateName.includes('.')
        ? templateName.substring(0, templateName.lastIndexOf('.'))
        : templateName;

      // 4. 输入文件名（不带后缀）
      const nameInput = await vscode.window.showInputBox({
        placeHolder: templateNameWithoutExt,
        prompt: `Enter file name (without "${templateExt}" suffix)`,
        value: templateNameWithoutExt,
        validateInput: (value) => {
          if (!value || value.trim() === '') {
            return 'File name is required';
          }
          return null;
        }
      });

      if (!nameInput) return;

      // 自动添加后缀
      const filename = nameInput.trim() + templateExt;

      // 5. 获取工作区路径
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
      }

      // 6. 确定目标路径
      const targetDir = workspaceFolders[0].uri.fsPath;
      const targetPath = vscode.Uri.joinPath(
        vscode.Uri.file(targetDir),
        filename
      ).fsPath;

      // 检查文件是否已存在
      if (await fileCreator.checkFileExists(targetPath)) {
        const overwrite = await vscode.window.showWarningMessage(
          `File ${filename} already exists. Overwrite?`,
          'Yes',
          'No'
        );
        if (overwrite !== 'Yes') return;
      }

      // 7. 读取模板并提取变量
      const fs = require('fs');
      let templateContent = fs.readFileSync(selectedTemplate.template.path, 'utf-8');
      
      const { content: preprocessedContent, variables: customVariables } = 
        await variableReplacer.replace(templateContent, nameInput.trim(), targetDir);

      // 8. 输入自定义变量
      const variables: TemplateVariable[] = [];
      for (const varDef of customVariables) {
        const value = await vscode.window.showInputBox({
          placeHolder: `Enter value for {{${varDef.name}}}`,
          prompt: `Value for {{${varDef.name}}}`
        });
        variables.push({ name: varDef.name, value: value || '' });
      }

      // 9. 创建文件
      await fileCreator.createFile({
        templatePath: selectedTemplate.template.path,
        targetPath,
        filename: nameInput.trim(),
        variables,
        content: preprocessedContent
      });

      // 10. 打开文件
      const document = await vscode.workspace.openTextDocument(targetPath);
      await vscode.window.showTextDocument(document);

      vscode.window.showInformationMessage(`Created ${filename}`);

    } catch (error) {
      vscode.window.showErrorMessage(`Error: ${error}`);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
