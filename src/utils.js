const vscode = require("vscode");

const isMacintosh = process.platform === "darwin";
const isWindows = process.platform === "win32";

function normalizePath(path) {
  if (isWindows || isMacintosh) {
    return path.toLowerCase();
  }
  return path;
}

function pathEquals(a, b) {
  return normalizePath(a) === normalizePath(b);
}

async function initializeDocuments() {
  // restored tabs don't automatically restore text documents
  for (const tabGroup of vscode.window.tabGroups.all) {
    for (const tab of tabGroup.tabs) {
      if (tab.input instanceof vscode.TabInputText) {
        await vscode.workspace.openTextDocument(tab.input.uri).catch(() => {});
      }
    }
  }
  return true;
}

module.exports = {
  normalizePath,
  pathEquals,
  initializeDocuments,
};
