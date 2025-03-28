const vscode = require("vscode");
const path = require("path");
const { pathEquals, initializeDocuments } = require("./src/utils");

let ready = false;
const lastUsedTimes = new Map();

//Create output channel
let orange = vscode.window.createOutputChannel("Orange");

async function showQuickPick() {
  const activeEditor = vscode.window.activeTextEditor;
  const activeFilePath = activeEditor
    ? activeEditor.document.uri?.fsPath
    : null;

  const allDocuments = vscode.workspace.textDocuments;
  const allDocumentsMap = allDocuments.reduce((acc, cur) => {
    acc[cur.uri.fsPath] = cur;
    return acc;
  }, {});

  const openedTabFilePaths = vscode.window.tabGroups.all
  .map(tabGroup => tabGroup.tabs.map(tab => {
    if (tab.input instanceof vscode.TabInputText) {
      return tab.input.uri.fsPath;
    }
  }))
  .flat()
  .filter(x => x !== undefined);

  const items = openedTabFilePaths
    .filter((p) => !pathEquals(p, activeFilePath))
    .map((p) => ({
      label: path.basename(p),
      description: vscode.workspace.asRelativePath(path.dirname(p), true),
      document: allDocumentsMap[p],
      lastUsed: lastUsedTimes.get(p) || 0,
    }))
    .sort((a, b) => b.lastUsed - a.lastUsed);
  
  const selected = await vscode.window.showQuickPick(items, {
    matchOnDescription: true,
  });
  if (selected) {
    const doc = await vscode.workspace.openTextDocument(selected.document.uri);
    await vscode.window.showTextDocument(doc);
  }
}

function activate(context) {
  const disposable = vscode.commands.registerCommand(
    "extension.ttabSearch",
    async () => {
      if (!ready) {
        ready = await initializeDocuments();
      }
      await showQuickPick();
    }
  );

  context.subscriptions.push(disposable);

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor?.document?.uri?.fsPath) {
        lastUsedTimes.set(editor.document.uri.fsPath, Date.now());
      }
    })
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
