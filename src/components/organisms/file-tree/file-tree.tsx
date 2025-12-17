import { TreeNode } from '@/lib/types';
import { TreeItem } from '../../molecules';

// eslint-disable-next-line no-unused-vars
type OnExpand = (TreeNode) => void;

interface FileTreeProperties {
	nodes: TreeNode[];
	onExpand?: OnExpand;
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
