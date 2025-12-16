import { File, Folder } from 'lucide-react';

interface IconProps {
	type: 'file' | 'folder';
	className?: string;
}

export function Icon({ type, className }: IconProps) {
	const IconComponent = type === 'folder' ? Folder : File;
	return <IconComponent className={className} />;
}
