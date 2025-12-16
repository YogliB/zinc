import { File, Folder } from 'lucide-react';

interface IconProperties {
	type: 'file' | 'folder';
	className?: string;
}

export function Icon({ type, className }: IconProperties) {
	const IconComponent = type === 'folder' ? Folder : File;
	return <IconComponent className={className} />;
}
