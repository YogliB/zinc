import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from '../../../components/ui/resizable';
import { FileTree, CodeEditor } from '../../../components/organisms';
import { TreeNode } from '../../../lib/types';
import { useGroupRef, usePanelRef } from 'react-resizable-panels';
import { useEffect } from 'preact/hooks';

interface EditorViewProperties {
	treeNodes: TreeNode[];
	editorValue: string;

	// eslint-disable-next-line no-unused-vars
	onExpand: (_node: TreeNode) => void;

	// eslint-disable-next-line no-unused-vars
	onSelect: (_node: TreeNode) => void;

	// eslint-disable-next-line no-unused-vars
	onEditorChange: (_value: string) => void;
}

export function EditorView({
	treeNodes,
	editorValue,
	onExpand,
	onSelect,
	onEditorChange,
}: EditorViewProperties) {
	const groupReference = useGroupRef();
	const fileTreeReference = usePanelRef();
	const codeEditorReference = usePanelRef();

	useEffect(() => {
		if (
			fileTreeReference.current &&
			codeEditorReference.current &&
			groupReference.current
		) {
			fileTreeReference.current?.resize(50);
			codeEditorReference.current?.resize(50);
			groupReference.current?.setLayout({
				'file-tree': 50,
			});
		}
	}, [fileTreeReference, codeEditorReference, groupReference]);

	return (
		<ResizablePanelGroup orientation="horizontal" className="h-screen">
			<ResizablePanel id="file-tree" defaultSize={30}>
				<div className="h-full overflow-auto p-4">
					<FileTree
						nodes={treeNodes}
						onExpand={onExpand}
						onSelect={onSelect}
					/>
				</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel id="code-editor" defaultSize={70}>
				<div className="flex h-full">
					<CodeEditor value={editorValue} onChange={onEditorChange} />
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
