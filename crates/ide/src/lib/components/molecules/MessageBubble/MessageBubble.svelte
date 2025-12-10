<script lang="ts">
	import { P } from 'flowbite-svelte';

	interface Props {
		role: 'user' | 'assistant';
		content: string;
	}

	let { role, content }: Props = $props();

	let bgClass = $derived(role === 'user' ? 'bg-blue-100' : 'bg-gray-100');
</script>

<div class="p-2 rounded {bgClass}">
	<strong>{role}:</strong>
	<P class="m-0">{content}</P>
</div>
