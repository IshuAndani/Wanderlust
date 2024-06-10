const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().allow('', null),
      price: Joi.number().min(0).required(),
      location: Joi.string().required(),
      country: Joi.string().required()
    }).required(),
});

module.exports.reviewSchema = Joi.object({
  review : Joi.object({
    comment : Joi.string().allow(null,''),
    rating : Joi.number().min(1).max(5).required(),
  }).required(),
});

module.exports.userSignUpSchema = Joi.object({
  username : Joi.string().required(),
  email : Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email address'
  }),
  password : Joi.string().required(),
  passAgain : Joi.string().valid(Joi.ref('password'))
  .messages({ 'any.only': 'Passwords do not match' })
});

module.exports.userLoginSchema = Joi.object({
  username : Joi.string().required(),
  password : Joi.string().required()
})
  