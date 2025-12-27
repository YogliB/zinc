import { X } from 'lucide-react';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';

interface EditorTabProperties {
	name: string;
	path: string;
	onClose: () => void;
}

export function EditorTab({ name, path, onClose }: EditorTabProperties) {
	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<span className="max-w-32 truncate">{name}</span>
				</TooltipTrigger>
				<TooltipContent>{path}</TooltipContent>
			</Tooltip>
			<button
				className="ml-1 rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
				onClick={(event) => {
					event.stopPropagation();
					onClose();
				}}
				aria-label={`Close ${name}`}
			>
				<X size={14} />
			</button>
		</>
	);
}
