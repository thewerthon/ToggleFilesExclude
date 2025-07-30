import vscode from "vscode";

import { FilesExcludeManager } from "./files-exclude-manager";

export function activate(context) {
	context.subscriptions.push(
		vscode.commands.registerCommand(
			"toggleFilesExclude.toggle",
			FilesExcludeManager.toggleConfig,
		),
	);

	// for explorer icon
	context.subscriptions.push(
		FilesExcludeManager.watchConfiguration(),
		vscode.commands.registerCommand("toggleFilesExclude.show", FilesExcludeManager.show),
		vscode.commands.registerCommand("toggleFilesExclude.hide", FilesExcludeManager.hide),
	);
}
