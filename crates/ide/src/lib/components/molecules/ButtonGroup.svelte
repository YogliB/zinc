<script lang="ts">
	interface Props {
		children: any;
	}

	let { children }: Props = $props();
</script>

<div class="flex gap-2">
	{@render children()}
</div>
