import { TreeNode } from '@/lib/types';
import { TreeItem } from '../../molecules';

interface FileTreeProperties {
	nodes: TreeNode[];
	// eslint-disable-next-line no-unused-vars
	onExpand?: (item: TreeNode) => void;
}

export function FileTree({ nodes, onExpand }: FileTreeProperties) {
	return (
		<div>
			{nodes.map((item) => (
				<TreeItem key={item.name} node={item} onExpand={onExpand} />
			))}
		</div>
	);
}
