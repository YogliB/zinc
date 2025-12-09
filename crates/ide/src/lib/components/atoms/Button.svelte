<script lang="ts">
	import { Button } from 'flowbite-svelte';

	interface Props {
		variant?: 'primary' | 'secondary';
		children: any;
		[key: string]: any; // For other button props like onclick, disabled
	}

	let { variant = 'primary', children, ...rest }: Props = $props();

	let color = $derived(
		variant === 'primary' ? ('blue' as const) : ('alternative' as const),
	);
</script>

<Button {color} {...rest}>
	{@render children()}
</Button>
