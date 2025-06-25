const joi = require('joi');

const departmentValidation = joi.object({
    departmentName: joi.string().regex(/^\S.*$/).required()
})

const validation = (data) => {
    const { error } = departmentValidation.validate(data);
    if (error) {
        return new Error(error.details[0].message);
    }
    return null;
}

module.exports = { validation }
