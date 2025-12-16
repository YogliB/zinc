import { Button as ShadcnButton } from '@/components/ui/button';

export function Button({ className = '', ...properties }) {
	return (
		<ShadcnButton
			className={`cursor-pointer ${className}`}
			{...properties}
		/>
	);
}
