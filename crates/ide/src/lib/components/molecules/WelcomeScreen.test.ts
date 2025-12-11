import { render, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import WelcomeScreen from './WelcomeScreen.svelte';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('WelcomeScreen', () => {
  it('renders the welcome screen with correct elements on macOS', async () => {
    const { invoke } = await import('@tauri-apps/api/core');
    invoke.mockResolvedValue('macos');

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

    await waitFor(() => {
      expect(getByText('Tip: Use Cmd+O to open a folder or Cmd+Shift+O to open a file quickly.')).toBeInTheDocument();
    });
  });

  it('renders the welcome screen with correct elements on Windows/Linux', async () => {
    const { invoke } = await import('@tauri-apps/api/core');
    invoke.mockResolvedValue('windows');

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

    await waitFor(() => {
      expect(getByText('Tip: Use Ctrl+O to open a folder or Ctrl+Shift+O to open a file quickly.')).toBeInTheDocument();
    });
  });
});
