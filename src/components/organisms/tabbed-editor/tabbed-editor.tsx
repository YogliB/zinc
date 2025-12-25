/* eslint-disable no-unused-vars */ import { EditorTabs } from '@/components/molecules';
import { CodeEditor } from '@/components/organisms';
import { OpenFile } from '@/lib/types';

interface TabbedEditorProperties {
	openFiles: OpenFile[];
	activeFilePath: string | undefined;
	activeContent: string;
	onTabSelect: (path: string) => void;
	onTabClose: (path: string) => void;
	onEditorChange: (value: string) => void;
}

export function TabbedEditor({
	openFiles,
	activeFilePath,
	activeContent,
	onTabSelect,
	onTabClose,
	onEditorChange,
}: TabbedEditorProperties) {
	if (openFiles.length === 0) {
		return (
			<div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
				<p>
					No files open. Select a file from the tree to begin editing.
				</p>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			<EditorTabs
				openFiles={openFiles}
				activeFilePath={activeFilePath}
				onTabSelect={onTabSelect}
				onTabClose={onTabClose}
			/>
			<div className="flex-1 overflow-hidden">
				<CodeEditor value={activeContent} onChange={onEditorChange} />
			</div>
		</div>
	);
}
