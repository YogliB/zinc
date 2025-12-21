import * as React from 'react';
import { GripVerticalIcon } from 'lucide-react';
import { Group, Panel, Separator } from 'react-resizable-panels';

import { cn } from '@/lib/utils/index';

function ResizablePanelGroup({
	className,
	...properties
}: React.ComponentProps<typeof Group>) {
	return (
		<Group
			className={cn(
				'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
				className,
			)}
			{...properties}
		/>
	);
}

function ResizablePanel({ ...properties }: React.ComponentProps<typeof Panel>) {
	return <Panel {...properties} />;
}

function ResizableHandle({
	withHandle,
	className,
	...properties
}: React.ComponentProps<typeof Separator> & {
	withHandle?: boolean;
	onDoubleClick?: () => void;
}) {
	return (
		<Separator
			className={cn(
				'bg-border relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90',
				className,
			)}
			{...properties}
		>
			{withHandle && (
				<div className="bg-border z-10 flex h-4 w-3 cursor-pointer items-center justify-center rounded-xs border">
					<GripVerticalIcon className="size-2.5" />
				</div>
			)}
		</Separator>
	);
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
