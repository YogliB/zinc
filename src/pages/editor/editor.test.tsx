import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/preact';
import '@testing-library/jest-dom';
import { EditorPage } from './editor';

describe('EditorPage', () => {
	it('renders editor interface', () => {
		const { container } = render(<EditorPage />);

		expect(container).toBeInTheDocument();
	});
});
