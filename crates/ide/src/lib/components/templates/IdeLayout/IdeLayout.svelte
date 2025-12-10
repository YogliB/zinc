<script lang="ts">
	interface Props {
		leftSidebar: any;
		main: any;
		rightSidebar: any;
	}

	let { leftSidebar, main, rightSidebar }: Props = $props();
</script>

<div class="h-screen w-screen grid grid-cols-[200px_auto_1fr] bg-gray-50">
	<div class="h-full">{@render leftSidebar()}</div>
	<div class="h-full">{@render main()}</div>
	<div class="h-full">{@render rightSidebar()}</div>
</div>
