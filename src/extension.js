const vscode = require('vscode');

function activate(context) {
  let disposable = vscode.commands.registerCommand('extension.detectSensitiveInfo', () => {});
  context.subscriptions.push(disposable);

  const customKeywords = [
    "password",
    "secret",
    "api_key",
    "access_token",
    "private_key",
    "client_secret",
    "confidential",
    "jwt_secret",
    "database_password",
    "let var",
    "let const",
    "var const",
    "var let const",
    "var let",
    "let const var",
    "secretAccessKey",
    "AccessKey"
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
      const line = document.lineAt(i).text;
      if (line.includes("-----BEGIN RSA PRIVATE KEY-----") && line.includes("-----END RSA PRIVATE KEY-----")) {
        // Found a line with RSA key delimiters
        const startIndex = line.indexOf("-----BEGIN RSA PRIVATE KEY-----");
        const endIndex = line.indexOf("-----END RSA PRIVATE KEY-----") + "-----END RSA PRIVATE KEY-----".length;
        const range = new vscode.Range(i, startIndex, i, endIndex);
        decorations.push({ range, hoverMessage: 'RSA private key found' });
      }
      for (const keyword of customKeywords) {
        const regex = new RegExp(keyword, 'gi');
        let match;
        while ((match = regex.exec(line))) {
          const startIndex = match.index;
          const endIndex = startIndex + match[0].length;
          const range = new vscode.Range(i, startIndex, i, endIndex);
          decorations.push({ range, hoverMessage: `Sensitive info found: ${match[0]}` });
        }
      }
      if (line.includes("AKIA")) {
        // Found "AKIA" in the line, indicating a potential AWS Access Key
        const startIndex = line.indexOf("AKIA");
        const endIndex = startIndex + 16; // AWS Access Key format is AKIA followed by 12 alphanumeric characters
        const range = new vscode.Range(i, startIndex, i, endIndex);
        decorations.push({ range, hoverMessage: 'AWS Access key found' });
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
