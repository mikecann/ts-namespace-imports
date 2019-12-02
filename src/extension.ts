import * as vscode from "vscode";
import * as CompletionItemsCache from "./completionItemsCache";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // On activation create a cache of all files in the system.
  CompletionItemsCache.refresh();

  // Whenever there is a change to the workspace folders refresh the cache
  // #Perf: This could be optimized if it proves to be slow but I assume it is rare
  let workspaceWatcher = vscode.workspace.onDidChangeWorkspaceFolders(CompletionItemsCache.refresh);

  // Whenever a file is added or removed refresh the cache
  // #Perf: This could be optimized
  let fileSystemWatcher = vscode.workspace.createFileSystemWatcher(
    "**/*.ts",
    false,
    true,
    false
  );
  
  fileSystemWatcher.onDidCreate(CompletionItemsCache.refresh);
  fileSystemWatcher.onDidDelete(CompletionItemsCache.refresh);

  let provider = vscode.languages.registerCompletionItemProvider(
    { scheme: "file", language: "typescript" },
    {
      provideCompletionItems(
        doc: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
      ) {
        const wordRange = doc.getWordRangeAtPosition(position);
        if (wordRange === undefined) {
          // Return an incomplete list to make sure vscode
          // asks us for more when the results are narrowed
          return new vscode.CompletionList([], true);
        }

        const word = doc.getText(wordRange);
        if (word.length < 1) {
          // Return an incomplete list to make sure vscode
          // asks us for more when the results are narrowed
          return new vscode.CompletionList([], true);
        }

        return CompletionItemsCache.get(doc.uri);
      }
    }
  );

  context.subscriptions.push(provider, fileSystemWatcher, workspaceWatcher);
}

// this method is called when your extension is deactivated
export function deactivate() {}
