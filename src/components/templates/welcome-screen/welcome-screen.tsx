import { Button } from '../../../components/atoms';
import { FolderOpen } from 'lucide-react';
import { Kbd } from '../../../components/ui/kbd';

interface WelcomeScreenProperties {
	os: 'mac' | 'windows' | 'linux';
	onOpenProject: () => void;
}

export function WelcomeScreen({ os, onOpenProject }: WelcomeScreenProperties) {
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
					<Button onClick={onOpenProject} size="lg" className="w-48">
						<FolderOpen className="mr-2 h-4 w-4" />
						Open Project
					</Button>
				</div>
				<p className="text-muted-foreground text-sm">
					Tip: Press{' '}
					{os === 'mac' ? (
						<>
							<Kbd>⌘</Kbd> <Kbd>O</Kbd>
						</>
					) : (
						<>
							<Kbd>Ctrl</Kbd> <Kbd>O</Kbd>
						</>
					)}{' '}
					to open a project.
				</p>
			</div>
		</div>
	);
}
