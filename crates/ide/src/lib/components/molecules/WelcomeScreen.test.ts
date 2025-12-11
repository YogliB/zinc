import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import WelcomeScreen from './WelcomeScreen.svelte';

describe('WelcomeScreen', () => {
  it('renders the welcome screen with correct elements', () => {
    const { getByText, getByRole } = render(WelcomeScreen, {
      props: {
        onOpenFolder: () => {},
        onOpenFile: () => {},
        version: 'v0.1.0',
      },
    });

    expect(getByText('🚀')).toBeInTheDocument();
    expect(getByText('Welcome to Zinc IDE')).toBeInTheDocument();
    expect(getByText('v0.1.0')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Open Folder' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Open File' })).toBeInTheDocument();
    expect(getByText('Tip: Use Cmd+O to open a folder quickly.')).toBeInTheDocument();
  });
});
