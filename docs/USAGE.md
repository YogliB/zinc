# Usage

## Flowbite-Svelte Components

The zinc/ide project now includes the flowbite-svelte library, providing a collection of pre-built UI components based on Tailwind CSS and Flowbite. These components can be imported and used in Svelte pages for consistent styling and functionality.

For example, to use a Button component:

```svelte
<script>
  import { Button } from 'flowbite-svelte';
</script>

<Button>Click me</Button>
```

Refer to the [Flowbite Svelte Documentation](https://flowbite-svelte.com/) for a full list of available components and their usage.

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
