import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { Icon } from './icon';

describe('Icon', () => {
	it('renders file icon', () => {
		render(<Icon type="file" />);
		expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
	});

	it('renders folder icon', () => {
		render(<Icon type="folder" />);
		expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
	});

	it('applies className', () => {
		const className = 'test-class';
		render(<Icon type="file" className={className} />);
		const icon = screen.getByRole('img', { hidden: true });
		expect(icon).toHaveClass(className);
	});
});
