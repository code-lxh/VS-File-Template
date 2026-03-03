"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const templateLoader_1 = require("./core/templateLoader");
const variableReplacer_1 = require("./core/variableReplacer");
const fileCreator_1 = require("./core/fileCreator");
function activate(context) {
    const templateLoader = new templateLoader_1.TemplateLoader();
    const variableReplacer = new variableReplacer_1.VariableReplacer();
    const fileCreator = new fileCreator_1.FileCreator();
    const disposable = vscode.commands.registerCommand('fileTemplate.createFile', async () => {
        try {
            // 1. 加载模板
            const templates = await templateLoader.loadTemplates();
            if (templates.length === 0) {
                vscode.window.showInformationMessage('No templates found. Create templates in ~/.vscode-templates/ or .vscode/templates/');
                return;
            }
            // 2. 选择模板
            const selectedTemplate = await vscode.window.showQuickPick(templates.map(t => ({
                label: t.label,
                description: t.description,
                detail: t.path,
                template: t
            })), { placeHolder: 'Select a template' });
            if (!selectedTemplate)
                return;
            // 3. 输入文件名
            const filename = await vscode.window.showInputBox({
                placeHolder: 'Enter file name',
                prompt: 'Name of the file to create',
                validateInput: (value) => {
                    if (!value || value.trim() === '') {
                        return 'File name is required';
                    }
                    return null;
                }
            });
            if (!filename)
                return;
            // 4. 获取工作区路径
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('No workspace folder open');
                return;
            }
            // 5. 确定目标路径
            const targetDir = workspaceFolders[0].uri.fsPath;
            const targetPath = vscode.Uri.joinPath(vscode.Uri.file(targetDir), filename).fsPath;
            // 检查文件是否已存在
            if (await fileCreator.checkFileExists(targetPath)) {
                const overwrite = await vscode.window.showWarningMessage(`File ${filename} already exists. Overwrite?`, 'Yes', 'No');
                if (overwrite !== 'Yes')
                    return;
            }
            // 6. 读取模板并提取变量
            const fs = require('fs');
            let templateContent = fs.readFileSync(selectedTemplate.template.path, 'utf-8');
            const { content: preprocessedContent, variables: customVariables } = await variableReplacer.replace(templateContent, filename.replace(/\.[^/.]+$/, ''), targetDir);
            // 7. 输入自定义变量
            const variables = [];
            for (const varDef of customVariables) {
                const value = await vscode.window.showInputBox({
                    placeHolder: `Enter value for {{${varDef.name}}}`,
                    prompt: `Value for {{${varDef.name}}}`
                });
                variables.push({ name: varDef.name, value: value || '' });
            }
            // 8. 创建文件
            await fileCreator.createFile({
                templatePath: selectedTemplate.template.path,
                targetPath,
                filename: filename.replace(/\.[^/.]+$/, ''),
                variables
            });
            // 9. 打开文件
            const document = await vscode.workspace.openTextDocument(targetPath);
            await vscode.window.showTextDocument(document);
            vscode.window.showInformationMessage(`Created ${filename}`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error: ${error}`);
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map