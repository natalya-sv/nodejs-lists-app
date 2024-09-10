import { ENTER_VALID_INPUT } from "../constants.js";

export const generateFieldValidationErrorMessage = (validationError) => {
  let errorMessage = "";
  if (validationError.length > 0) {
    for (let i = 0; i < validationError.length; i++) {
      if (validationError[i].type === "field") {
        errorMessage += `${validationError[i].msg} in ${validationError[i]?.path}. `;
      }
    }
  } else {
    errorMessage = "Error occured!Check your input and try again!";
  }
  return errorMessage;
};
export function setError(errors) {
  if (!errors.isEmpty()) {
    const error = new Error(ENTER_VALID_INPUT);

    if (errors.array()[0].type === "field") {
      error.message = generateFieldValidationErrorMessage(errors.array());
    }
    throw new Error(error?.message);
  }
}
