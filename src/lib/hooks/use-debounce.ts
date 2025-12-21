import { useEffect, useRef } from 'preact/hooks';

export function useDebounce(callback: () => void, delay: number): () => void {
	const timeoutReference = useRef<number | null>(null);

	useEffect(() => {
		return () => {
			if (timeoutReference.current) {
				clearTimeout(timeoutReference.current);
			}
		};
	}, []);

	const debouncedCallback = () => {
		if (timeoutReference.current) {
			clearTimeout(timeoutReference.current);
		}
		timeoutReference.current = setTimeout(() => {
			callback();
		}, delay);
	};

	return debouncedCallback;
}
