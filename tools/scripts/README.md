# Scripts

Scripts to do data management on servers, fetching and cleaning data for data science, generating analytics report, etc.

## Table of Content

- [Scripts](#scripts)
  - [Table of Content](#table-of-content)
  - [Installation](#installation)
  - [Config](#config)
    - [Structure](#structure)
    - [Examples](#examples)
      - [Delete Personal Data](#delete-personal-data)
  - [Adding Scripts](#adding-scripts)

## Installation

1. `npm i --production`

To run, execute `npm start <config-filename>`. See [Config](#config).

## Config

Data Management Scripts take a config file as input.

Default filename is `default-config.json`. You can pass a different file with `npm start <filename>`

### Structure

```typescript
//Config object to be written in the file
type DataManagementScriptConfig = DataManagementOneScriptConfig[]

interface DataManagementOneScriptConfig {
    //name of the script file
    name: string
    //options to pass to the main function of the script
    options: ScriptOptions
}

interface ScriptOptions {
    //host to use for the script
    host?: string
    //auth token to use for the script
    token?: string
    //bucket name to use for the script
    bucket?: string
    //any other parameter
    [x: string]: any
}
```

### Examples

#### Delete Personal Data

```json
[
    {
        "name": "delete-personal-data",
        "options": {
            "host": "http://localhost:3000/",
            "token": "sample"
        }
    }
]
```

## Adding Scripts

The scripts are present in `src/scripts/` folder.

To add your own script,

1. Copy the file `src/scripts/sample-script.ts` in the same folder
1. In the new file, rename the script object `SampleScript` to something meaningful
1. Add the script object to `availableScripts` array in `script-list.ts`
1. Write the script logic in `main` function

To run the script, create a config and give the file name.