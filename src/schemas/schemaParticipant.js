import Joi from '@hapi/joi';



const participantRules = Joi.object({
    name: Joi.string().min(1).required()
})


export {participantRules}