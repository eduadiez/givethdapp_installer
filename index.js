#!/usr/bin/env node

var cmd = require('commander');
var figlet = require('figlet');
var chalk = require('chalk');
var inquirer = require('inquirer');
var shell = require('shelljs');
var validator = require('validator');
var path = require('path');
var os = require('os');
var logger = require('winston');
var properties = require("properties");

shell.config.silent = true;
var homeDir = os.homedir() + "/.givethdapp_installer";
var workspace = os.homedir() + "/GivethDapp";
var debug = "Enable";
var installationType = "Development";
var installerVersion = "v1.0.0"
var logfile = path.join(homeDir, "installer.log");
var confFile = path.join(homeDir, ".env");
var composeFile = path.join(homeDir, "docker-compose.yml");
var dockerDirDapp = path.join(homeDir, "docker_dapp");
var dockerDirFeathers = path.join(homeDir, "docker_feathers");

logger.add(logger.transports.File, { filename: logfile });
logger.remove(logger.transports.Console);

cmd.option('ps', 'Show running status')
    .option('init', 'initialize configurations')
    .option('start', 'Start Giveth Dapp')
    .option('build', 'Build repos and docker images')
    .option('logs [name]', 'Get docker logs', /^(feathers|dapp)$/i)
    .option('stop', 'Stop all running dockers')
    .option('kill', 'Forcefully stop all running dockers')
    .option('rm', 'Clear all stopped docker containers')
    .option('pull', 'Pull all docker images from a docker registries')
    .version('v0.1.8', '-v, --version', 'Output the version number')
    .parse(process.argv);


/**
 * #############################################################################
 * @method getInterface
 * #############################################################################
 * validate the docker, docker-compose and git installation
 * @return {Promise}
**/
function getInterface() {
    var promise = new Promise(function (resolve, reject) {
        setTimeout(function () {
            figlet.text('    Giveth Dapp Installer    ', {
                font: 'Ogre',
                horizontalLayout: 'default',
                verticalLayout: 'default'
            }, function (err, data) {
                if (err) {
                    console.log('Error', err);
                    logger.log('Error', err);
                    return;
                }
                console.log(chalk.bold.hex('#443469')(data));
                console.log(chalk.hex('#C8C420')('\t\t\t\t\t\t\t\t\t\t\t' +
                    installerVersion));
                resolve({ data: '200' });
            });
        }, 200);
    });
    return promise;
}

/**
 * #############################################################################
 * @method validateDocker
 * #############################################################################
 * validate the docker, docker-compose and git installation
 * @return {Promise}
**/

function validateDocker() {
    var promise = new Promise(function (resolve, reject) {
        setTimeout(function () {
            shell.exec('docker -v', function (code, stdout, stderr) {
                if (code !== 0) {
                    logger.log('Error', "docker command not found,\nmsg: " + code + ", " +
                        stderr);
                    console.log('Error', "docker command not found,\nmsg: " + code + ", "
                        + stderr);
                    console.log("Use this guide to " + chalk.bold("install docker") +
                        " in the system:\n\t" +
                        chalk.italic("https://docs.docker.com/engine/installation/"));
                    console.log("And this guide to install " +
                        chalk.bold("docker-compose") +
                        " in the system:\n\t" +
                        chalk.italic("https://docs.docker.com/compose/install/"));
                    process.exit(0);
                } else {
                    shell.exec('docker-compose -v', function (code, stdout, stderr) {
                        if (code !== 0) {
                            logger.log('Error', "docker-compose command not found,\nmsg: " +
                                code + ", " + stderr);
                            console.log('Error', "docker-compose command not found,\nmsg: " +
                                code + ", " + stderr);
                            console.log("Use this guide to install " +
                                chalk.bold("docker-compose") +
                                " in the system:\n\t" +
                                chalk.italic("https://docs.docker.com/compose/install/"));
                            process.exit(0);
                        } else {
                            shell.exec('git --version', function (code, stdout, stderr) {
                                if (code !== 0) {
                                    logger.log('Error', "git command not found,\nmsg: " + code +
                                        ", " + stderr);
                                    console.log('Error', "git command not found,\nmsg: " + code +
                                        ", " + stderr);
                                    console.log("Use this guide to install " + chalk.bold("git") +
                                        " in the system:\n\t" +
                                        chalk.italic("https://git-scm.com/book/en/v2/" +
                                            "Getting-Started-Installing-Git"));
                                    process.exit(0);
                                } else {
                                    resolve({ data: '200' });
                                }
                            });
                        }
                    });
                }
            });
        }, 200);
    });
    return promise;
}

/**
 * #############################################################################
 * @method getSource
 * #############################################################################
 * The necessary sites are cloned
 * @return {Promise}
**/

function getSource() {
    var promise = new Promise(function (resolve, reject) {
        shell.mkdir('-p', workspace);
        shell.cd(workspace);
        console.log("Cloning Dapp repo...")
        setTimeout(function () {
            var branch = "";
            if (installationType == "Development") {
                branch = "-b develop";
            }
            shell.exec("git clone " + branch + " " + dapp_repo, function (code, stdout, stderr) {
                if (code !== 0) {
                    logger.log('Error', "Code: " + code + ", msg: " + stderr);
                    console.log('Error', "Code: " + code + ", msg: " + stderr);
                } else {
                    console.log("Cloning feathers repo...")
                    shell.exec("git clone  " + branch + " " + feathers_repo, function (code, stdout, stderr) {
                        if (code !== 0) {
                            logger.log('Error', "Code: " + code + ", msg: " + stderr);
                            console.log('Error', "Code: " + code + ", msg: " + stderr);
                        } else {
                            resolve({ data: '200' });
                        }
                    });
                }
            });
        }, 5000);
    });
    return promise;
}


/**
 * #############################################################################
 * @method loadEnv
 * #############################################################################
 * Load environment variables
 * @return {Promise}
**/
function loadEnv() {
    var promise = new Promise(function (resolve, reject) {
        setTimeout(function () {
            // Check if the file confFile exits (".env")
            if (shell.test('-f', confFile)) {
                properties.parse(confFile, { path: true }, function (error, data) {
                    workspace = data.WORKSPACE;
                    dapp_repo = data.DAPP_REPO;
                    feathers_repo = data.FEATHERS_REPO;
                    resolve({ data: '200' });
                });
            } else {
                console.log("ERROR: " + chalk.red(confFile + " file not found!"))
            }
        }, 200);
    });
    return promise;
}

/**
 * #############################################################################
 * @method getUserInputs
 * #############################################################################
 * It asks the user to obtain the data necessary to initialize the platform:
 * siteHostname, apiHostname, apiKey, debug, type
 * @return {Promise}
**/

function getUserInputs() {
    var promise = new Promise(function (resolve, reject) {
        setTimeout(function () {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'workpath',
                    message: 'Workpath:',
                    default: os.homedir() + "/Giveth_dapp",
                    validate: function (str) {
                        var ret = path.parse(str);
                        if (ret.root != "")
                            return true;
                        return "Please enter a absolute path."
                    }
                },
                {
                    type: 'list',
                    message: 'Type of installation',
                    name: 'installationType',
                    default: installationType,
                    choices: [
                        {
                            name: 'Production'
                        },
                        {
                            name: 'Development'
                        }
                    ]
                }
            ]).then(function (answers) {
                validateUserInputs(answers);
                resolve({ data: '200' });
            });
        }, 2000);
    });
    return promise;
}

/**
 * #############################################################################
 * @method validateUserInputs
 * #############################################################################
 * It is confirmed that the installation must proceed
 * @return {Promise}
**/
function validateUserInputs(answers) {

    workspace = answers.workpath;
    installationType = answers.installationType;

    inquirer.prompt([
        {
            type: 'list',
            message: 'Continue on installation?',
            name: 'install',
            choices: [
                {
                    name: 'No'
                },
                {
                    name: 'Yes'
                }
            ]
        }
    ]).then(function (answers) {
        if (answers.install == 'Yes') {
            console.log("Starting install ...");
            logger.log("info", "Starting install");
            updateConfigFiles().then(getSource);
        } else {
            process.exit(0);
        }
    });
}

/**
 * #############################################################################
 * @method updateConfigFiles
 * #############################################################################
 * Update the files based on the data entered
 * @return {Promise}
**/
function updateConfigFiles() {
    var promise = new Promise(function (resolve, reject) {
        setTimeout(function () {
            console.log("Updating configurations ... ");
            logger.log("info", "Updating configurations");
            shell.cp(path.join(__dirname, ".env-dist"), confFile);
            shell.sed('-i', 'WORKSPACE=.*', "WORKSPACE=" + workspace, confFile);
            resolve({ data: '200' });
        });
    }, 200);
    return promise;
}

/**
 * #############################################################################
 * @method sourceBuild
 * #############################################################################
 * Build API and Site repo
 * @return {Promise}
**/
function sourceBuild() {
    // build dapp
    var promise = new Promise(function (resolve, reject) {
        setTimeout(function () {
            shell.cd(homeDir);
            shell.exec("docker-compose build", function (code, stdout, stderr) {
                console.log(stdout);
                logger.log("info", "Building docker-compose images\n" + stdout);
                if (code !== 0) {
                    logger.log('Error', "Code: " + code + ", msg: " + stderr);
                    console.log('Error', "Code: " + code + ", msg: " + stderr);
                    shell.cd(workspace);
                }
            })
            resolve({ data: '200' });
        });
    }, 200);
    return promise;
}

/**
 * #############################################################################
 * @method composeUp
 * #############################################################################
 * Initialize the docker containers
**/
function composeUp() {
    console.log("Starting up docker containers ... ");
    logger.log("info", "Starting up docker containers");
    shell.cd(homeDir);
    shell.config.silent = false;
    shell.exec('docker-compose up -d', function (code, stdout, stderr) {
        console.log(stdout);
        logger.log("info", "docker-compose up -d\n" + stdout);
        if (code !== 0) {
            logger.log('Error', "Code: " + code + ", msg: " + stderr);
            console.log('Error', "Code: " + code + ", msg: " + stderr);
        } else {
            console.log(chalk.blue("Now you can access to the web on this address:"));
            console.log(chalk.underline.bgBlue(chalk.white("http://localhost:3010")));
            console.log(chalk.blue("Although you need to wait until the system has completely booted"));
            console.log(chalk.blue("the first time takes a while"));
            console.log(chalk.blue("You can see the logs with this command:"));
            console.log(chalk.underline.bgBlue(chalk.white("giveth logs")));
            console.log(chalk.blue("or the state:"));
            console.log(chalk.underline.bgBlue(chalk.white("giveth ps")));
        }
    });
}

/**
 * #############################################################################
 * @method composeUp
 * #############################################################################
 * Get the latest images from the repository
**/
function composePull() {
    shell.cd(homeDir);
    shell.config.silent = false;
    console.log("Pulling docker images ... ");
    logger.log("info", "Pulling docker images");
    shell.exec('docker-compose pull', function (code, stdout, stderr) {
        console.log(stdout);
        logger.log("info", "docker-compose pull\n" + stdout);
        if (code !== 0) {
            logger.log('Error', "Code: " + code + ", msg: " + stderr);
            console.log('Error', "Code: " + code + ", msg: " + stderr);
        }
    });
}

/**
 * #############################################################################
 * @method composePs
 * #############################################################################
 * Returns the current state of the system
**/
function composePs() {
    shell.cd(homeDir);
    shell.exec('docker-compose ps', function (code, stdout, stderr) {
        console.log(stdout);
        logger.log("info", "docker-compose ps\n " + stdout);
        if (code !== 0) {
            logger.log('Error', "Code: " + code + ", msg: " + stderr);
            console.log('Error', "Code: " + code + ", msg: " + stderr);
        }
    });
}

/**
 * #############################################################################
 * @method composeStop
 * #############################################################################
 * Stop all instances of the giveth dapp
**/
function composeStop() {
    shell.cd(homeDir);
    shell.exec('docker-compose stop', function (code, stdout, stderr) {
        console.log(stdout);
        logger.log("info", "docker-compose stop\n" + stdout);
        if (code !== 0) {
            logger.log('Error', "Code: " + code + ", msg: " + stderr);
            console.log('Error', "Code: " + code + ", msg: " + stderr);
        }
    });
}

/**
 * #############################################################################
 * @method composeKill
 * #############################################################################
 * Kill all instances of the giveth dapp
**/
function composeKill() {
    shell.cd(homeDir);
    shell.exec('docker-compose kill', function (code, stdout, stderr) {
        logger.log("info", "docker-compose kill\n" + stdout);
        if (code !== 0) {
            logger.log('Error', "Code: " + code + ", msg: " + stderr);
            console.log('Error', "Code: " + code + ", msg: " + stderr);
        }
    });
}

/**
 * #############################################################################
 * @method composeRm
 * #############################################################################
 * Kill all instances of the giveth dapp. If it fails, it does it by force
**/
function composeRm() {
    shell.cd(homeDir);
    shell.exec('docker-compose kill', function (code, stdout, stderr) {
        logger.log("info", "docker-compose kill\n" + stdout);
        if (code !== 0) {
            logger.log('Error', "Code: " + code + ", msg: " + stderr);
            console.log('Error', "Code: " + code + ", msg: " + stderr);
        } else {
            shell.exec('docker-compose rm -f', function (code, stdout, stderr) {
                logger.log("info", "docker-compose rm -f\n" + stdout);
                if (code !== 0) {
                    logger.log('Error', "Code: " + code + ", msg: " + stderr);
                    console.log('Error', "Code: " + code + ", msg: " + stderr);
                }
            })
        }
    });
}

/**
 * #############################################################################
 * @method composeLogs
 * #############################################################################
 * @param {String} log - the name of the log to show.
 * Show the last 500 lines of the indicated log and follow the log.
 * If no container is indicated, the log of all is displayed
**/
function composeLogs(log) {
    shell.cd(homeDir);
    shell.config.silent = false;
    if (log == true) {
        shell.exec('docker-compose logs -f --tail=500',
            function (code, stdout, stderr) {
                console.log(stdout);
                if (code !== 0) {
                    logger.log('Error', "Code: " + code + ", msg: " + stderr);
                    console.log('Error', "Code: " + code + ", msg: " + stderr);
                }
            });
    } else {
        shell.exec("docker-compose logs -f --tail=500 " + log,
            function (code, stdout, stderr) {
                console.log(stdout);
                if (code !== 0) {
                    logger.log('Error', "Code: " + code + ", msg: " + stderr);
                    console.log('Error', "Code: " + code + ", msg: " + stderr);
                }
            });
    }
}

/**
 * #############################################################################
 * @method givethInit
 * #############################################################################
 * Initialize the system
**/
function givethInit() {
    shell.mkdir('-p', homeDir);
    shell.cd(homeDir);
    shell.cp(path.join(__dirname, ".env-dist"), confFile);
    shell.cp(path.join(__dirname, "docker-compose.yml"), composeFile);
    shell.cp('-R',path.join(__dirname, "docker_feathers"), dockerDirFeathers);
    shell.cp('-R',path.join(__dirname, "docker_dapp"), dockerDirDapp);

    validateDocker()
        .then(loadEnv)
        .then(getInterface)
        .then(getUserInputs)
}

/**
 * #############################################################################
 * @method validateConfigs
 * #############################################################################
 * Check the existence of the configuration file
**/
function validateConfigs() {
    if (shell.test('-f', confFile)) {
        return true;
    }
    console.log("Run " + chalk.red("giveth init") +
        " to initialize the system");
    return false;
}

/**
 * #############################################################################
 * Script Entry point
 * #############################################################################
**/
// It checks if there are input parameters
// If it's arguments, load the environment, otherwise show the help
if (process.argv.length == 2) {
    getInterface().then(function () {
        var promise = new Promise(function (resolve, reject) {
            setTimeout(function () {
                console.log("Usage: " + chalk.red("giveth [option]"));
                console.log("       " + chalk.red("giveth --help")
                    + "\t to view available options\n");
                resolve({ data: '200' });
            }, 200);
        });
        return promise;
    });
}

/**
 * #############################################################################
 * Init command (givethInstaller init)
 * #############################################################################
**/
if (cmd.init) {
    givethInit();
}

/**
 * #############################################################################
 * Build command (givethInstaller build)
 * #############################################################################
**/
if (cmd.build) {
    if (validateConfigs()) {
        loadEnv()
            .then(sourceBuild);
    }
}

/**
 * #############################################################################
 * Start command (givethInstaller start)
 * #############################################################################
**/
if (cmd.start) {
    if (validateConfigs()) {
        loadEnv()
            .then(composeUp);
        ;
    }
}

/**
 * #############################################################################
 * Ps command (givethInstaller ps)
 * #############################################################################
**/
if (cmd.ps) {
    if (validateConfigs()) {
        loadEnv()
            .then(composePs);
    }
}

/**
 * #############################################################################
 * Stop command (givethInstaller stop)
 * #############################################################################
**/
if (cmd.stop) {
    if (validateConfigs()) {
        loadEnv()
            .then(composeStop);
    }
}

/**
 * #############################################################################
 * Kill command (givethInstaller kill)
 * #############################################################################
**/
if (cmd.kill) {
    if (validateConfigs()) {
        loadEnv()
            .then(composeKill);
    }
}

/**
 * #############################################################################
 * Rm command (givethInstaller rm)
 * #############################################################################
**/
if (cmd.rm) {
    if (validateConfigs()) {
        loadEnv()
            .then(composeRm);
    }
}

/**
 * #############################################################################
 * Logs command (givethInstaller logs {name})
 * #############################################################################
**/
if (cmd.logs) {
    if (validateConfigs()) {
        loadEnv()
            .then(function () {
                composeLogs(cmd.logs);
            });
    }
}

/**
 * #############################################################################
 * Pull command (givethInstaller pull)
 * #############################################################################
**/
if (cmd.pull) {
    if (validateConfigs()) {
        loadEnv()
            .then(composePull);
    }
}
