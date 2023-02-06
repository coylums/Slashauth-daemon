import validator from "./validator.js"
import handler from "./handler.js"
import controller from "../../controller.js"

export default [validator, controller(handler)]
