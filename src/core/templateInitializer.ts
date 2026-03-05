import * as fs from 'fs';
import * as path from 'path';
import { exampleTemplates } from './exampleTemplates';

export class TemplateInitializer {
  private globalTemplatesPath: string;

  constructor(globalTemplatesPath: string) {
    this.globalTemplatesPath = globalTemplatesPath;
  }

  /**
   * Initialize templates if needed.
   * Returns true if templates were created, false otherwise.
   */
  async initializeIfNeeded(): Promise<boolean> {
    // Check if directory exists and has content
    if (fs.existsSync(this.globalTemplatesPath)) {
      const stats = fs.statSync(this.globalTemplatesPath);
      if (stats.isDirectory()) {
        const items = fs.readdirSync(this.globalTemplatesPath);
        // If directory is not empty, don't create examples
        if (items.length > 0) {
          return false;
        }
      }
    }

    // Create global templates directory
    if (!fs.existsSync(this.globalTemplatesPath)) {
      fs.mkdirSync(this.globalTemplatesPath, { recursive: true });
    }

    // Create example templates
    for (const template of exampleTemplates) {
      const targetDir = template.category 
        ? path.join(this.globalTemplatesPath, template.category)
        : this.globalTemplatesPath;

      // Create category subdirectory if needed
      if (template.category && !fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const targetPath = path.join(targetDir, template.filename);
      fs.writeFileSync(targetPath, template.content, 'utf-8');
    }

    return true;
  }
}
