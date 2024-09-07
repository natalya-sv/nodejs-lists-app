import { generateFieldValidationErrorMessage } from "../../../utils.js";
import { ENTER_VALID_INPUT } from "../../../constants.js";

export function setError(errors) {
  if (!errors.isEmpty()) {
      const error = new Error(ENTER_VALID_INPUT);

      if (errors.array()[0].type === "field") {
        error.message = generateFieldValidationErrorMessage(errors.array());
      }
      throw new Error(error?.message);
  }
}
