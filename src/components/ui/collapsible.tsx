import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import type { ComponentProps } from 'react';

function Collapsible({
	...properties
}: ComponentProps<typeof CollapsiblePrimitive.Root>) {
	return (
		<CollapsiblePrimitive.Root data-slot="collapsible" {...properties} />
	);
}

function CollapsibleTrigger({
	...properties
}: ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
	return (
		<CollapsiblePrimitive.CollapsibleTrigger
			data-slot="collapsible-trigger"
			{...properties}
		/>
	);
}

function CollapsibleContent({
	...properties
}: ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
	return (
		<CollapsiblePrimitive.CollapsibleContent
			data-slot="collapsible-content"
			{...properties}
		/>
	);
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
