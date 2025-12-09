<script lang="ts">
	import { Input } from 'flowbite-svelte';

	interface Props {
		value?: string;
		placeholder?: string;
		type?: string;
		[key: string]: any;
	}

	let {
		value = $bindable(''),
		placeholder = '',
		type = 'text',
		...rest
	}: Props = $props();
</script>

<Input bind:value {placeholder} {type} {...rest} />
