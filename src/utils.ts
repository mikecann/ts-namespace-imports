import * as vscode from "vscode";
import * as Path from "path";

export const uriToFilename = (uri: vscode.Uri) => Path.basename(uri.path);

export const startsWithCapitalLetter = (str: string) => {
  if (str.length == 0) return false;
  return str[0] == str[0].toUpperCase();
};
