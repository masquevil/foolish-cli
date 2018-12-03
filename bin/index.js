#!/usr/bin/env node

const download = require('download-git-repo');
const program = require('commander');
const chalk = require('chalk');
const buildIns = require('./build-in.json');
const buildInRepos = buildIns.reduce((res, item) => {
  res[item.name] = item.repository;
  return res;
}, {});

program
  .version(require('../package').version)
  .usage('<command> [options]');

program
  .command('create <template> [directory]')
  .description('Create a new project in current directory.')
  .option('-c, --clone', 'use git clone instead of an http download')
  .action((template, directory = './', cmd) => {
    const options = cleanArgs(cmd);
    const repo = buildInRepos[template] || template;
    console.log('Downloading...');
    download(repo, directory, options.clone, (err) => {
      if (err) console.error(`无法连接到：${repo}`);
      else {
        console.log("Download Finished.");
        console.log(`1. cd ${directory}`);
        console.log("2. Run `npm i` or `yarn`");
        console.log("3. View 'README.md' To get start");
      }
    });
  })
  .on('--help', () => {
    console.log('\nArguments:');
    console.log('  template: Template name, or shorthand repository string, or direct url.');
    console.log('    - To check all available template names: foo list');
    console.log('    - \`owner/name\` for github');
    console.log('    - \`gitlab:owner/name\` for gitlab');
    console.log('    - \`gitlab:custom.com:owner/name\` for custom gitlab');
    console.log('    - \`direct:url\` for direct url');
    console.log('    - \`owner/name#my-branch\` to specify a branch');
    console.log('  directory: Directory for your project. Default current directory.');
  });

program
  .command('list')
  .description('Show all build-in templates.')
  .option('-v, --verbose', 'show verbose information')
  .action((cmd) => {
    const options = cleanArgs(cmd);
    console.log();
    buildIns.forEach((item) => {
      console.log(`${item.name} - ${item.description}`);
      if (options.verbose) {
        console.log(`  repository: ${item.repository}`);
        console.log(`  relations: ${item.relations.join(', ')}`);
        console.log();
      }
    });
    console.log();
  });


// output help information on unknown commands
program
  .arguments('<command>')
  .action((cmd) => {
    program.outputHelp();
    console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
  });

program.on('--help', () => {
  console.log("\nYou can run `foo <command> -h` to check out command detail.\n");
});
program.commands.forEach(c => c.on('--help', () => console.log()))

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

function camelize(str) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

function cleanArgs(cmd) {
  const args = {}
  cmd.options.forEach(o => {
    const key = camelize(o.long.replace(/^--/, ''))
      // if an option is not present and Command has a method with the same name
      // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}
