import Joi from '@hapi/joi';

const participantRules = Joi.object({
    name: Joi.string().min(1).required()
})

const messageRules = Joi.object({
    to: Joi.string().min(1).required(),
    text: Joi.string().min(1).required(),
    type: Joi.string().valid('message', 'private_message').required()
})

export { participantRules, messageRules}