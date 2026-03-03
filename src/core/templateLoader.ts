import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Template } from '../types';
import * as os from 'os';

export class TemplateLoader {
  private globalTemplatesPath: string;

  constructor() {
    const config = vscode.workspace.getConfiguration('fileTemplate');
    const customPath = config.get<string>('globalPath');
    this.globalTemplatesPath = customPath 
      ? customPath.replace(/^~/, os.homedir())
      : path.join(os.homedir(), '.vscode-templates');
  }

  async loadTemplates(): Promise<Template[]> {
    const templates: Template[] = [];
    
    // 加载全局模板
    if (fs.existsSync(this.globalTemplatesPath)) {
      templates.push(...await this.scanDirectory(this.globalTemplatesPath));
    }
    
    // 加载项目级模板（优先级更高）
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
      for (const folder of workspaceFolders) {
        const projectTemplatesPath = path.join(folder.uri.fsPath, '.vscode', 'templates');
        if (fs.existsSync(projectTemplatesPath)) {
          templates.push(...await this.scanDirectory(projectTemplatesPath, folder.name));
        }
      }
    }
    
    return templates;
  }

  private async scanDirectory(dirPath: string, workspaceName?: string): Promise<Template[]> {
    const templates: Template[] = [];
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 递归扫描子目录
        const subTemplates = await this.scanDirectory(fullPath, workspaceName);
        templates.push(...subTemplates);
      } else {
        // 文件作为模板
        const relativeDir = path.relative(this.globalTemplatesPath, path.dirname(fullPath));
        const category = relativeDir !== '.' ? relativeDir : undefined;
        
        templates.push({
          name: item,
          label: workspaceName ? `${item} (${workspaceName})` : item,
          description: category,
          path: fullPath,
          category
        });
      }
    }
    
    return templates;
  }
}
