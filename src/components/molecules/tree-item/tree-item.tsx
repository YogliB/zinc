import { TreeNode } from '@/lib/types';
import { Icon } from '../../atoms';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';

// eslint-disable-next-line no-unused-vars
type OnExpand = (node: TreeNode) => void;

interface TreeItemProperties {
	node: TreeNode;
	level?: number;
	onExpand?: OnExpand;
	onSelect?: (node: TreeNode) => void;
}

export function TreeItem({
	node,
	level = 0,
	onExpand,
	onSelect,
}: TreeItemProperties) {
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
								onSelect={onSelect}
							/>
						))}
					</CollapsibleContent>
				</Collapsible>
			) : (
				<div
					className="flex cursor-pointer items-center gap-2"
					onClick={() => onSelect?.(node)}
				>
					<Icon type={node.type} className="h-4 w-4" />
					{node.name}
				</div>
			)}
		</div>
	);
}
