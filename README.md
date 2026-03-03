# File Template

通过自定义模板快速创建文件。

## 功能

- 支持全局模板和项目级模板
- 支持变量替换（内置变量 + 自定义变量）
- 简洁的命令面板操作

## 使用

1. 按 `Cmd/Ctrl+Shift+P` 打开命令面板
2. 输入 "Create File from Template"
3. 选择模板
4. 输入文件名
5. 如有自定义变量，依次输入变量值

## 模板目录

### 全局模板

默认路径：`~/.vscode-templates/`

可通过设置 `fileTemplate.globalPath` 修改

### 项目级模板

路径：`.vscode/templates/`

项目级模板优先级高于全局模板。

## 模板示例

```
~/.vscode-templates/
├── react/
│   ├── Component.tsx
│   └── Hook.ts
├── python/
│   ├── main.py
│   └── class.py
└── readme.md
```

## 变量

### 内置变量

| 变量 | 说明 |
|------|------|
| `{{date}}` | 当前日期 (YYYY-MM-DD) |
| `{{datetime}}` | 当前日期时间 |
| `{{author}}` | 作者名 |
| `{{filename}}` | 文件名（不含扩展名）|
| `{{filepath}}` | 文件路径 |

### 自定义变量

在模板中使用 `{{variableName}}` 标记，创建文件时会提示输入。

### 示例模板

**React Component (`react/Component.tsx`):**

```tsx
// {{filename}}.tsx
// Author: {{author}}
// Created: {{date}}

import React from 'react';

interface {{componentName}}Props {
  // TODO: add props
}

export const {{componentName}}: React.FC<{{componentName}}Props> = (props) => {
  return (
    <div>
      {/* TODO: implement */}
    </div>
  );
};
```

创建文件时，会提示输入 `componentName` 的值。

## 配置

| 配置项 | 说明 |
|--------|------|
| `fileTemplate.globalPath` | 全局模板目录路径 |
| `fileTemplate.author` | 作者名 |

## 快捷键

可以为命令添加自定义快捷键：

```json
{
  "key": "ctrl+shift+t",
  "command": "fileTemplate.createFile"
}
```
