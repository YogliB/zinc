import './App.css';
import { Router, Route } from 'wouter-preact';
import { WelcomePage } from './pages';

function App() {
	return (
		<Router>
			<Route path="/" component={WelcomePage} />
		</Router>
	);
}

export default App;
