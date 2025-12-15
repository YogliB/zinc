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
						className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-48 rounded-md px-6"
					>
						Open Project
					</Button>
					<Button
						onClick={handleNewProject}
						className="bg-background hover:bg-accent hover:text-accent-foreground h-10 w-48 rounded-md border px-6 shadow-xs"
					>
						New Project
					</Button>
				</div>
			</div>
		</div>
	);
}
