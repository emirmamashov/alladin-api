let request = require('request');
let xml2js = require('xml2js');
let parser = new xml2js.Parser();

let config = require('../config');

module.exports = {
    dailyExchange() {
        let options = {
            method: 'GET',
            url: config.NBKRExchangeXMLUrl,
            headers: { 'content-type': 'application/xml' },
            xml: true
        };
        console.log(config.NBKRExchangeXMLUrl);
        return new Promise((resolve, reject) => {
            request(config.NBKRExchangeXMLUrl, (error, response, body) => {
                if (error) {
                    reject(error);
                }
    
                parser.parseString(body, function (err, result) {
                    console.log(result);
                    console.log('Done');
                    result = result.CurrencyRates;
                    if (!result && result.Currency && result.Currency.length > 0) {
                        reject('result not have');
                    }

                    let newExchange = {};

                    let usd = result.Currency.filter(x => x.$.ISOCode == 'USD')[0];
                    if (usd) {
                        newExchange.usd = parseFloat(usd.Value[0].replace(',','.'));
                    }

                    let eur = result.Currency.filter(x => x.$.ISOCode == 'EUR')[0];
                    if (eur) {
                        newExchange.eur = parseFloat(eur.Value[0].replace(',','.'));
                    }

                    let kzt = result.Currency.filter(x => x.$.ISOCode == 'KZT')[0];
                    if (kzt) {
                        newExchange.kzt = parseFloat(kzt.Value[0].replace(',','.'));
                    }
                    
                    let rub = result.Currency.filter(x => x.$.ISOCode == 'RUB')[0];
                    if (rub) {
                        newExchange.rub = parseFloat(rub.Value[0].replace(',','.'));
                    }

                    resolve(newExchange);
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