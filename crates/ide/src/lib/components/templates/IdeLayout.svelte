<script lang="ts">
	interface Props {
		children: any;
	}

	let { children }: Props = $props();
</script>

<div class="h-screen w-screen flex bg-gray-50">
	{@render children()}
</div>
