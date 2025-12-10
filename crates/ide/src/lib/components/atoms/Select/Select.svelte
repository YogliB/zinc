<script lang="ts">
	import { Select } from 'flowbite-svelte';

	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		value?: string;
		options: Option[];
		[key: string]: any;
	}

	let { value = $bindable(''), options, ...rest }: Props = $props();

	let items = $derived(
		options.map((opt) => ({ value: opt.value, name: opt.label })),
	);
</script>

<Select {items} bind:value {...rest} />
