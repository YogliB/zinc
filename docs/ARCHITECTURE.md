# Architecture Overview

This document describes the architecture of the Zinc code editor, focusing on the multi-file editor implementation.

## Component Hierarchy

The application follows Atomic Design principles, organizing components into atoms, molecules, organisms, templates, and pages.

### Atoms

- **EditorTab**: Represents a single file tab with name display and close button
    - Props: `name`, `isActive`, `onSelect`, `onClose`
    - Displays file name with truncation for long names
    - Includes close button (X icon) with proper event handling

### Molecules

- **EditorTabs**: Orchestrates multiple EditorTab atoms using Shadcn Tabs component
    - Props: `openFiles`, `activeFilePath`, `onTabSelect`, `onTabClose`
    - Maps open files to tab triggers
    - Handles tab selection and close events
    - Shows empty state when no files are open

### Organisms

- **TabbedEditor**: Combines EditorTabs and CodeEditor for complete tabbed editing interface
    - Props: `openFiles`, `activeFilePath`, `activeContent`, `onTabSelect`, `onTabClose`, `onEditorChange`
    - Displays tabs at top, editor below
    - Shows empty state message when no files open
    - Passes active content to CodeEditor

- **FileTree**: Displays project file structure
    - Props: `nodes`, `onExpand`, `onSelect`
    - Handles folder expansion and file selection

- **CodeEditor**: CodeMirror-based editor component
    - Props: `value`, `onChange`
    - Provides syntax highlighting and editing capabilities

### Templates

- **EditorView**: Layout template combining FileTree and TabbedEditor
    - Props: `treeNodes`, `openFiles`, `activeFilePath`, `onExpand`, `onSelect`, `onTabSelect`, `onTabClose`, `onEditorChange`
    - Uses ResizablePanel for adjustable layout
    - Passes props to child components

### Pages

- **EditorPage**: Main application page
    - Manages project loading and file operations
    - Integrates with Tauri backend for file system access
    - Handles auto-save functionality

## State Management

The application uses Preact Signals for reactive state management.

### Global Signals

- `folderPath`: Current project folder path
- `treeNodes`: File tree structure
- `editorValue`: Legacy single-file content (deprecated)
- `selectedFilePath`: Legacy active file path (maintained for compatibility)
- `openFiles`: Array of currently open files
- `activeFilePath`: Path of currently active file

### Computed Signals

- `activeFileContent`: Content of the active file, derived from `openFiles` and `activeFilePath`

### State Management Functions

- `addOpenFile(path, name, content)`: Adds a file to open files and sets as active
- `removeOpenFile(path)`: Removes a file from open files, switches to next tab if needed
- `setActiveTab(path)`: Sets the active file path
- `resetEditorState()`: Clears all editor state

## Data Flow

1. **File Selection**: User clicks file in FileTree → `onSelect` → `handleSelect` checks if already open
2. **File Loading**: If new file → `loadFile` (Tauri invoke) → `addOpenFile` → updates `openFiles` and `activeFilePath`
3. **Tab Management**: Tab clicks → `onTabSelect` → `setActiveTab` → updates `activeFilePath`
4. **Content Editing**: Editor changes → `onEditorChange` → updates content in `openFiles` array
5. **Auto-save**: Debounced save → writes active file content to disk via Tauri

## Component Relationships

```
EditorPage
├── EditorView (template)
    ├── FileTree (organism)
    └── TabbedEditor (organism)
        ├── EditorTabs (molecule)
        │   └── EditorTab (atom) [multiple]
        └── CodeEditor (organism)
```

## Key Design Decisions

- **Atomic Design**: Components follow atoms → molecules → organisms hierarchy
- **Reactive State**: Preact Signals provide efficient reactivity
- **Multi-file Support**: Array-based open files with computed active content
- **Backward Compatibility**: Legacy signals maintained during transition
- **Tauri Integration**: File operations handled by Rust backend
- **Auto-save**: Debounced saving prevents excessive disk writes
- **UI Components**: Shadcn UI provides consistent, accessible components
