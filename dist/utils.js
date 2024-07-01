"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFieldValidationErrorMessage = void 0;
const generateFieldValidationErrorMessage = (validationError) => {
    var _a;
    let errorMessage = "";
    if (validationError.length > 0) {
        for (let i = 0; i < validationError.length; i++) {
            if (validationError[i].type === "field") {
                errorMessage += `${validationError[i].msg} in ${(_a = validationError[i]) === null || _a === void 0 ? void 0 : _a.path}. `;
            }
        }
    }
    else {
        errorMessage = "Error occured!Check your input";
    }
    return errorMessage;
};
exports.generateFieldValidationErrorMessage = generateFieldValidationErrorMessage;
