export interface TreeNode {
	name: string;
	type: 'file' | 'folder';
	children?: TreeNode[];
	path?: string;
	isExpanded?: boolean;
}

export interface OpenFile {
	path: string;
	name: string;
	content: string;
}
