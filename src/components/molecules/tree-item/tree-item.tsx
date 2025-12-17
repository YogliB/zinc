import { TreeNode } from '@/lib/types';
import { Icon } from '../../atoms';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface TreeItemProperties {
	node: TreeNode;
	level?: number;
	// eslint-disable-next-line no-unused-vars
	onExpand?: (item: TreeNode) => void;
}

export function TreeItem({ node, level = 0, onExpand }: TreeItemProperties) {
	return (
		<div style={{ paddingLeft: `${level * 20}px` }}>
			{node.type === 'folder' ? (
				<Collapsible
					defaultOpen={node.isExpanded ?? false}
					onOpenChange={(open) => {
						if (
							open &&
							node.type === 'folder' &&
							(!node.children || node.children.length === 0)
						) {
							onExpand?.(node);
						}
					}}
				>
					<CollapsibleTrigger className="flex items-center gap-2">
						<Icon type={node.type} className="h-4 w-4" />
						{node.name}
					</CollapsibleTrigger>
					<CollapsibleContent>
						{node.children?.map((child: TreeNode) => (
							<TreeItem
								key={child.name}
								node={child}
								level={level + 1}
								onExpand={onExpand}
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
