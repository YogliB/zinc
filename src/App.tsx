import './App.css';
import { useEffect } from 'preact/hooks';
import { signal } from '@preact/signals';
import { Router, Route } from 'wouter-preact';
import { invoke } from '@tauri-apps/api/core';
import { WelcomePage } from './pages';

function App() {
	const osSignal = signal<'mac' | 'windows' | 'linux'>('linux');

	useEffect(() => {
		(invoke('get_os') as Promise<string>).then((result) => {
			if (result === 'macos') osSignal.value = 'mac';
			else if (result === 'windows') osSignal.value = 'windows';
			else osSignal.value = 'linux';
		});
	}, [osSignal]);

	return (
		<Router>
			<Route path="/">
				<WelcomePage os={osSignal.value} />
			</Route>
		</Router>
	);
}

export default App;
