export interface ExampleTemplate {
  category: string;
  filename: string;
  content: string;
}

export const exampleTemplates: ExampleTemplate[] = [
  {
    category: 'react',
    filename: 'Component.tsx',
    content: `// {{filename}}.tsx
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
`
  },
  {
    category: 'python',
    filename: 'main.py',
    content: `#!/usr/bin/env python3
# {{filename}}.py
# Author: {{author}}
# Created: {{date}}

def main():
    """Main entry point."""
    pass

if __name__ == '__main__':
    main()
`
  },
  {
    category: 'javascript',
    filename: 'module.js',
    content: `/**
 * {{filename}}.js
 * Author: {{author}}
 * Created: {{date}}
 */

/**
 * TODO: Add module description
 */

export function {{functionName}}() {
  // TODO: implement
}
`
  },
  {
    category: '',
    filename: 'readme.md',
    content: `# {{filename}}

Author: {{author}}
Created: {{date}}

## Description

TODO: Add description

## Usage

\`\`\`
TODO: Add usage example
\`\`\`
`
  }
];
