import { v4 as uuidv4 } from "uuid"
export default () => uuidv4().split("-")[0]
