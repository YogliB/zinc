import { render } from 'preact';
import App from './App';

const root = document.querySelector('#root');

if (root) {
	render(<App />, root);
}
