import { signal } from '@preact/signals';

export type AppMode = 'welcome' | 'editor';

export const appMode = signal<AppMode>('welcome');
