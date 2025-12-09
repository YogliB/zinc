<script lang="ts">
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

<input
	bind:value
	class="w-full p-2 border rounded"
	{placeholder}
	{type}
	{...rest}
/>
