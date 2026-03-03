"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariableReplacer = void 0;
class VariableReplacer {
    async replace(content, filename, filepath, options) {
        // 提取自定义变量
        const customVarNames = this.extractCustomVariables(content);
        // 替换内置变量
        let result = content;
        result = result.replace(/\{\{date\}\}/g, this.getDate());
        result = result.replace(/\{\{datetime\}\}/g, this.getDateTime());
        result = result.replace(/\{\{author\}\}/g, options?.author ?? await this.getDefaultAuthor());
        result = result.replace(/\{\{filename\}\}/g, filename);
        result = result.replace(/\{\{filepath\}\}/g, filepath);
        // 返回自定义变量列表供用户输入
        return { content: result, variables: customVarNames.map(name => ({ name, value: '' })) };
    }
    replaceCustomVariables(content, variables) {
        let result = content;
        for (const variable of variables) {
            const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
            result = result.replace(regex, variable.value);
        }
        return result;
    }
    extractCustomVariables(content) {
        const matches = content.match(VariableReplacer.VARIABLE_REGEX);
        if (!matches)
            return [];
        const builtinVars = ['date', 'datetime', 'author', 'filename', 'filepath'];
        const uniqueVars = [...new Set(matches.map(m => m.slice(2, -2)))];
        return uniqueVars.filter(v => !builtinVars.includes(v));
    }
    getDate() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }
    getDateTime() {
        const now = new Date();
        return now.toISOString().replace('T', ' ').slice(0, 19);
    }
    async getDefaultAuthor() {
        // 延迟导入 vscode，只在需要时
        try {
            const vscode = await Promise.resolve().then(() => require('vscode'));
            const config = vscode.workspace.getConfiguration('fileTemplate');
            const author = config.get('author');
            if (author)
                return author;
        }
        catch {
            // vscode 不可用，使用默认值
        }
        // 尝试从 git config 读取
        try {
            const { execSync } = require('child_process');
            return execSync('git config user.name', { encoding: 'utf-8' }).trim();
        }
        catch {
            return 'Anonymous';
        }
    }
}
exports.VariableReplacer = VariableReplacer;
VariableReplacer.VARIABLE_REGEX = /\{\{(\w+)\}\}/g;
//# sourceMappingURL=variableReplacer.js.map