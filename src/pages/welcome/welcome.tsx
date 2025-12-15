import { Button } from '../../atoms';
import { FolderOpen } from 'lucide-react';

export function WelcomePage() {
	const handleOpenProject = () => {
		console.log('Open project clicked');
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
						<FolderOpen className="mr-2 h-4 w-4" />
						Open Project
					</Button>
				</div>
				<p className="text-muted-foreground text-sm">
					Tip: Press Cmd+O (Mac) or Ctrl+O (Windows/Linux) to open a
					project.
				</p>
			</div>
		</div>
	);
}
