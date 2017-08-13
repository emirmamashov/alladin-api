let crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'da31Asfeqqwe09l';

module.exports = {
    encrypt(text) {
        if (!text) {
            return text;
        }
        let cipher = crypto.createCipher(algorithm, password);
        let crypted = cipher.update(text, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    },

    decrypt(text) {
        console.log(text);
        if (!text) {
            return text;
        }
        let decipher = crypto.createDecipher(algorithm, password);
        let dec = decipher.update(text, 'hex', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    }
}