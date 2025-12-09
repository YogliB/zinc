<script lang="ts">
	import { Label, Input, Select } from '../atoms';

	interface Props {
		label: string;
		type?: 'input' | 'select';
		value?: string;
		placeholder?: string;
		inputType?: string;
		options?: { value: string; label: string }[];
		id?: string;
		[key: string]: any;
	}

	let {
		label,
		type = 'input',
		value = $bindable(''),
		placeholder = '',
		inputType = 'text',
		options = [],
		id,
		...rest
	}: Props = $props();
</script>

<div>
	<Label htmlFor={id}>
		{label}
	</Label>
	{#if type === 'input'}
		<Input bind:value {placeholder} type={inputType} {id} {...rest} />
	{:else if type === 'select'}
		<Select bind:value {options} {id} {...rest} />
	{/if}
</div>
