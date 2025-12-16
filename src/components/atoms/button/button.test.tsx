import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/preact';
import { Button } from './button';

describe('Button', () => {
	it('renders children correctly', () => {
		const { getByText } = render(<Button>Click me</Button>);
		expect(getByText('Click me')).toBeInTheDocument();
	});

	it('has pointer cursor by default', () => {
		const { getByRole } = render(<Button>Click me</Button>);
		const button = getByRole('button');
		expect(button).toHaveClass('cursor-pointer');
	});

	it('applies additional className', () => {
		const { getByRole } = render(
			<Button className="bg-blue-500">Click me</Button>,
		);
		const button = getByRole('button');
		expect(button).toHaveClass('cursor-pointer');
		expect(button).toHaveClass('bg-blue-500');
	});
});
