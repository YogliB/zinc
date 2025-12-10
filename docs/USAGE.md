# Usage

## UI Components

The zinc/ide project uses custom UI components built on top of the flowbite-svelte library, providing consistent styling and functionality based on Tailwind CSS and Flowbite. These components are available in the `$lib/components` directory and can be imported for use in Svelte pages.

For example, to use a Button component:

```svelte
<script>
  import { Button } from '$lib/components/atoms';
</script>

<Button>Click me</Button>
<Button variant="secondary">Secondary</Button>
```

The components include atoms (Button, Input, Select, Label), molecules (FormField, MessageBubble, ButtonGroup), organisms (ChatPanel, SettingsPanel, CodeEditor), and templates (IdeLayout).

Refer to the [Flowbite Svelte Documentation](https://flowbite-svelte.com/) for details on the underlying components and their props.

## Storybook

The Zinc IDE uses Storybook for component development and testing. Storybook provides an isolated environment to view and interact with UI components.

### Running Storybook

To start Storybook:

```bash
cd crates/ide
bun run storybook
```

This will launch Storybook at `http://localhost:6006` (or the next available port).

### Component Stories

Each component has dedicated stories showcasing different states and props. Stories are organized by atomic design levels:

- **Atoms**: Basic components like Button, Input
- **Molecules**: Composite components like FormField, MessageBubble
- **Organisms**: Complex components like ChatPanel, CodeEditor
- **Templates**: Layout components like IdeLayout

Use Storybook to test component variations, check accessibility, and ensure consistent behavior before integrating into the main app.

## Agent Chat

The Zinc IDE includes an AI chat feature powered by OpenRouter, allowing you to interact with an AI assistant that can perform file operations and run commands.

### Setup

1. Obtain an API key from [OpenRouter](https://openrouter.ai/).
2. In the IDE's settings panel (right sidebar), enter your API key and select a model.
3. Ensure "Enable AI" is checked.

### Usage

- Type messages in the chat input at the bottom of the right sidebar.
- The AI can respond to queries and execute tools like reading files, writing files, listing directories, or running commands.
- Example messages:
    - "read file.txt" - Reads and displays the content of `file.txt`.
    - "list files in ." - Lists files in the current directory.
    - "write to output.txt with content 'Hello World'" - Writes "Hello World" to `output.txt`.
    - "run command ls with args -la" - Runs `ls -la` and shows the output.

### Notes

- The AI uses shared tools identical to the MCP server.
- If AI is disabled in settings, chat sends will be blocked.
- Errors (e.g., invalid API key, tool failures) will be displayed in alerts.

## Opening Files

The Zinc IDE allows you to open files from your file system for editing in the CodeMirror editor.

### Usage

1. Click the "Open File" button in the top toolbar.
2. Use the file picker dialog to select a file.
3. The file content will be loaded and displayed in the editor.

### Notes

- Files larger than 1MB cannot be opened to prevent performance issues.
- If an error occurs (e.g., file not found, permission denied), an alert will be displayed.
- Currently, only text files are supported for editing.

## Opening Folders

The Zinc IDE allows you to open folders to view their structure in a file tree sidebar on the left.

### Usage

1. Click the "Open Folder" button in the main content area.
2. Use the folder picker dialog to select a folder.
3. The folder's file tree will be displayed in the left sidebar, showing folders and files recursively.

### Notes

- Selecting items in the file tree does not open files yet.
- If an error occurs during folder opening or reading, it will be logged to the console.
- The layout adjusts to accommodate the file tree in the left sidebar.
