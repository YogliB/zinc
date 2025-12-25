import { X } from 'lucide-react';

interface EditorTabProperties {
	name: string;
	isActive: boolean;
	onSelect: () => void;
	onClose: () => void;
}

export function EditorTab({
	name,
	isActive,
	onSelect,
	onClose,
}: EditorTabProperties) {
	return (
		<div
			className={`flex cursor-pointer items-center gap-2 border-b-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
				isActive
					? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
					: 'border-transparent'
			}`}
			onClick={onSelect}
		>
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
		</div>
	);
}
