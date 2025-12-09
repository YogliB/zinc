<script lang="ts">
	interface Props {
		variant?: 'primary' | 'secondary';
		children: any;
		[key: string]: any; // For other button props like onclick, disabled
	}

	let { variant = 'primary', children, ...rest }: Props = $props();

	let classes = $derived(
		variant === 'primary'
			? 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
			: 'px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600',
	);
</script>

<button class={classes} {...rest}>
	{@render children()}
</button>
