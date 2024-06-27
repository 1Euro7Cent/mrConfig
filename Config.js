const fs = require('fs')
const jsonFix = require('json-fixer')

module.exports = class Config {
    #knowExactPath = false
    /**
     * 
     * @param {string} name 
     * @param {boolean} prettify 
     * @param {boolean} allowParseToNumber 
     */
    constructor(name = 'config', prettify = false, allowParseToNumber = true, allowJsonFixer = true, ignoreArray = false) {

        this.data = {}
        this.name = name
        this.prettify = prettify
        this.allowParseToNumber = allowParseToNumber
        this.allowJsonFixer = allowJsonFixer
        this.ignoreArray = ignoreArray

        this.filePath = name + '.json'
    }
    /**
     * @param {any} config
     * @returns {boolean} true if all keys and values are of the correct type
     */
    validateTypes(config) {
        return this.validateObjectTypes(config, this.data)
    }
    /**
     * 
     * @param {any} obj1 the object to check with obj2
     * @param {any} obj2 the object that is the base
     * @returns {boolean} true if obj1 types are the same as obj2
     */
    validateObjectTypes(obj1, obj2) {
        for (let key in obj1) {
            if (this.ignoreArray && Array.isArray(obj1[key])) {
                console.warn(`${this.name} key ${key} is an array and checking will be ignored`)
                continue
            }
            if (typeof obj2[key] != 'undefined') {
                if (typeof obj1[key] == 'object') {
                    if (!this.validateObjectTypes(obj1[key], obj2[key])) {
                        return false
                    }
                }
                else {

                    if (typeof obj1[key] !== typeof obj2[key]) {
                        if (this.allowParseToNumber && typeof obj1[key] == 'string' && typeof obj2[key] == 'number') {
                            obj1[key] = Number(obj1[key])
                            continue
                        }
                        throw new Error(`${this.name} key ${key} is not of type ${typeof obj2[key]}`)
                    }
                }
            }
            else {
                console.warn(`${this.name} key ${key} is not defined in the ${this.name} as a default value`)
            }
        }
        return true

    }
    /**
     * this overwrites the internal config object with the given config file
     * @param {string} [file] optional. if not set, it will use the default file path which is the name of the config + '.json'
     */
    fromFile(file) {
        if (file) {
            this.filePath = file
            this.#knowExactPath = true
        }
        else file = this.filePath
        if (!fs.existsSync(file)) {

            this.save(file)
        }
        let data = fs.readFileSync(file).toString()
        // let config = JSON.parse(data)
        return this.fromJson(data)

    }
    /**
     * this overwrites the internal config object with the given config object
     * @param {{any: any} | string} json
     */
    fromJson(json) {
        if (typeof json == 'string') {
            if (this.allowJsonFixer) {
                if (json.length == 0) json = '{}'
                let { data, changed } = jsonFix(json)
                if (changed) {
                    // json = data
                    console.log('fixed json', this.filePath)
                    json = JSON.stringify(data)
                    if (this.#knowExactPath)
                        this.save(this.filePath, data)
                }
            }
            json = JSON.parse(json)
        }

        let newConfig = {}
        for (let key in json) {
            newConfig[key] = json[key]
        }
        if (this.validateTypes(newConfig)) {

            for (let key in newConfig) {
                this.data[key] = newConfig[key]
            }
            return this.data
        }
    }

    /**
     * @param {fs.PathOrFileDescriptor} [file] optional. if not set, it will use the default file path which is either set by fromFile() or the name of the config + '.json'
     * @param {any} [content] optional. if set, it will overwrite the file with the content, ignoring the internal config object
     * @returns {string} the json as a string
     */
    save(file = this.filePath, content) {
        let jsonStr = JSON.stringify(
            typeof content == 'undefined' ? this.data : content,
            null,
            this.prettify ? 2 : undefined)

        fs.writeFileSync(file, jsonStr)
        return jsonStr
    }
}