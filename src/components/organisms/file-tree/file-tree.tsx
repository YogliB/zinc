import { TreeNode } from '@/lib/types';
import { TreeItem } from '../../molecules';

// eslint-disable-next-line no-unused-vars
type OnExpand = (node: TreeNode) => void;
// eslint-disable-next-line no-unused-vars
type OnSelect = (node: TreeNode) => void;

interface FileTreeProperties {
	nodes: TreeNode[];
	onExpand?: OnExpand;
	onSelect?: OnSelect;
}

export function FileTree({ nodes, onExpand, onSelect }: FileTreeProperties) {
	const folders = nodes
		.filter((node) => node.type === 'folder' && node.name !== '.git')
		.toSorted((a: TreeNode, b: TreeNode) => a.name.localeCompare(b.name));
	const files = nodes
		.filter((node) => node.type === 'file' && node.name !== '.git')
		.toSorted((a: TreeNode, b: TreeNode) => a.name.localeCompare(b.name));
	const processedNodes = [...folders, ...files];

	return (
		<div>
			{processedNodes.map((item) => (
				<TreeItem
					key={item.name}
					node={item}
					onExpand={onExpand}
					onSelect={onSelect}
				/>
			))}
		</div>
	);
}
