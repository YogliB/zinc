import { TreeNode } from '@/lib/types';
import { TreeItem } from '../../molecules';

interface FileTreeProperties {
	nodes: TreeNode[];
}

export function FileTree({ nodes }: FileTreeProperties) {
	return (
		<div>
			{nodes.map((node) => (
				<TreeItem key={node.name} node={node} />
			))}
		</div>
	);
}
