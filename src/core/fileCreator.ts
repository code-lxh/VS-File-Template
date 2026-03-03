import * as fs from 'fs';
import * as path from 'path';
import { CreateFileOptions } from '../types';
import { VariableReplacer } from './variableReplacer';

export class FileCreator {
  private variableReplacer: VariableReplacer;

  constructor() {
    this.variableReplacer = new VariableReplacer();
  }

  async createFile(options: CreateFileOptions): Promise<void> {
    const { templatePath, targetPath, filename, variables, content: preprocessedContent } = options;
    
    // 使用预处理的内容（内置变量已替换）或重新读取模板
    let content = preprocessedContent ?? fs.readFileSync(templatePath, 'utf-8');
    
    // 变量替换（自定义变量）
    content = this.variableReplacer.replaceCustomVariables(content, variables);
    
    // 确保目标目录存在
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // 写入文件
    fs.writeFileSync(targetPath, content, 'utf-8');
  }

  async checkFileExists(filePath: string): Promise<boolean> {
    return fs.existsSync(filePath);
  }
}
