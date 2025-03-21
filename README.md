<div align="center">
<h1>Glide</h1>
<p>A fast, simple, in-browser Python IDE used for learning, teaching, and exams.</p>

![image](https://github.com/user-attachments/assets/dd79f262-ebfe-4c76-bc0c-189d75acfe85)

</div>

## Motivation

Glide was first developed as a minimal [IDLE](https://docs.python.org/3/library/idle.html) clone for use in programming exams secured with [Safe Exam Browser (SEB)](https://safeexambrowser.org/) at the School of Computing at the National University of Singapore. Since the exams were configured to disallow any local code executions, IDLE can't be launched. Hence, Glide has to be accessible in the browser so that the examinees can run and test their codes and play around with the REPL environment. It has to also perform in-browser interpretations so that the examinees can continue to work regardless of network or server loads. It should also work with slightly older browser versions to accommodate remote exams where examinees may use devices running different, presumably older, operating systems.

It turns out that Glide is useful not only for exams, but also for general teaching and learning. Students can run codes on their mobile phones. Teachers can demonstrate examples on computers at different lecture theatres across the university where Python may not be installed.

Glide is now used in fundamental programming courses at NUS like [CS1010S](https://www.comp.nus.edu.sg/~nityalak/CS1010S/Guides/Glide/), [CS1010A](https://nusmods.com/courses/CS1010A/programming-methodology), and [CS1010E](https://nusmods.com/courses/CS1010E/programming-methodology), and by many students and teachers.

## Usage

Glide is currently accessible at https://www.comp.nus.edu.sg/~cs1010s/glide. The CS1010S team has made a great [user guide for Glide here](https://www.comp.nus.edu.sg/~nityalak/CS1010S/Guides/Glide/).

Glide's interpreter is powered by [Pyodide](https://pyodide.org/), an amazing port of CPython to WebAssembly with [Emscripten](https://emscripten.org/). It currently runs Python 3.10.2 with built-in modules. Glide runs Pyodide in a Web Worker as an isolated environment, and also to prevent tab hangs in case a bad recursive code is run. It also "unloads" several JavaScript functions from the interpreter's environment to prevent interpreted codes from usurping the app environment. It uses [Xterm.js](https://xtermjs.org/) as the terminal emulator, the same one used by Visual Studio Code, that has a very good buffer management system (again, to guard against bad recursive codes).

## Deploying on Safe Exam Browser (SEB)

Glide may load resources from other origins, hence you'll need to add these entries in your [URL filtering table in your SEB configuration](https://safeexambrowser.org/windows/win_usermanual_en.html#NetworkPaneFilterSection).

| Active | Regex | Expression | Action | Explanation |
| ------ | ----- | ---------- | ------ | ----------- |
| ✓ | ✓ | `^blob:https:\/\/www\.comp\.nus\.edu\.sg\/` | allow | Allows Glide to handle in-browser objects. |
| ✓ |   | `cdn.jsdelivr.net/npm/monaco-editor*` | allow | Allows Glide to load the JavaScript modules required for the code editor. |

When someone uploads a file to Glide, it needs to create a URL of the uploaded object to refer to it from the browser's internal storage. That file (blob) is then given an object URL that looks like `blob:https://www.comp.nus.edu.sg/acf0114a-5131-4dc8-b697-9c1d21abb020`. The first regex whitelists this.

The second regex whitelists the [jsDelivr CDN](https://www.jsdelivr.com/) that hosts the JavaScript package of [the code editor that Glide uses](https://github.com/microsoft/monaco-editor).

## Contributing

Glide is a [React app](https://react.dev/), transpiled with [Babel](https://babeljs.io/), and built with [webpack](https://webpack.js.org/). If you encounter bugs or have any questions, feel free to [open an issue](https://github.com/NUSSOC/glide/issues/new). Otherwise, you can always suggest code changes instead.

```sh
git clone https://github.com/NUSSOC/glide.git
```

Then install all the dependencies.

```sh
npm install
```

Then start the development server.

```sh
npm run dev
```

This will start Glide at http://localhost:9102. You can now make changes to the codebase.

> [!NOTE]
> If you'd like to customise the localhost port, you can set the `PORT` environment variable before running `npm run dev`.
>
> ```sh
> PORT=3000 npm run dev
> ```

Try building Glide for production.

```sh
npm run build
```

Once you're ready, [open a pull request](https://github.com/NUSSOC/glide/compare), and someone will review it in due time.
