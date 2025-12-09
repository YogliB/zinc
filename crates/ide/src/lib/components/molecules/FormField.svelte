<script lang="ts">
	import { Label, Input, Select } from '../atoms';

	interface Props {
		label: string;
		type?: 'input' | 'select';
		value?: string;
		placeholder?: string;
		inputType?: string;
		options?: { value: string; label: string }[];
		for?: string;
		[key: string]: any;
	}

	let {
		label,
		type = 'input',
		value = $bindable(''),
		placeholder = '',
		inputType = 'text',
		options = [],
		for: forId,
		...rest
	}: Props = $props();
</script>

<div>
	<Label for={forId}>
		{label}
	</Label>
	{#if type === 'input'}
		<Input bind:value {placeholder} type={inputType} id={forId} {...rest} />
	{:else if type === 'select'}
		<Select bind:value {options} id={forId} {...rest} />
	{/if}
</div>
