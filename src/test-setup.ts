import '@testing-library/jest-dom/vitest';

// Mock lucide-react icons to return simple elements for testing
import { vi } from 'vitest';
vi.mock('lucide-react', () => ({
	FileIcon: () => 'file-icon',
	FolderIcon: () => 'folder-icon',
	XIcon: () => 'x-icon',
	X: () => 'x-icon',
	FolderOpen: () => 'folder-open-icon',
	GripVerticalIcon: () => 'grip-icon',
}));

// Ensure React is mapped to Preact in tests
import * as preactCompat from '@preact/compat';
import * as preactJsxRuntime from '@preact/jsx-runtime';
vi.mock('react', () => preactCompat);
vi.mock('react-dom', () => preactCompat);
vi.mock('react/jsx-runtime', () => preactJsxRuntime);

// Mock react-resizable-panels to prevent React hook conflicts
vi.mock('react-resizable-panels', () => ({
	PanelGroup: ({ children }) => children,
	Panel: ({ children }) => children,
	PanelResizeHandle: () => 'resize-handle',
	usePanelRef: () => ({ current: undefined }),
	useGroupRef: () => ({ current: undefined }),
}));
