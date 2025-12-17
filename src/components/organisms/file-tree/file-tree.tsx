/* eslint-disable no-unused-vars */
import { TreeNode } from '@/lib/types';
import { TreeItem } from '../../molecules';

interface FileTreeProperties {
	nodes: TreeNode[];
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
