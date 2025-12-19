import CodeMirror from '@uiw/react-codemirror';

export interface CodeEditorProperties {
	value: string;
	// eslint-disable-next-line no-unused-vars
	onChange: (value: string) => void;
}

export function CodeEditor({ value, onChange }: CodeEditorProperties) {
	return (
		<CodeMirror
			value={value}
			onChange={onChange}
			height="100%"
			className="grow"
		/>
	);
}
