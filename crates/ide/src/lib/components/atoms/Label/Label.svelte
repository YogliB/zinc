<script lang="ts">
	import { Label } from 'flowbite-svelte';

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

<Label for={htmlFor} class={className}>
	{@render children()}
</Label>
