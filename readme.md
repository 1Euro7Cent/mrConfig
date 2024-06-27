# mrConfig Usage Guide

mrConfig can be used to manage configuration data. The class provides methods for validating, saving, and loading configuration data from JSON files.
# Table of Contents

* [mrConfig Usage Guide](#mrconfig-usage-guide)
  + [Table of Contents](#table-of-contents)
  + [Installation](#installation)
  + [How to Use](#how-to-use)
  + [Methods](#methods)
  + [Type Checking](#type-checking)
  + [Nested Objects](#nested-objects)
  + [Saving and Loading](#saving-and-loading)
    - [Saving Configuration](#saving-configuration)
    - [Loading Configuration](#loading-configuration)
    - [Loading Configuration from JSON](#loading-configuration-from-json)

## Installation

```bash
npm install mrconfig.js
```

```javascript
const Config = require('mrconfig.js');
```

## How to Use

To use this class, you need to create your own class that extends the `Config` class. In your class, you should populate the `this.data` object with your default values. These values will be saved, parsed, and type-checked.

Here's an example:

```javascript
const Config = require('mrconfig.js');

class MyConfig extends Config {
    constructor() {
        super('myConfig', true, true, true);
        this.data = {
            serverName: 'default value',
            port: 123,
            debugMode: true
        };
    }
}
// the following args are the default ones
// const myConfig = new MyConfig(name, prettify, allowParseToNumber,allowJsonFixer);
const myConfig = new MyConfig('config', false, true, true);
```

In this example,  `myConfig` is an instance of `MyConfig`, which extends `Config`. The `this.data` object is populated with default values.

The `myConfig.data` is also properly documented with JSDoc, so you can use your IDE's intellisense to see the available keys and their types.

To access the data simply use `myConfig.data`:

```javascript
console.log(myConfig.data.serverName); // 'default value'. hover over it to see the type 'string'
console.log(myConfig.data.port); // 123. hover over it to see the type 'number'

```

## Methods

The `Config` class provides the following methods:

* `fromFile(?file)`: Loads the configuration from the given file. If a configuration already exists, it will be overridden with the new configuration.

* `fromJson(json)`: Loads the configuration from a JSON object or string. If a configuration already exists, it will be overridden with the new configuration.

* `save(?file, ?content)`: Saves the current config to the given file. if content set it will override the current config.

#### Note: The `?` in the method signature indicates that the parameter is optional.

## Type Checking

mrConfig performs type checking when loading configuration data. If a key in the loaded data has a different type than the corresponding key in `this.data`, an error will be thrown. However, if `allowParseToNumber` is `true` and the loaded value is a string that can be parsed as a number, the string will be converted to a number and no error will be thrown.

Here's an example of how type checking works in this context:

```javascript
const myConfig = new MyConfig();

// Suppose the default configuration is this:
// this.data = { serverName: 'default', port: 123 };

try {
    // Attempt to load configuration from a JSON object
    myConfig.fromJson({ serverName: 456, port: 'not a number' });
} catch (error) {
    console.error(error);
    // This will throw an error because serverName expects a string and port expects a number
}

// However, if allowParseToNumber is true and the loaded value is a string that can be parsed as a number, no error will be thrown
myConfig.allowParseToNumber = true;

try {
    // Attempt to load configuration from a JSON object
    myConfig.fromJson({ serverName: "definitely not a number", port: '123' });
    // This will not throw an error because '123' can be parsed as numbers
} catch (error) {
    console.error(error);
}
```

## Nested Objects

Nested objects in the configuration can be handled similarly as top-level configuration keys. Here's an example:

```javascript
// Suppose the default configuration:
/* 
this.data = { 
    server: { 
        name: 'default', 
        port: 1337, 
        websocket: { 
            path: '/ws', 
            timeout: 2*60*1000 // 2 minutes in milliseconds
            } 
        } 
    };
*/

try {
    // Attempt to load configuration from a JSON object with nested keys
    myConfig.fromJson({ 
        server: { 
        name: 'myServer', 
        port: 1234, 
        websocket: { 
            path: '/websocket', 
            timeout: 5*60*1000 // 5 minutes in milliseconds
            } 
        } 
    });
} catch (error) {
    console.error(error);
    // This will throw an error if the types of the new values do not match the types of the default values
}
```

In this example,  `server` is a nested object in the configuration. It includes another nested object `websocket`. When loading a new configuration, the types of the new nested values must match the types of the default nested values, or an error will be thrown. The `fromJson` method is used to load the new configuration. If the types of the new values do not match the types of the default values, an error will be thrown and logged to the console.

Sure, here's an example of how you can format the "Saving and Loading" section in Markdown:

## Saving and Loading

The `Config` class provides methods for saving and loading configuration data.

### Saving Configuration

To save the current state of the configuration data, use the `save(file)` method. This method writes the current state of the `this.data` object to a file, respecting the `prettify` option.

Here's an example:

```javascript
const myConfig = new MyConfig();
myConfig.data.serverName = 'new value';
myConfig.save('path/to/config.json');
```

In this example, the `save(file)` method saves the current state of the `this.data` object to the file `path/to/config.json`. If the file does not exist, it will be created.

In the real world you need to load it first, then modify it and save it back.

### Loading Configuration

To load configuration data from a file, use the `fromFile(file)` method. This method reads data from a file and overwrites the current state of the `this.data` object.

Here's an example:

```javascript
const myConfig = new MyConfig();
myConfig.fromFile('path/to/config.json');
console.log(myConfig.data.serverName); // Outputs the serverName from the loaded configuration

// you still need to save it to a file
myConfig.save('path/to/config.json');
```

In this example, the `fromFile(file)` method loads data from the file `path/to/config.json` and overwrites the current state of the `this.data` object.

### Loading Configuration from JSON

To load configuration data from a JSON object, use the `fromJson(json)` method. This method overwrites the current state of the `this.data` object with the provided JSON object. The `json` parameter should be an object, not a JSON string.

Here's an example:

```javascript
const myConfig = new MyConfig();
myConfig.fromJson({ serverName: 'new value' });
console.log(myConfig.data.serverName); // Outputs 'new value'

// you can also use it like this
myConfig.fromJson(JSON.parse('{"serverName": "new value"}'));
console.log(myConfig.data.serverName); // Outputs 'new value'

// or this
myConfig.fromJson('{"serverName": "new value"}');
console.log(myConfig.data.serverName); // Outputs 'new value'

// you still need to save it to a file
myConfig.save('path/to/config.json');

// if the data is faulty, and allowJsonFixer is true, it will try to fix it:
myConfig.fromJson('{"serverName": "new value", "port": "123",}}}')
// this will parse just fine, and port will be a number.

// if it was loaded from a file, the fixed data will be saved back to the file

```

In this example, the `fromJson(json)` method overwrites the current state of the `this.data` object with the provided JSON object.
