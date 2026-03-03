export interface Template {
  name: string;
  label: string;
  description?: string;
  path: string;
  category?: string;
}

export interface TemplateVariable {
  name: string;
  value: string;
}

export interface CreateFileOptions {
  templatePath: string;
  targetPath: string;
  filename: string;
  variables: TemplateVariable[];
}

export interface FileTemplateConfig {
  globalPath: string;
  author: string;
}
