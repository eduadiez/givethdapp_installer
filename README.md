# Giveth Installer

## Pre-requisites

- nodejs

   Install [nodejs](https://nodejs.org/en/download/package-manager/) v6.X.X LTS version.

- npm

   Make sure you have installed latest npm. You can run `sudo npm install -g npm`.

- git

   Install [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) commandline tool.

(UBUNTU)
```
sudo apt-get install build-essential
````

## Install dependencies

- docker

   Install [docker](https://docs.docker.com/engine/installation). The community edition (docker-ce) will work. In Linux make sure you grant permissions to the current user to use docker by adding current user to docker group, `sudo usermod -aG docker $USER`. Once you update the users group, exit from the current terminal and open a new one to make effect.

- docker-compose

   Install [docker-compose](https://docs.docker.com/compose/install)
   
**Note**:- Make sure you can run `git`, `docker ps`, `docker-compose` without any issue and without sudo command.

## Installation
```
$ npm install -g givethdapp_installer
```

## Initialization
```
$ giveth init
$ giveth build
```

## Start
```
$ giveth start
```
## Stop
```
$ giveth stop
```
## Status
```
$ giveth ps
```
## Logs
```
# All
$ giveth logs
# Chain
$ giveth logs chain
# API
$ giveth logs api
# Store
$ giveth logs store
```