import { TreeNode } from '@/lib/types';
import { TreeItem } from '../../molecules';

// eslint-disable-next-line no-unused-vars
type OnExpand = (node: TreeNode) => void;
type OnSelect = (node: TreeNode) => void;

interface FileTreeProperties {
	nodes: TreeNode[];
	onExpand?: OnExpand;
	onSelect?: OnSelect;
}

export function FileTree({ nodes, onExpand, onSelect }: FileTreeProperties) {
	return (
		<div>
			{nodes.map((item) => (
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
