import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { validationResult } from "express-validator";
import { User } from "../../src/models/user.js";
import dotenv from "dotenv";
import {
  CHECK_EMAIL_TO_RESET,
  EMAIL_NOT_RECOGNIZED,
  EXPIRED_TOKEN,
  PASSWORD_IS_RESET,
  PASSWORD_IS_RESET_ACTION,
  PASSWORD_IS_RESET_TEXT,
  PASSWORD_RESET,
  PASSWORD_RESET_ACTION,
  PASSWORD_RESET_TEXT,
  PASSWORD_RULES,
  PASSWORD_WPONG,
  PASSWORDS_NOT_THE_SAME,
  POST_USER_SUCCESS,
  RESET_PASSWORD_LINK_TEXT,
  USER_NOT_FOUND,
} from "../../constants.js";
import { Token } from "../../src/models/token.js";
import crypto from "crypto";
import { sendEmail } from "../../src/utils.js";
import { checkPasswordResetRequest } from "../../src/helpers/password-reset-request-helper.js";
dotenv.config();

const secret = process.env.SECRET_JWT;
const listifyUrl = process.env.LISTIFY_URL;
const bcryptSalt = process.env.BCRYPT_SALT;

export const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessage = errors.errors.reduce(
        (acc, error) => acc + error.msg,
        "",
      );
      throw new Error(errorMessage);
    }
    const { email, username, password } = req.body;

    if (password.trim().length < 7) {
      throw new Error(PASSWORD_RULES);
    }
    const hashedPassword = await bcrypt.hash(password.trim(), 12);
    const user = new User({
      username: username,
      email: email,
      password: hashedPassword,
    });

    const createdUser = await user.save();

    res.status(201).json({ message: POST_USER_SUCCESS, user: createdUser });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
};

export const login = async (req, res) => {
  try {
    let loadedUser;
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw Error(USER_NOT_FOUND);
    } else {
      loadedUser = user;
      const isEqual = await bcrypt.compare(password, user.password);

      if (!isEqual) {
        const error = new Error(PASSWORD_WPONG);
        throw new Error(error?.message);
      }

      if (loadedUser) {
        const token = jsonwebtoken.sign(
          {
            email: loadedUser.email,
            userId: loadedUser._id.toString(),
          },
          secret,
          { expiresIn: "120 days" },
        );

        res.status(200).json({
          token: token,
          user: {
            id: loadedUser._id.toString(),
            username: loadedUser.username,
            email: loadedUser.email,
          },
        });
      }
    }
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
};
export const resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error(EMAIL_NOT_RECOGNIZED);
      error.statusCode = 404;
      throw error;
    }

    const passwordResetRequestLimit = await checkPasswordResetRequest(email);
    if (passwordResetRequestLimit.error) {
      return res.status(500).json({
        error: true,
        message: passwordResetRequestLimit.message,
      });
    } else {
      let token = await Token.findOne({ userId: user._id });

      if (token) {
        await token.deleteOne();
      }

      let resetToken = crypto.randomBytes(32).toString("hex");
      const hash = await bcrypt.hash(resetToken, 12);

      await new Token({ userId: user._id, token: hash }).save();

      const url = `${listifyUrl}/change-password?token=${resetToken}&id=${user._id}`;

      await sendEmail(
        email,
        PASSWORD_RESET,
        {
          name: user.username,
          text: PASSWORD_RESET_TEXT,
          action: PASSWORD_RESET_ACTION,
          link: url,
          link_text: RESET_PASSWORD_LINK_TEXT,
        },
        "./src/views/email-request.hbs",
      );

      res.status(200).json({ message: CHECK_EMAIL_TO_RESET, error: false });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    res.status(500).json({ error: true, message: err?.message });
  }
};
export const changePassword = async (req, res, next) => {
  try {
    const { token, id } = req.query;
    res.render("change-password", { token: token, userId: id });
  } catch (err) {
    next(err);
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { password, confirm_password, token, userId } = req.body;

    if (password !== confirm_password) {
      return res.render("error.hbs", {
        error: PASSWORDS_NOT_THE_SAME,
      });
    }
    if (userId) {
      const passwordResetToken = await Token.findOne({ userId });
      if (passwordResetToken) {
        const isValid = await bcrypt.compare(token, passwordResetToken.token);
        if (isValid) {
          const hash = await bcrypt.hash(password, Number(bcryptSalt));
          await User.updateOne({ _id: userId }, { $set: { password: hash } });
          await passwordResetToken.deleteOne();
          const user = await User.findOne({ _id: userId });

          if (user && user.email) {
            await sendEmail(
              user.email,
              PASSWORD_IS_RESET,
              {
                name: user.username,
                action: PASSWORD_IS_RESET_ACTION,
                text: PASSWORD_IS_RESET_TEXT,
              },
              "./src/views/email-request-result.hbs",
            );
          }
        } else {
          throw new Error(EXPIRED_TOKEN);
        }
      } else {
        throw new Error(EXPIRED_TOKEN);
      }
    }
    res.render("password-reset", { link: "listify-phi.vercel.app" });
  } catch (err) {
    res.status(500).json({ error: true, message: err?.message });
  }
};
