<script lang="ts">
	import '../app.css';
	import '../lib/logger';
	import { Snippet } from 'svelte';

	let { children } = $props<{ children: Snippet }>();
</script>

{@render children()}
