<script lang="ts">
	interface Props {
		htmlFor?: string;
		children: any;
		class?: string;
	}

	let {
		htmlFor,
		children,
		class: className = 'block text-sm',
	}: Props = $props();
</script>

<label for={htmlFor} class={className}>
	{@render children()}
</label>
