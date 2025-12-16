import './app.css';

import { untracked, useSignal } from '@preact/signals';
import { Router, Route } from 'wouter-preact';
import { invoke } from '@tauri-apps/api/core';
import { WelcomePage } from './pages';
import { useEffect } from 'preact/hooks';

function App() {
	const osSignal = useSignal<'mac' | 'windows' | 'linux'>('linux');

	useEffect(() => {
		untracked(() => {
			invoke('get_os').then((result) => {
				if (result === 'macos') osSignal.value = 'mac';
				else if (result === 'windows') osSignal.value = 'windows';
				else osSignal.value = 'linux';
			});
		});
	}, []);

	return (
		<Router>
			<Route path="/">
				<WelcomePage os={osSignal.value} />
			</Route>
		</Router>
	);
}

export default App;
