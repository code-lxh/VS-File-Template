# File Template

通过自定义模板快速创建文件。

## 功能

- 支持全局模板和项目级模板
- 支持变量替换（内置变量 + 自定义变量）
- 简洁的命令面板操作

## 首次使用

安装插件后首次使用时，会自动在全局模板目录创建以下示例模板：

- `react/Component.tsx` - React 组件模板
- `python/main.py` - Python 主文件模板
- `javascript/module.js` - JavaScript 模块模板
- `readme.md` - README 模板

你可以直接修改这些示例模板，或删除它们创建自己的模板。

## 使用

1. 安装插件后，示例模板会自动创建在 `~/.vscode-templates/`
2. 按 `Cmd/Ctrl+Shift+P` 打开命令面板
3. 输入 "Create File from Template"
4. 选择模板
5. 输入文件名
6. 如有自定义变量，依次输入变量值

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
