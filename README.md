# Azure-Env-Safe

A zero-dependency lightweight environment variable checker for azure functions written in Javascript/Typescript.

## Installation

```
npm install --save azure-env-safe
```

## Why

Inspired by [dotenv-safe](https://www.npmjs.com/package/dotenv-safe), it's a good practice to keep your config separate from your application. It is also a good practice to fail early and with good error messages to help debugging. This approach will help you avoid having random error messages from appearing because an environment variable is missing and only finding it at runtime once your application is deployed. 


## How

This package will find your application's local.settings.example.json and verify that the environment variables are present in `process.env`. If any environment variables are missing, a descriptive error will be thrown telling you which environment variables are missing.


## Usage

Let's say you have a project like this

```
my-func/index.js
local.settings.json
local.settings.example.json
```

In `my-func/index.js` at the very top of the file add this code. This will find the the `local.settings.example.json` in your project and assert that the environment variables exist.

```javascript
require('azure-env-safe/config');
```

## Config

You can pass additional options to configure this library.

```javascript
require('azure-env-safe').config({
    allowEmptyValues: true,
    example: './.my-env-example-filename'
});
```

### allowEmptyValues

Default: `false`


If set to true, then empty values are allowed, otherwise all values in `local.settings.example.json` are required.


### example

Default: `local.settings.example`.

Path to the example json file. 
