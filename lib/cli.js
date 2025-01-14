/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const globby = require("globby");
const chalk = require("chalk");
const ora = require("ora");
const cosmiconfig = require("cosmiconfig");
const meow = require("meow");
const linthtml = require("./index");

const presets = require("./presets").presets;
const checkInvalidCLIOptions = require("./utils/checkInvalidCliOptions");
const printFileReport = require("./printFileReport");

const explorer = cosmiconfig("linthtml", { stopDir: process.cwd(), packageProp: 'linthtmlConfig'});
const EXIT_CODE_ERROR = 2;

let globalConfig = null;

const excludedFolders = [
  "!node_modules",
  "!.git",
  "!temp",
  "!.tmp"
];

function flatten(arr) {
  return Array.prototype.concat.apply([], arr);
}

const cliOptions = {
  help: chalk`
    Usage: linthtml [options] file.html [glob] [dir]

    {cyan.underline Configuration:}

      --config               Use this configuration, overriding .linthtmlrc config options if present

    {cyan.underline Output: }

      --color, --no--color  Force enabling/disabling of color

    {cyan.underline Miscellaneous:}

      --init                          Generate a default configuration file
      -h, --help                      Show help
      -v, --version                   Output the version number
      --print-config [path::String]   Print the configuration for the given file
  `,
  flags: {
    config: {
      type: "string",
      alias: "c"
    },
    color: { // no nedd to add `no-color` it"s automatic same for colorization too (no need to do anything)
      type: "boolean",
      default: true
    },
    "print-config": {
      type: "boolean"
    },
    init: {
      type: "boolean"
    },
    help: {
      alias: "h",
      type: "boolean"
    },
    version: {
      alias: "v",
      type: "boolean"
    }
  }
};

module.exports = (argv) => {

  cliOptions.argv = argv;
  const cli = meow(cliOptions);
  const invalidOptionsMessage = checkInvalidCLIOptions(cliOptions.flags, cli.flags);

  if (invalidOptionsMessage) {
    process.stderr.write(invalidOptionsMessage);
    process.exit(EXIT_CODE_ERROR); // eslint-disable-line no-process-exit
  }
  if (cli.flags.init) {
    fs.writeFileSync(".linthtmlrc", JSON.stringify(presets.default, null, "\t"), "utf8");
    return;
  }

  if (cli.flags.config !== undefined) {
    if (cli.flags.config === "") {
      process.stderr.write(`A file path must be provided when using the ${chalk.red.bold(`config`)} option`);
      process.exit(EXIT_CODE_ERROR); // eslint-disable-line no-process-exit
    } else {
      const configPath = path.join(process.cwd(), cli.flags.config);
      let isConfigDirectory = false;
      try {
        let config = null;
        isConfigDirectory = fs.lstatSync(configPath).isDirectory();
        if (isConfigDirectory) {
          config = cosmiconfig("linthtml", { stopDir: configPath, packageProp: 'linthtmlConfig' }).searchSync(configPath);
        } else {
          config = explorer.loadSync(configPath);
        }
        if (config === null) {
          throw new Error();
        }
        globalConfig = config;
      } catch (error) {
        if (isConfigDirectory) {
          console.log(`${chalk.red("Error:")} Cannot read config file in directory: ${chalk.underline(configPath)}`);
        } else {
          console.log(`${chalk.red("Error:")} Cannot read config file: ${chalk.underline(configPath)}`);
        }
        process.exit(EXIT_CODE_ERROR); // eslint-disable-line no-process-exit
      }
    }
  }

  if (globalConfig === null) {
    globalConfig = explorer.searchSync();
  }
  if (globalConfig === null) {
    globalConfig = presets.default;
  }

  globalConfig = globalConfig.config? globalConfig.config : globalConfig;

  if (cli.flags.printConfig) {
    process.stdout.write(JSON.stringify(globalConfig, null, "  "));
  }

  if (cli.flags.version || cli.flags.v) {
    cli.showVersion();

    return;
  }

  if (cli.flags.help || cli.flags.h || argv.length === 0) {
    cli.showHelp(0);
    return;
  }

  return lint(cli.input);
};

async function lint(input) {
  let configSpinner = ora("Checking rules config").start();
  try {
    await linthtml("", globalConfig);
    configSpinner.succeed();
  } catch (error) {
    configSpinner.fail();
    console.log();
    console.error(chalk`{red ${error.message}}`);
    return process.exit(EXIT_CODE_ERROR);
  }

  let searchSpinner = ora("Searching for files").start();
  let lintSpinner;
  let files = await getFilesToLint(input);
  searchSpinner.succeed(`Found ${files.length} files`);
  lintSpinner = ora("Analysing files").start();
  files = files.map(getFileContent);
  try {    
    let reports = await Promise.all(files.map(lintFile));
    reports = reports.filter(report => report.issues.length > 0);
    lintSpinner.succeed();
    printReports(reports);
  } catch (error) {
    lintSpinner.fail();
    console.log();
    console.log(chalk`An error occured while analysing {underline ${error.fileName}}`);
    console.log();
    console.log(chalk`{red ${error.message}}`);
    return process.exit(EXIT_CODE_ERROR);
  }
}

function printReports(reports) {
  console.log();
  reports.forEach(printFileReport);

  if (reports.length > 0) {
    const errorsCount = reports.reduce((count, report) => count + report.issues.length, 0);
    console.log(chalk`{red ✖ ${errorsCount} ${errorsCount > 1 ? "errors" : "error"}}`);
  } else {
    console.log("✨  There's no error, good job 👏");
  }
}

function getFilesFromGlob(globPattern) {
  const patterns = excludedFolders.concat(globPattern);
  return globby(patterns, {
    gitignore: true,
    expandDirectories: {
      files: ["**/*.html"],
      extensions: ["html"]
    }
  });
}
function getFilesToLint(input) {
  let promises = input.map(getFilesFromGlob);
  return Promise.all(promises)
            .then(flatten);
}

function getFileContent(name) {
  return {
    name,
    content: fs.readFileSync(name).toString("utf8")
  };
}

async function lintFile(file) {
  try {
    let issues = await linthtml(file.content, globalConfig);
    return { fileName:file.name, issues };
  } catch (error) {
    error.fileName = file.name;
    throw error;
  }
}
