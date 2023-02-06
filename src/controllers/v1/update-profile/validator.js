import { celebrate, Joi } from "celebrate"

export default celebrate({
  query: {
    client_id: Joi.string().required(),
  },
  body: {
    name: Joi.string().optional(),
    bio: Joi.string().optional(),
    image: Joi.string().optional(),
  },
})
