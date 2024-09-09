import dotenv from "dotenv";
import {
  AUTH_NOT_PROVIDED,
  USER_NOT_AUTH,
  EMAIL_EXISTS,
  ENTER_VALID_EMAIL,
  USER_NOT_FOUND,
  ENTER_VALID_INPUT, SUBCATEGORY_ITEM_NOT_FOUND, NOT_AUTHORIZED 
} from "./constants.js";
import jsonwebtoken from "jsonwebtoken";
import { User } from "./api/models/user.js";
import express from "express";
import { createUser, login } from "./api/controllers/user.js";
import { body } from "express-validator";
import { SubcategoryItem } from "./api/models/subcategoryItem.js";

dotenv.config();
const secret = process.env.SECRET_JWT;

export const router = express.Router();

router.post("/signup", [
  body("email")
    .isEmail()
    .withMessage(ENTER_VALID_EMAIL)
    .custom(async (email) => {
      const userDoc = await User.findOne({ email: email });
      if (userDoc) {
        return Promise.reject(EMAIL_EXISTS);
      }
    })
    .normalizeEmail(),
  body("password").trim().isLength({ min: 7 }),
  body("username").trim().not().isEmpty(),
  createUser,
]);

router.post("/login", login);

//checks if user is authorized
export const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      throw new Error(AUTH_NOT_PROVIDED);
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = jsonwebtoken.verify(token, secret);

    if (!decodedToken) {
      const error = new Error(USER_NOT_AUTH);
      throw error;
    }
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      throw new Error(USER_NOT_FOUND);
    }
    req.userId = decodedToken.userId;
    next();
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

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

async function createSubcategoryItem(item, userId, subcategoryId) {
  const newSubcategoryItem = new SubcategoryItem({
    title: item.title,
    description: item.description ?? "",
    subcategoryId: subcategoryId,
    userId: userId,
    isDone: item.isDone ?? false,
  });

  const result = await newSubcategoryItem.save();

  if (result) return { title: item.title };

  return {
    title: item.title,
    message: "error saving item",
  };
}

export async function createSubcategoryItems(
  itemsArray,
  userId,
  addingItemsResult,
) {
  await Promise.all(
    itemsArray.forEach(async (item) => {
      const subcategoryItemExists = await SubcategoryItem.findOne({
        // TODO it checks through all items, but should check only through the current list
        title: item.title,
        userId,
      });

      if (!subcategoryItemExists) {
        const result = await createSubcategoryItem(item);
        const isError = !!result.message;
        isError
          ? addingItemsResult.failed.push(result)
          : addingItemsResult.success.push(result);
      } else {
        addingItemsResult.failed.push({
          title: item.title,
          message: "item already exists",
        });
      }
    }),
  );
}

export function setError(errors) {
  if (!errors.isEmpty()) {
    const error = new Error(ENTER_VALID_INPUT);

    if (errors.array()[0].type === "field") {
      error.message = generateFieldValidationErrorMessage(errors.array());
    }
    throw new Error(error?.message);
  }
}

export const subcategoryItemExists = async (subcategoryItemId, userId) => {
  const subcategoryItem = await SubcategoryItem.findById(subcategoryItemId);
  
  const subcategoryItemObj = { subcategoryItem: null, error: null };
  if (!subcategoryItem) {
    subcategoryItemObj.error = SUBCATEGORY_ITEM_NOT_FOUND;
    return subcategoryItemObj;
  }
  if (subcategoryItem.userId.toString() !== userId) {
    subcategoryItemObj.error = NOT_AUTHORIZED;
    return subcategoryItemObj;
  }
  subcategoryItemObj.subcategoryItem = subcategoryItem;

  return subcategoryItemObj;
};

export async function updateSubcategoryItems(
  itemsArray,
  userId,
  addingItemsResult,
) {
  await Promise.all(
    itemsArray.forEach(async (item) => {
      const subcategoryItemId = item._id;
      const subcategoryItem = await subcategoryItemExists(
        subcategoryItemId,
        userId,
      );

      if (subcategoryItem.subcategoryItem) {
        subcategoryItem.subcategoryItem.title =
          item.title ?? subcategoryItem.subcategoryItem.title;
        subcategoryItem.subcategoryItem.description =
          item.description ?? subcategoryItem.subcategoryItem.description;
        subcategoryItem.subcategoryItem.isDone =
          item.isDone ?? subcategoryItem.subcategoryItem.isDone;

        const updatedSubcategoryItem =
          await subcategoryItem.subcategoryItem.save();
        addingItemsResult.success.push(updatedSubcategoryItem);
      } else {
        addingItemsResult.failed.push({
          title: item.title,
          message: subcategoryItem.error,
        });
      }
    }),
  );
}
