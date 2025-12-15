import { Button } from '@/atoms';

export function WelcomePage() {
	const handleOpenProject = () => {
		console.log('Open project clicked');
	};

	const handleNewProject = () => {
		console.log('New project clicked');
	};

	return (
		<div className="bg-background flex min-h-screen flex-col items-center justify-center">
			<div className="space-y-8 text-center">
				<h1 className="text-foreground text-4xl font-bold">
					Welcome to Zinc IDE
				</h1>
				<p className="text-muted-foreground text-lg">
					Start coding with a powerful, functional IDE built for
					developers.
				</p>
				<div className="space-y-4">
					<Button
						onClick={handleOpenProject}
						size="lg"
						className="w-48"
					>
						Open Project
					</Button>
					<Button
						onClick={handleNewProject}
						variant="outline"
						size="lg"
						className="w-48"
					>
						New Project
					</Button>
				</div>
			</div>
		</div>
	);
}
