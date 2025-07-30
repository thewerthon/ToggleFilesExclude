import merge from "deepmerge";
import vscode from "vscode";

const SECTION = "files.exclude";
const CONTEXT_KEY = "toggleFilesExclude.isExcluded";

export class FilesExcludeManager {
	private static get isExcluded() {
		const mergedUserConfig = merge.all(
			FilesExcludeManager.configScopes.map(({ config }) => config),
		);
		return Object.values(mergedUserConfig).every((value) => value === true);
	}

	private static get configScopes(): ConfigScope[] {
		const extensionConfig = vscode.workspace.getConfiguration("toggleFilesExclude");
		const useGlobal = extensionConfig.get<boolean>("useGlobalScope");
		const useWorkspace = extensionConfig.get<boolean>("useWorkspaceScope");
		const useWorkspaceFolder = extensionConfig.get<boolean>("useWorkspaceFolderScope");

		const filesExcludeConfigInfo = vscode.workspace.getConfiguration().inspect(SECTION);
		const globalValue = filesExcludeConfigInfo?.globalValue ?? {};
		const workspaceValue = filesExcludeConfigInfo?.workspaceValue ?? {};
		const workspaceFolderValue = filesExcludeConfigInfo?.workspaceFolderValue ?? {};

		const activeScopes: ConfigScope[] = [];
		if (useGlobal) activeScopes.push({ config: globalValue, scope: vscode.ConfigurationTarget.Global });
		if (useWorkspace) activeScopes.push({ config: workspaceValue, scope: vscode.ConfigurationTarget.Workspace });
		if (useWorkspaceFolder) activeScopes.push({ config: workspaceFolderValue, scope: vscode.ConfigurationTarget.WorkspaceFolder });

		return activeScopes;
	}

	public static watchConfiguration() {
		vscode.commands.executeCommand("setContext", CONTEXT_KEY, FilesExcludeManager.isExcluded);
		return vscode.workspace.onDidChangeConfiguration((event) => {
			if (event.affectsConfiguration(SECTION)) {
				vscode.commands.executeCommand("setContext", CONTEXT_KEY, FilesExcludeManager.isExcluded);
			}
		});
	}

	public static toggleConfig(direction: boolean | null = null) {
		FilesExcludeManager.configScopes.forEach(({ config, scope }) =>
			FilesExcludeManager.toggleConfigByScope(
				config,
				direction ?? !FilesExcludeManager.isExcluded,
				scope,
			),
		);
	}

	public static show() {
		FilesExcludeManager.toggleConfig(false);
	}

	public static hide() {
		FilesExcludeManager.toggleConfig(true);
	}

	private static toggleConfigByScope(
		config: object,
		togglingDirection: boolean,
		configurationTarget: vscode.ConfigurationTarget,
	) {
		const configKeys = Object.keys(config);
		if (configKeys.length !== 0) {
			const toggledConfig = Object.fromEntries(configKeys.map((key) => [key, togglingDirection]));
			vscode.workspace.getConfiguration().update(SECTION, toggledConfig, configurationTarget);
		}
	}
}

interface ConfigScope {
	config: object;
	scope: vscode.ConfigurationTarget;
}
