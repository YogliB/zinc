import { TreeNode } from '../../lib/types';
import { Icon } from '../../atoms';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '../../components/ui/collapsible';

interface TreeItemProps {
	node: TreeNode;
	level?: number;
}

export function TreeItem({ node, level = 0 }: TreeItemProps) {
	return (
		<div style={{ paddingLeft: `${level * 20}px` }}>
			{node.type === 'folder' ? (
				<Collapsible defaultOpen={node.isExpanded ?? false}>
					<CollapsibleTrigger className="flex items-center gap-2">
						<Icon type={node.type} className="h-4 w-4" />
						{node.name}
					</CollapsibleTrigger>
					<CollapsibleContent>
						{node.children?.map((child) => (
							<TreeItem
								key={child.name}
								node={child}
								level={level + 1}
							/>
						))}
					</CollapsibleContent>
				</Collapsible>
			) : (
				<div className="flex items-center gap-2">
					<Icon type={node.type} className="h-4 w-4" />
					{node.name}
				</div>
			)}
		</div>
	);
}
