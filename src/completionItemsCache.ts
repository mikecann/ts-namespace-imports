import * as vscode from "vscode";
import { uriToCompletionItem } from "./uriHelpers";
import {
  startsWithCapitalLetter,
  uriToFilename,
  isInNodeModules,
  uriToPath
} from "./utils";

let cache: Record<string, vscode.Uri[]> = {};

export async function refresh() {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders) return;

  for (let folder of folders) {
    const typescriptPattern = new vscode.RelativePattern(folder, "**/*.ts");

    const files = await vscode.workspace.findFiles(typescriptPattern);

    const items = files
      .filter(f => !isInNodeModules(uriToPath(f)))
      .filter(f => startsWithCapitalLetter(uriToFilename(f)));

    cache[folder.uri.path] = items;
  }
}

export function get(fromDocUri: vscode.Uri): vscode.CompletionList {
  const folder = vscode.workspace.getWorkspaceFolder(fromDocUri);
  if (!folder) return new vscode.CompletionList();

  const files = cache[folder.uri.path];
  if (!files) return new vscode.CompletionList();

  return new vscode.CompletionList(
    files.map(f => uriToCompletionItem(f, fromDocUri)),
    false
  );
}
