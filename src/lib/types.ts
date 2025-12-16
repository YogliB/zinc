export interface TreeNode {
	name: string;
	type: 'file' | 'folder';
	children?: TreeNode[];
	path?: string;
	isExpanded?: boolean;
}
