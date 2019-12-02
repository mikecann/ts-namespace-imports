import * as vscode from "vscode";
import * as Path from "path";
import * as ts from "typescript";
import { uriToCompletionItem } from "./uriHelpers";
import { startsWithCapitalLetter, uriToFilename } from "./utils";

let workspaceCompletionItems: vscode.CompletionList[] = [];

let cache: Record<string, vscode.Uri[]> = {};

export async function refresh() {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders) return;

  // workspaceCompletionItems = workspaceFolders.map(
  //   _ => new vscode.CompletionList([], true)
  // );

  for (let folder of folders) {
    const typescriptPattern = new vscode.RelativePattern(folder, "**/*.ts");

    const files = await vscode.workspace.findFiles(typescriptPattern);

    const items = files.filter(f => startsWithCapitalLetter(uriToFilename(f)));

    cache[folder.uri.path] = items;

    //   .map(uriToCompletionItem);

    // workspaceCompletionItems[folder.index] = new vscode.CompletionList(
    //   items,
    //   false
    // );
  }
}

// const _tsconfigDocumentToBaseUrl = (
//   tsconfigDoc: vscode.TextDocument
// ): string | null => {
//   const parseResults = ts.parseConfigFileTextToJson(
//     tsconfigDoc.fileName,
//     tsconfigDoc.getText()
//   );
//   const tsconfigObj = parseResults.config;
//   if (
//     "compilerOptions" in tsconfigObj &&
//     "baseUrl" in tsconfigObj["compilerOptions"]
//   ) {
//     return <string>tsconfigObj["compilerOptions"]["baseUrl"];
//   }
//   return null;
// };

// const _tsconfigUrisToBaseUrlMap = (workspaceFolder: vscode.WorkspaceFolder) => (
//   uris: vscode.Uri[]
// ): Thenable<Record<string, string>> => {
//   const recordPromises = Promise.all(
//     uris.map(tsconfigUri =>
//       vscode.workspace.openTextDocument(tsconfigUri).then(
//         tsconfigDoc => {
//           const maybeBaseUrl = _tsconfigDocumentToBaseUrl(tsconfigDoc);
//           return maybeBaseUrl
//             ? {
//                 [Path.relative(
//                   workspaceFolder.uri.path,
//                   Path.dirname(tsconfigUri.path)
//                 )]: maybeBaseUrl
//               }
//             : null;
//         },
//         error => {
//           console.error(`Error working with ${tsconfigUri.path}: ${error}`);
//         }
//       )
//     )
//   );
//   return recordPromises.then(
//     records =>
//       // We filter out nulls so it's pretty safe to cast.
//       <Record<string, string>>(
//         records.filter(r => r !== null).reduce((acc, r) => ({ ...acc, ...r }))
//       )
//   );
// };

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
