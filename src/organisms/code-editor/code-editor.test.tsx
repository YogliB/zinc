import { render, screen } from '@testing-library/preact';
import { describe, it, vi, expect } from 'vitest';

import { CodeEditor } from './code-editor';

describe('CodeEditor', () => {
	it('renders', () => {
		const mockOnChange = vi.fn();
		render(<CodeEditor value="" onChange={mockOnChange} />);
		expect(
			screen.getByText('', { selector: '.cm-editor' }),
		).toBeInTheDocument();
	});
});
