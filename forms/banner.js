module.exports = {
    name: {
        presence: {
            message: '^Наименование объязательное поле'
        },
        length: {
            maximum: 25,
            message: '^Длина наименование должно быть меньше 25-символов'
        }
    },
    photo: {
        presence: true
    },
    photos: {

    },
    buttonLink: {
        
    },
    buttonName: {
        
    },
    category: {

    }
};