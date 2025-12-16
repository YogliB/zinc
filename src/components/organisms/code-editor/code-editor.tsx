import CodeMirror from '@uiw/react-codemirror';

export interface CodeEditorProperties {
	value: string;
	onChange: (value: string) => void;
}

export function CodeEditor({ value, onChange }: CodeEditorProperties) {
	return <CodeMirror value={value} onChange={onChange} height="400px" />;
}
