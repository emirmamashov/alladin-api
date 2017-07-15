let config = require('../config');
module.exports = {
    translitToLatin(russion_word) {
        if (!russion_word) {
            console.log('russion_word is null')
            return '';
        }
        let output_word = '';
        for (let i = 0; i < russion_word.length; i++) {
            const translit_word = config.Translit_alhabets[russion_word[i]];
            if (translit_word) {
                output_word += translit_word;
            } else {
                if (translit_word === '') {
                output_word += '';
                } else {
                output_word += russion_word[i];
                }
            }
        }

        return output_word;
    },

  translitToLatinForSeoUrl(russion_word) {
        if (!russion_word) {
            console.log('russion_word is null')
            return '';
        }
        let output_word = '';
        for (let i = 0; i < russion_word.length; i++) {
            const translit_word = config.Translit_alhabets[russion_word[i]];
            if (translit_word) {
                output_word += translit_word;
            } else {
                if (translit_word === '') {
                    output_word += '';
                } else {
                    if (russion_word[i] === ' ') {
                        output_word += '_';
                    } else {
                        output_word += russion_word[i];
                    }
                }
            }
        }

    return output_word;
    }
}