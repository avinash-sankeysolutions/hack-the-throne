const vscode = require('vscode');
function activate(context) {
  let disposable = vscode.commands.registerCommand('extension.detectSensitiveInfo', () => {
  });
  context.subscriptions.push(disposable);
  let customKeywords = [
    "password",
    "secret",
    "api_key",
    "access_token",
    "private_key",
    "client_secret",
    "confidential",
    "jwt_secret",
    "database_password"
  ];
  const sensitiveInfoDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  });

  const camelCaseSuggestionDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(0, 255, 0, 0.3)',
  });

  let suggestNamingDisposable = vscode.commands.registerCommand('extension.suggestNamingConventions', () => {
    if (activeEditor) {
      suggestNamingConventionsForDocument(activeEditor.document);
    }
  });
  context.subscriptions.push(suggestNamingDisposable);

  let activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    triggerUpdateDecorations();
  }

  vscode.window.onDidChangeActiveTextEditor(editor => {
    activeEditor = editor;
    if (editor) {
      triggerUpdateDecorations();
    }
  });

  vscode.workspace.onDidChangeTextDocument(event => {
    if (activeEditor && event.document === activeEditor.document) {
      triggerUpdateDecorations();
    }
  });

  function triggerUpdateDecorations() {
    if (!activeEditor) {
      return;
    }
    const { document } = activeEditor;
    const decorations = [];

    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      for (const keyword of customKeywords) {
        const regex = new RegExp(keyword, 'gi');
        let match;
        while ((match = regex.exec(line.text))) {
          const startIndex = match.index;
          const endIndex = startIndex + match[0].length;
          const range = new vscode.Range(i, startIndex, i, endIndex);
          decorations.push({ range, hoverMessage: `Sensitive info found: ${match[0]}` });
        }
      }
    }

    activeEditor.setDecorations(sensitiveInfoDecorationType, decorations);
  }

  vscode.workspace.onDidOpenTextDocument(document => {
    suggestNamingConventionsForDocument(document);
  });
  function suggestNamingConventionsForDocument(document) {
    if (!document) {
      return;
    }
    const suggestions = [];
    const camelCaseRegex = /\b[a-z][A-Z][a-zA-Z]*\b/g;

    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i).text;
      const matches = line.match(camelCaseRegex);
      if (matches) {
        for (const match of matches) {
          suggestions.push({
            range: new vscode.Range(i, line.indexOf(match), i, line.indexOf(match) + match.length),
            hoverMessage: `Consider using camelCase for "${match}".`,
          });
        }
      }
    }
    suggestions.push(
      {
        range: new vscode.Range(0, 0, 0, 10),
        hoverMessage: 'Consider using camelCase for variable names.'
      },
      {
        range: new vscode.Range(1, 0, 1, 15),
        hoverMessage: 'Camel casing is recommended for function names.'
      }
    );
    activeEditor.setDecorations(camelCaseSuggestionDecorationType, suggestions);
  }
}
exports.activate = activate;

