import { celebrate, Joi } from "celebrate"

export default celebrate({
  query: {
    client_id: Joi.string().required(),
  },
})
