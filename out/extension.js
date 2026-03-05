"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const templateLoader_1 = require("./core/templateLoader");
const variableReplacer_1 = require("./core/variableReplacer");
const fileCreator_1 = require("./core/fileCreator");
const templateInitializer_1 = require("./core/templateInitializer");
const pathResolver_1 = require("./core/pathResolver");
async function activate(context) {
    const templateLoader = new templateLoader_1.TemplateLoader();
    // Initialize example templates on first use
    const initializer = new templateInitializer_1.TemplateInitializer(templateLoader.getGlobalTemplatesPath());
    const created = await initializer.initializeIfNeeded();
    if (created) {
        vscode.window.showInformationMessage('File Template: Example templates created in ' + templateLoader.getGlobalTemplatesPath());
    }
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
            if (!nameInput)
                return;
            // 自动添加后缀
            const filename = nameInput.trim() + templateExt;
            // 5. 获取目标目录（优先使用当前编辑器文件所在目录）
            const targetDir = (0, pathResolver_1.getTargetDirectory)();
            if (!targetDir) {
                vscode.window.showErrorMessage('No workspace folder open');
                return;
            }
            // 6. 确定目标文件路径
            const targetPath = vscode.Uri.joinPath(vscode.Uri.file(targetDir), filename).fsPath;
            // 检查文件是否已存在
            if (await fileCreator.checkFileExists(targetPath)) {
                const overwrite = await vscode.window.showWarningMessage(`File ${filename} already exists. Overwrite?`, 'Yes', 'No');
                if (overwrite !== 'Yes')
                    return;
            }
            // 7. 读取模板并提取变量
            const fs = require('fs');
            let templateContent = fs.readFileSync(selectedTemplate.template.path, 'utf-8');
            const { content: preprocessedContent, variables: customVariables } = await variableReplacer.replace(templateContent, nameInput.trim(), targetDir);
            // 8. 输入自定义变量
            const variables = [];
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