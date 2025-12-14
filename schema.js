const Joi = require('joi'); //For schema validation

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        descritption: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("", null)
    }).required()
});