import { Button as ShadcnButton } from '@/components/ui/button';

export function Button({ className = '', ...props }) {
	return (
		<ShadcnButton className={`cursor-pointer ${className}`} {...props} />
	);
}
