# Azure-Env-Safe

A zero-dependency lightweight environment variable checker for azure functions written in Javascript/Typescript.

## Installation

```
npm install --save azure-env-safe
```

## Why

Inspired by [dotenv-safe](https://www.npmjs.com/package/dotenv-safe), it's a good practice to keep your config separate from your application. It is also a good practice to fail early and with good error messages to help debugging. This approach will help you avoid having random error messages from appearing because an environment variable is missing and only finding it at runtime once your application is deployed. [dotenv-safe](https://www.npmjs.com/package/dotenv-safe) requires a `.env.example` file, so if you were to use it with an azure function, then you would have both a `local.settings.example.json` and a `.env.example` where your env variables could go. Rather than having a confusing situation like that with 2 example files, this repo just uses your `local.settings.example.json` file the same way that dotenv-safe works.


## How

This package will find your application's local.settings.example.json and verify that the environment variables in your app. If any environment variables are missing, a descriptive error will be thrown telling you which environment variables are missing.


## Usage

Let's say you have a project like this

```
my-func/index.js
local.settings.json
local.settings.example.json
```

In `my-func/index.js` add this code to the very top of the file: 

```javascript
require('azure-env-safe/config');
```

This will find the the `local.settings.example.json` in your project and assert that the environment variables exist.

## Config

You can pass additional options to configure this library.

```javascript
require('azure-env-safe').config({
    example: './.my-env-example-filename.json'
});
```

### example

Default: `local.settings.example.json`.

Path to the example json file. 
