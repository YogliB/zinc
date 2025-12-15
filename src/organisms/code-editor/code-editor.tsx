import CodeMirror from '@uiw/react-codemirror';

export interface CodeEditorProps {
	value: string;
	onChange: (value: string) => void;
}

export function CodeEditor({ value, onChange }: CodeEditorProps) {
	return <CodeMirror value={value} onChange={onChange} height="400px" />;
}
