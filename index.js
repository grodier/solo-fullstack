#!/usr/bin/env node
'use-strict';

const chalk = require('chalk');
const commander = require('commander');
const spawn = require('cross-spawn');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const packageJson = require('./package.json');

const runSoloFullStack = (projectName) => {
    const root = path.resolve(projectName);
    const appName = path.basename(root);

    fs.ensureDirSync(projectName);

    console.log(`Creating fullstack environment in ${chalk.green(root)}`);
    console.log();

    const packageJson = {
        name: appName,
        version: '0.1.0',
        private: true
    };

    fs.writeFileSync(
        path.join(root, 'package.json'),
        JSON.stringify(packageJson, null, 2) + os.EOL
    );

    const originalDirectory = process.cwd();
    process.chdir(root);

    setupClientApp(root, appName)
        .then(() => setupAPIApp(root))
        .then(() => provideInstructions(appName));
}

const setupClientApp = (appRoot, appName) => {
    return installCRA()
        .then(() => setupClientWithCRA(appName));
}

const setupAPIApp = (appRoot) => {
    fs.ensureDirSync(path.join(appRoot, 'api'));
}

const provideInstructions = (appName) => {
    console.log(chalk.green(`${appName} installed!`));
}

const installCRA = () => {
    const dependencies = ['create-react-app'];
    const command = 'npm';
    const args = [
        'install',
        '--save'
    ].concat(dependencies);

    return runProcess(command, args);
}

const setupClientWithCRA = (appName) => {
    const command = 'create-react-app';
    const args = [
        `${appName}-client`,
    ];
    return runProcess(command, args);
}

const runProcess = (command, args) => {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { stdio: 'inherit' });
        child.on('close', code => {
            if (code !== 0) {
                reject({
                    command: `${command} ${args.join(' ')}`,
                });
                return;
            }
            resolve();
        });
    });
}

const program = new commander.Command(packageJson)
    .version(packageJson.version)
    .arguments('<project-directory>')
    .action(name => {
        runSoloFullStack(name);
    })
    .parse(process.argv);