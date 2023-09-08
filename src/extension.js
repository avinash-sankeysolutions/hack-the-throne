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









// const vscode = require('vscode');

// function activate(context) {
//   let disposable = vscode.commands.registerCommand('extension.detectSensitiveInfo', () => {
//     // Your code for detecting sensitive information here
//   });
//   context.subscriptions.push(disposable);

//   let customKeywords = [
//     "password",
//     "secret",
//     "api_key",
//     "access_token",
//     "private_key",
//     "client_secret",
//     "confidential",
//     "jwt_secret",
//     "database_password"
//   ];

//   const sensitiveInfoDecorationType = vscode.window.createTextEditorDecorationType({
//     backgroundColor: 'rgba(255, 0, 0, 0.3)',
//   });

//   // Register a command for suggesting naming conventions
//   let suggestNamingDisposable = vscode.commands.registerCommand('extension.suggestNamingConventions', () => {
//     if (activeEditor) {
//       suggestNamingConventionsForDocument(activeEditor.document);
//     }
//   });
//   context.subscriptions.push(suggestNamingDisposable);

//   var iam_camel =  "samiksha"

//   let activeEditor = vscode.window.activeTextEditor;
//   if (activeEditor) {
//     triggerUpdateDecorations();
//   }

//   vscode.window.onDidChangeActiveTextEditor(editor => {
//     activeEditor = editor;
//     if (editor) {
//       triggerUpdateDecorations();
//     }
//   });

//   vscode.workspace.onDidChangeTextDocument(event => {
//     if (activeEditor && event.document === activeEditor.document) {
//       triggerUpdateDecorations();
//     }
//   });

//   function triggerUpdateDecorations() {
//     if (!activeEditor) {
//       return;
//     }

//     const { document } = activeEditor;
//     const decorations = [];

//     for (let i = 0; i < document.lineCount; i++) {
//       const line = document.lineAt(i);
//       for (const keyword of customKeywords) {
//         const regex = new RegExp(keyword, 'gi');
//         let match;
//         while ((match = regex.exec(line.text))) {
//           const startIndex = match.index;
//           const endIndex = startIndex + match[0].length;
//           const range = new vscode.Range(i, startIndex, i, endIndex);
//           decorations.push({ range, hoverMessage: `Sensitive info found: ${match[0]}` });
//         }
//       }
//     }

//     activeEditor.setDecorations(sensitiveInfoDecorationType, decorations);
//   }

//   // Suggest naming conventions when a document is opened
//   vscode.workspace.onDidOpenTextDocument(document => {
//     suggestNamingConventionsForDocument(document);
//   });

//   function suggestNamingConventionsForDocument(document) {
//     if (!document) {
//       return;
//     }

//     const suggestions = [];
//     const camelCaseRegex = /[a-z][A-Z]/g; // Matches non-camelCase

//     for (let i = 0; i < document.lineCount; i++) {
//       const line = document.lineAt(i).text;
//       const matches = line.match(camelCaseRegex);
//       if (matches) {
//         for (const match of matches) {
//           suggestions.push({
//             range: new vscode.Range(i, line.indexOf(match), i, line.indexOf(match) + match.length),
//             hoverMessage: `Consider using camelCase for "${match}".`,
//           });
//         }
//       }
//     }
//     suggestions.push(
//       {
//         range: new vscode.Range(0, 0, 0, 10),
//         hoverMessage: 'Consider using camelCase for variable names.'
//       },
//       {
//         range: new vscode.Range(1, 0, 1, 15),
//         hoverMessage: 'Camel casing is recommended for function names.'
//       }
//     );



//     activeEditor.setDecorations(camelCaseSuggestionDecorationType, suggestions);
//   }
// }

// exports.activate = activate;










// // const vscode = require('vscode');

// // function activate(context) {
// //   let disposable = vscode.commands.registerCommand('extension.detectSensitiveInfo', () => {
// //   });
// //   context.subscriptions.push(disposable);
  
// //   let customKeywords = ["password",
// //     "secret ",
// //     "api_key",
// //     "access_token",
// //     "private_key",
// //     "client_secret",
// //     "confidential",
// //     "jwt_secret",
// //     "database_password"];

// //   const sensitiveInfoDecorationType = vscode.window.createTextEditorDecorationType({
// //     backgroundColor: 'rgba(255, 0, 0, 0.3)',
// //   });

// //   let activeEditor = vscode.window.activeTextEditor;
// //   if (activeEditor) {
// //     triggerUpdateDecorations();
// //   }

// //   vscode.window.onDidChangeActiveTextEditor(editor => {
// //     activeEditor = editor;
// //     if (editor) {
// //       triggerUpdateDecorations();
// //     }
// //   });

// //   var mypassword = "hehe"

// //   vscode.workspace.onDidChangeTextDocument(event => {
// //     if (activeEditor && event.document === activeEditor.document) {
// //       triggerUpdateDecorations();
// //     }
// //   });

// //   function triggerUpdateDecorations() {
// //     if (!activeEditor) {
// //       return;
// //     }

// //     const { document } = activeEditor;
// //     const decorations = [];

// //     for (let i = 0; i < document.lineCount; i++) {
// //       const line = document.lineAt(i);
// //       for (const keyword of customKeywords) {
// //         const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
// //         let match;
// //         while ((match = regex.exec(line.text))) {
// //           const startIndex = match.index;
// //           const endIndex = startIndex + match[0].length;
// //           const range = new vscode.Range(i, startIndex, i, endIndex);
// //           decorations.push({ range, hoverMessage: `Sensitive info found: ${match[0]}` });

// //           // Suggest CamelCase
// //           const variableName = match[0];
// //           const camelCaseName = toCamelCase(variableName);
// //           const suggestionRange = new vscode.Range(i, startIndex, i, startIndex + variableName.length);
// //           decorations.push({
// //             range: suggestionRange,
// //             renderOptions: {
// //               after: {
// //                 contentText: ` (${camelCaseName})`,
// //                 color: 'rgba(0, 0, 0, 0.5)',
// //               },
// //             },
// //           });
// //         }
// //       }
// //     }
// //     activeEditor.setDecorations(sensitiveInfoDecorationType, decorations);
// //   }
// //   function toCamelCase(str) {
// //     return str.replace(/[_-]\w/g, match => match.charAt(1).toUpperCase());
// //   }
// // }
// // exports.activate = activate;
// // function deactivate() {}
// // module.exports = {
// //   activate,
// //   deactivate
// // };

























// // const vscode = require('vscode');
// // function activate(context) {
// //   let disposable = vscode.commands.registerCommand('extension.detectSensitiveInfo', () => {
// //   });
// //   context.subscriptions.push(disposable);
// //   let config = vscode.workspace.getConfiguration('sensitiveInfoDetector');
// //   let customKeywords = ["password",
// //   "secret",
// //   "api_key",
// //   "access_token",
// //   "private_key",
// //   "client_secret",
// //   "confidential",
// //   "jwt_secret",
// //   "database_password"]

// //   const sensitiveInfoDecorationType = vscode.window.createTextEditorDecorationType({
// //     backgroundColor: 'rgba(255, 0, 0, 0.3)',
// //   });

// //   let activeEditor = vscode.window.activeTextEditor;
// //   if (activeEditor) {
// //     triggerUpdateDecorations();
// //   }

// //   vscode.window.onDidChangeActiveTextEditor(editor => {
// //     activeEditor = editor;
// //     if (editor) {
// //       triggerUpdateDecorations();
// //     }
// //   });

// //   vscode.workspace.onDidChangeTextDocument(event => {
// //     if (activeEditor && event.document === activeEditor.document) {
// //       triggerUpdateDecorations();
// //     }
// //   });

// //   function triggerUpdateDecorations() {
// //     if (!activeEditor) {
// //       return;
// //     }

// //     const { document } = activeEditor;
// //     const decorations = [];

// //     for (let i = 0; i < document.lineCount; i++) {
// //       const line = document.lineAt(i);
// //       for (const keyword of customKeywords) {
// //         const regex = new RegExp(keyword, 'gi');
// //         let match;
// //         while ((match = regex.exec(line.text))) {
// //           const startIndex = match.index;
// //           const endIndex = startIndex + match[0].length;
// //           const range = new vscode.Range(i, startIndex, i, endIndex);
// //           decorations.push({ range, hoverMessage: `Sensitive info found: ${match[0]}` });
// //         }
// //       }
// //     }

// //     activeEditor.setDecorations(sensitiveInfoDecorationType, decorations);
// //   }
// // }

// // exports.activate = activate;







// // const vscode = require('vscode');

// // function activate(context) {
// //   const sensitiveWords = [
// //   "password",
// //   "secret",
// //   "api_key",
// //   "access_token",
// //   "private_key",
// //   "client_secret",
// //   "confidential",
// //   "jwt_secret",
// //   "database_password"];

// //   const sensitiveInfoDecorationType = vscode.window.createTextEditorDecorationType({
// //     backgroundColor: 'rgba(255, 0, 0, 0.3)',
// //   });

// //   let activeEditor = vscode.window.activeTextEditor;
// //   if (activeEditor) {
// //     triggerUpdateDecorations();
// //   }

// //   vscode.window.onDidChangeActiveTextEditor(editor => {
// //     activeEditor = editor;
// //     if (editor) {
// //       triggerUpdateDecorations();
// //     }
// //   });

// //   vscode.workspace.onDidChangeTextDocument(event => {
// //     if (activeEditor && event.document === activeEditor.document) {
// //       triggerUpdateDecorations();
// //     }
// //   });

// //   function triggerUpdateDecorations() {
// //     if (!activeEditor) {
// //       return;
// //     }

// //     const { document } = activeEditor;
// //     const decorations = [];

// //     for (let i = 0; i < document.lineCount; i++) {
// //       const line = document.lineAt(i);
// //       for (const sensitiveWord of sensitiveWords) {
// //         const regex = new RegExp(sensitiveWord, 'gi');
// //         let match;
// //         while ((match = regex.exec(line.text))) {
// //           const startIndex = match.index;
// //           const endIndex = startIndex + match[0].length;
// //           const range = new vscode.Range(i, startIndex, i, endIndex);
// //           decorations.push({ range, hoverMessage: `Sensitive info found: ${match[0]}` });
// //         }
// //       }
// //     }

// //     activeEditor.setDecorations(sensitiveInfoDecorationType, decorations);
// //   }

// //   context.subscriptions.push(vscode.commands.registerCommand('extension.detectSensitiveInfo', () => {
// //     // This is a no-op since the extension is automatically triggered.
// //   }));
// // }

// // exports.activate = activate;




// // // // const vscode = require('vscode');

// // // // function activate(context) {
// // // //   const sensitiveWords = ['password', 'secret', 'api_key']; // Add your sensitive keywords here

// // // //   vscode.window.onDidChangeActiveTextEditor(editor => {
// // // //     if (editor) {
// // // //       const { document } = editor;

// // // //       for (let i = 0; i < document.lineCount; i++) {
// // // //         const line = document.lineAt(i);
// // // //         for (const sensitiveWord of sensitiveWords) {
// // // //           if (line.text.toLowerCase().includes(sensitiveWord)) {
// // // //             const range = new vscode.Range(i, 0, i, line.text.length);
// // // //             const decoration = { range, hoverMessage: `Sensitive info found: ${sensitiveWord}` };
// // // //             editor.setDecorations(sensitiveInfoDecorationType, [decoration]);
// // // //           }
// // // //         }
// // // //       }
// // // //     }
// // // //   });

// // // //   context.subscriptions.push(vscode.commands.registerCommand('extension.detectSensitiveInfo', () => {
// // // //     // This is a no-op since the extension is automatically triggered.
// // // //   }));
// // // // }

// // // // exports.activate = activate;

// // // // const sensitiveInfoDecorationType = vscode.window.createTextEditorDecorationType({
// // // //   backgroundColor: 'rgba(255,0,0,0.3)',
// // // // });


// // // const vscode = require('vscode');

// // // function activate(context) {
// // //   const sensitiveWords = ['password', 'secret', 'api_key', 'token']; // Add your sensitive keywords here

// // //   vscode.window.onDidChangeActiveTextEditor(editor => {
// // //     if (editor) {
// // //       const { document } = editor;
// // //       const decorations = [];

// // //       for (let i = 0; i < document.lineCount; i++) {
// // //         const line = document.lineAt(i);
// // //         for (const sensitiveWord of sensitiveWords) {
// // //           const regex = new RegExp(sensitiveWord, 'gi'); // 'gi' for case-insensitive global search
// // //           let match;
// // //           while ((match = regex.exec(line.text))) {
// // //             const startIndex = match.index;
// // //             const endIndex = startIndex + match[0].length;
// // //             const range = new vscode.Range(i, startIndex, i, endIndex);
// // //             decorations.push({ range, hoverMessage: `Sensitive info found: ${match[0]}` });
// // //           }
// // //         }
// // //       }

// // //       editor.setDecorations(sensitiveInfoDecorationType, decorations);
// // //     }
// // //   });

// // //   context.subscriptions.push(vscode.commands.registerCommand('extension.detectSensitiveInfo', () => {
// // //     // This is a no-op since the extension is automatically triggered.
// // //   }));
// // // }

// // // exports.activate = activate;

// // // const sensitiveInfoDecorationType = vscode.window.createTextEditorDecorationType({
// // //   backgroundColor: 'rgba(255, 0, 0, 0.3)',
// // // });
