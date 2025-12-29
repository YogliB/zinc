import '@testing-library/jest-dom/vitest';

import { h } from 'preact';

// Mock lucide-react icons to return simple elements for testing
import { vi } from 'vitest';
vi.mock('lucide-react', () => ({
	FileIcon: (properties) => h('img', { role: 'img', ...properties }),
	FolderIcon: (properties) => h('img', { role: 'img', ...properties }),
	Folder: (properties) => h('img', { role: 'img', ...properties }),
	XIcon: (properties) => h('img', { role: 'img', ...properties }),
	X: (properties) => h('img', { role: 'img', ...properties }),
	FolderOpen: (properties) => h('img', { role: 'img', ...properties }),
	GripVerticalIcon: (properties) => h('img', { role: 'img', ...properties }),
	File: (properties) => h('img', { role: 'img', ...properties }),
}));

// Mock react-resizable-panels to prevent React hook conflicts
vi.mock('react-resizable-panels', () => ({
	PanelGroup: ({ children }) => children,
	Group: ({ children }) => children,
	Panel: ({ children }) => children,
	PanelResizeHandle: () => 'resize-handle',
	ResizableHandle: () => 'resize-handle',
	Separator: () => 'separator',
	usePanelRef: () => ({ current: undefined }),
	useGroupRef: () => ({ current: undefined }),
}));

// Mock radix-ui tooltip to avoid React hooks
vi.mock('@radix-ui/react-tooltip', () => ({
	Provider: ({ children }) => children,
	Root: ({ children }) => children,
	Trigger: ({ children }) => children,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	Content: () => {},
	Portal: ({ children }) => children,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	Arrow: () => {},
	Tooltip: ({ children }) => children,
	TooltipTrigger: ({ children }) => children,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	TooltipContent: () => {},
	TooltipProvider: ({ children }) => children,
}));

// Mock ui collapsible to avoid React hooks
vi.mock('@/components/ui/collapsible', () => ({
	Collapsible: ({ children, ...properties }) =>
		h('div', properties, children),
	CollapsibleTrigger: ({ children, ...properties }) =>
		h('div', properties, children),
	CollapsibleContent: ({ children, ...properties }) =>
		h('div', properties, children),
}));

// Mock ui tabs to avoid React hooks
vi.mock('@/components/ui/tabs', () => ({
	Tabs: ({ children, ...properties }) => h('div', properties, children),
	TabsList: ({ children, ...properties }) => h('div', properties, children),
	TabsTrigger: ({ children, ...properties }) =>
		h('button', properties, children),
	TabsContent: ({ children, ...properties }) =>
		h('div', properties, children),
}));

// Mock tauri plugin-log to avoid invoke calls in tests
vi.mock('@tauri-apps/plugin-log', () => ({
	warn: vi.fn(),
	debug: vi.fn(),
	trace: vi.fn(),
	info: vi.fn(),
	error: vi.fn(),
}));

// Mock @uiw/react-codemirror to avoid CodeMirror rendering issues
vi.mock('@uiw/react-codemirror', () => ({
	default: ({ value, onChange }) =>
		h(
			'div',
			{
				className: 'cm-editor',
				onInput: (event_) => onChange(event_.target.value),
			},
			value,
		),
}));

// Mock ui tooltip to avoid React hooks
vi.mock('@/components/ui/tooltip', () => ({
	Tooltip: ({ children, ...properties }) => h('div', properties, children),
	TooltipTrigger: ({ children, ...properties }) =>
		h('div', properties, children),
	TooltipContent: ({ children, ...properties }) =>
		h('div', properties, children),
	TooltipProvider: ({ children, ...properties }) =>
		h('div', properties, children),
}));

// Mock radix dialog to avoid React hooks
vi.mock('@radix-ui/react-dialog', () => ({
	Dialog: ({ children, ...properties }) => h('div', properties, children),
	DialogContent: ({ children, ...properties }) =>
		h('div', properties, children),
	DialogHeader: ({ children, ...properties }) =>
		h('div', properties, children),
	DialogTitle: ({ children, ...properties }) =>
		h('div', properties, children),
	DialogTrigger: ({ children, ...properties }) =>
		h('div', properties, children),
	DialogClose: ({ children, ...properties }) =>
		h('div', properties, children),
	DialogOverlay: ({ children, ...properties }) =>
		h('div', properties, children),
	DialogPortal: ({ children, ...properties }) =>
		h('div', properties, children),
}));

// Mock ui dialog
vi.mock('@/components/ui/dialog', () => ({
	Dialog: ({ children, ...properties }) => h('div', properties, children),
	DialogContent: ({ children, ...properties }) =>
		h('div', properties, children),
	DialogHeader: ({ children, ...properties }) =>
		h('div', properties, children),
	DialogTitle: ({ children, ...properties }) =>
		h('div', properties, children),
	DialogTrigger: ({ children, ...properties }) =>
		h('div', properties, children),
	DialogClose: ({ children, ...properties }) =>
		h('div', properties, children),
}));

// Mock ui input
vi.mock('@/components/ui/input', () => ({
	Input: (properties) => h('input', properties),
}));
