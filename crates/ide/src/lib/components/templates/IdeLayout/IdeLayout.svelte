<script lang="ts">
	interface Props {
		children: any;
	}

	let { children }: Props = $props();
</script>

<div class="h-screen w-screen grid grid-cols-[2fr_1fr] bg-gray-50">
	{@render children()}
</div>
