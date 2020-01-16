import fs from "fs-extra";
import path from "path";
import ts from "typescript";
import {spawn} from "child_process";
import chalk from "chalk";

const rootDir = path.resolve(__dirname, "../");
const index = path.resolve(rootDir, "src/index.ts");
const tsConfig = JSON.parse(fs.readFileSync(path.resolve(rootDir, "tsconfig.json"), "utf-8"));
const relOutDir = path.resolve(rootDir, tsConfig.compilerOptions.outDir);
const httpServerPublicDir = path.resolve(relOutDir, "public");
const frontendBuildDir = path.resolve(rootDir, "frontend/build");

/**
 * programmatically compiles typescript and logs errors if there are some
 * @param fileNames array of files
 * @param options typescript compiler options
 */
function compile(fileNames: string[], options: ts.CompilerOptions): boolean {
  const program = ts.createProgram(fileNames, options);
  const emitResult = program.emit();

  const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      console.log(chalk.red(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`));
    } else {
      console.log(chalk.red(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")));
    }
  });

  return !emitResult.emitSkipped;
}

/**
 * removes build directory
 */
function removeBuild(): void {
  if (fs.existsSync(relOutDir)) {
    console.log(chalk.yellow("Removing build directory...\n"));
    fs.rmdirSync(relOutDir, {recursive: true});
  }
}

/**
 * exits process with error code and deletes build directory if error code > 0
 * @param code error code
 */
function exit(code: number): void {
  if (code > 0) {
    removeBuild();
  }
  console.log("Process exiting with code " + code);
  process.exit(code);
}

removeBuild();
if (compile([index], tsConfig.compilerOptions)) {
  console.log(chalk.green("Backend build, building frontend...\n"));

  const frontendBuild = spawn("npm", ["run", "build", "--prefix", "frontend"]);
  frontendBuild.stdout.on("data", (data) => {
    console.log(chalk.green(`${data}`));
  });
  frontendBuild.stderr.on("data", (data) => {
    console.log(chalk.red(`${data}`));
  });
  frontendBuild.on("close", (code) => {
    if (code > 0) {
      console.log(chalk.red("Frontend build failed\n"));
    } else {
      if (!fs.existsSync(httpServerPublicDir)) {
        fs.mkdirSync(httpServerPublicDir);
      }
      fs.copySync(frontendBuildDir, httpServerPublicDir);
      console.log(chalk.green("Frontend build copied to server public directory\n"));
    }

    exit(code);
  });

} else {
  console.log(chalk.red("Backend not build, skipping frontend\n"));

  // exit with error code 1
  exit(1);
}
