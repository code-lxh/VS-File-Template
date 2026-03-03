import { TemplateVariable } from '../types';

export interface VariableReplacerOptions {
  author?: string;
}

export class VariableReplacer {
  private static VARIABLE_REGEX = /\{\{(\w+)\}\}/g;

  async replace(
    content: string, 
    filename: string, 
    filepath: string,
    options?: VariableReplacerOptions
  ): Promise<{ content: string; variables: TemplateVariable[] }> {
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

  replaceCustomVariables(content: string, variables: TemplateVariable[]): string {
    let result = content;
    for (const variable of variables) {
      const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
      result = result.replace(regex, variable.value);
    }
    return result;
  }

  extractCustomVariables(content: string): string[] {
    const matches = content.match(VariableReplacer.VARIABLE_REGEX);
    if (!matches) return [];
    
    const builtinVars = ['date', 'datetime', 'author', 'filename', 'filepath'];
    const uniqueVars = [...new Set(matches.map(m => m.slice(2, -2)))];
    
    return uniqueVars.filter(v => !builtinVars.includes(v));
  }

  getDate(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  getDateTime(): string {
    const now = new Date();
    return now.toISOString().replace('T', ' ').slice(0, 19);
  }

  private async getDefaultAuthor(): Promise<string> {
    // 延迟导入 vscode，只在需要时
    try {
      const vscode = await import('vscode');
      const config = vscode.workspace.getConfiguration('fileTemplate');
      const author = config.get<string>('author');
      if (author) return author;
    } catch {
      // vscode 不可用，使用默认值
    }
    
    // 尝试从 git config 读取
    try {
      const { execSync } = require('child_process');
      return execSync('git config user.name', { encoding: 'utf-8' }).trim();
    } catch {
      return 'Anonymous';
    }
  }
}
