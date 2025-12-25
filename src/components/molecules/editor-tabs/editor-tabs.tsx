/* eslint-disable no-unused-vars */ import {
	Tabs,
	TabsList,
	TabsTrigger,
} from '@/components/ui/tabs';
import { EditorTab } from '@/components/atoms';
import { OpenFile } from '@/lib/types';

interface EditorTabsProperties {
	openFiles: OpenFile[];
	activeFilePath: string | undefined;
	onTabSelect: (path: string) => void;
	onTabClose: (path: string) => void;
}

export function EditorTabs({
	openFiles,
	activeFilePath,
	onTabSelect,
	onTabClose,
}: EditorTabsProperties) {
	if (openFiles.length === 0) {
		return;
	}

	return (
		<Tabs value={activeFilePath} onValueChange={onTabSelect}>
			<TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
				{openFiles.map((file) => (
					<TabsTrigger
						key={file.path}
						value={file.path}
						className="border-b-2 border-transparent p-0 data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20"
					>
						<div
							className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
							onClick={() => onTabSelect(file.path)}
						>
							<EditorTab
								name={file.name}
								onClose={() => onTabClose(file.path)}
							/>
						</div>
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}
