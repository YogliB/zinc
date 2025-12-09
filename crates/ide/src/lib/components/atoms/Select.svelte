<script lang="ts">
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
</script>

<select bind:value class="w-full p-2 border rounded" {...rest}>
	{#each options as option (option.value)}
		<option value={option.value}>{option.label}</option>
	{/each}
</select>
