function copyCode(button) {

    const code =
        button.parentElement
        .querySelector(".code-example")
        .innerText;

    const textarea =
        document.createElement("textarea");

    textarea.value = code;

    document.body.appendChild(textarea);

    textarea.select();

    document.execCommand("copy");

    document.body.removeChild(textarea);

    button.innerText = "✓";

    setTimeout(() => {

        button.innerText = "⧉";

    }, 1000);
}


        let pyodide;
        let editor;

        async function start() {

            pyodide = await loadPyodide();
            await pyodide.runPythonAsync(`
import sys
sys.stdout = sys.__stdout__
`);

            document.getElementById("output").innerText =
                "Python waiting 🚀";

            require.config({
                paths: {
                    vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs'
                }
            });

            require(["vs/editor/editor.main"], function () {

                editor = monaco.editor.create(
                    document.getElementById("editor"),
                    {

                        value:
`print("Bem-vindo ao PyLab 🚀")

for i in range(5):
    print("Linha:", i)
`,

                        language: "python",

                        theme: "vs-dark",

                        automaticLayout: true,

                        minimap: {
                            enabled: false
                        },

                        fontSize: 16,

                        roundedSelection: true,

                        scrollBeyondLastLine: false,

                        smoothScrolling: true,

                        tabSize: 4,

                        insertSpaces: true,

                        wordWrap: "on",

                        contextmenu: true,

                        quickSuggestions: true,

                        mouseWheelZoom: true,

                        copyWithSyntaxHighlighting: true,

                        multiCursorModifier: "ctrlCmd"

                    }
                );

            });

        }

        start();

        function toggleDictionary() {

            document
                .getElementById("sidebar")
                .classList
                .toggle("open");
        }

        function toggleExamples() {

            document
                .getElementById("examplesSidebar")
                .classList
                .toggle("open");
        }

        function clearEditor() {

            editor.setValue("");

            document.getElementById("output").innerText =
                "Terminal limpo.";
        }

async function runPython() {

    const code = editor.getValue();
    const output = document.getElementById("output");

    output.innerText = "Executando...";

    try {
        await pyodide.runPythonAsync(`
import sys
from io import StringIO

_output = StringIO()
_sys_stdout_original = sys.stdout
sys.stdout = _output
        `);

        await pyodide.runPythonAsync(code);

        const result = await pyodide.runPythonAsync(`
sys.stdout.getvalue()
        `);

        await pyodide.runPythonAsync(`
sys.stdout = _sys_stdout_original
        `);

        output.innerText = result || "Código executado sem saída.";

    } catch (err) {
        output.innerText = err;

        // garante reset mesmo em erro
        try {
            await pyodide.runPythonAsync("sys.stdout = sys.__stdout__");
        } catch (e) {}
    }
}
