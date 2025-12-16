import { render } from 'preact';
import App from './app';

const root = document.querySelector('#root');

if (root) {
	render(<App />, root);
}
