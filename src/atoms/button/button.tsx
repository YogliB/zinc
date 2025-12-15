export function Button({ children, className = '', ...props }) {
	return (
		<button className={`cursor-pointer ${className}`} {...props}>
			{children}
		</button>
	);
}
