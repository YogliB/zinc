import { X } from 'lucide-react';

interface EditorTabProperties {
	name: string;
	onClose: () => void;
}

export function EditorTab({ name, onClose }: EditorTabProperties) {
	return (
		<>
			<span className="max-w-32 truncate">{name}</span>
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
