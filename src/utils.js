import { ENTER_VALID_INPUT } from "../constants.js";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import hbs from "express-hbs";
import dotenv from "dotenv";
const __dirname = path.resolve();
dotenv.config();

const info_email = process.env.INFO_EMAIL;
const email_psw = process.env.INFO_EMAIL_PSW;

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
export const sendEmail = async (email, subject, payload, template) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: info_email,
        pass: email_psw,
      },
    });
    if (payload && template) {
      const source = fs.readFileSync(path.join(__dirname, template), "utf8");
      const compiledTemplate = hbs.compile(source);

      await transporter.sendMail({
        from: `Listify App ${info_email}`,
        to: email,
        subject: subject,
        html: compiledTemplate(payload),
      });
      return true;
    }
  } catch (err) {
    console.log(err, "email not sent");
    throw new Error(err);
  }
};
