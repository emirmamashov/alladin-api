let request = require('request');
let xml2js = require('xml2js');
let parser = new xml2js.Parser();

let config = '../config.js';

module.exports = {
    dailyExchange() {
        return new Promise((resolve, reject) => {
            request(config.NBKRExchangeXMLUrl, (error, response, body) => {
                if (error) {
                    reject(error);
                }
    
                parser.parseString(body, function (err, result) {
                    console.dir(result);
                    console.log('Done');
                    resolve(result);
                });
            });
        });
    }
}

function dailyExchange() {
    return new Promise((resolve, reject) => {
        request(config.NBKRExchangeXMLUrl, (error, response, body) => {
            if (error) {
                reject(error);
            }

            parser.parseString(body, function (err, result) {
                console.dir(result);
                console.log('Done');
                resolve(result);
            });
        });
    });
}