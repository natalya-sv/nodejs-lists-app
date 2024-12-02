import { Category } from "../../src/models/category.js";
import { User } from "../../src/models/user.js";
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import { Subcategory } from "../../src/models/subcategory.js";
import { SubcategoryItem } from "../../src/models/subcategoryItem.js";
import {
  categories,
  subcategories,
  subcategoryItemsOne,
  subcategoryItemsThree,
  subcategoryItemsTwo,
} from "../../test-data.js";

export const seedDatabase = async (req, res) => {
  try {
    const isDev = process.env.NODE_ENV === "development";
    if (isDev) {
      await User.deleteMany();
      await Category.deleteMany();
      await Subcategory.deleteMany();
      await SubcategoryItem.deleteMany();

      const password = "hellothere";
      const hashedPassword = await bcrypt.hash(password.trim(), 12);

      // Add test data
      const testUsers = await User.create([
        {
          email: "test-natalya@test.com",
          username: "test-natalya",
          password: hashedPassword,
        },
        {
          email: "test-anna@test.com",
          username: "test-anna",
          password: hashedPassword,
        },
      ]);
      // const categories = [
      //   {
      //     title: "Cooking",
      //     icon: "food",
      //     color: "red",
      //   },
      //   {
      //     title: "Reading",
      //     icon: "book",
      //     color: "blue",
      //   },
      //   {
      //     title: "Travelling",
      //     icon: "airplane",
      //     color: "green",
      //   },
      //   {
      //     title: "Learning",
      //     icon: "computer",
      //     color: "orange",
      //   },
      //   {
      //     title: "Meeting",
      //     icon: "meet",
      //     color: "red",
      //   },
      // ];
      // const subcategories = [
      //   {
      //     title: "Birthday Cooking",
      //   },
      //   {
      //     title: "Books in English",
      //   },
      //   {
      //     title: "Travelling 2025",
      //   },
      //   {
      //     title: "Learning Vue",
      //   },
      //   {
      //     title: "Meeting meetup",
      //   },
      // ];

      // const subcategoryItemsOne = [
      //   {
      //     title: "5 eggs",
      //     description: "description",
      //   },
      //   {
      //     title: "450g flower",
      //     description: "description",
      //   },
      //   {
      //     title: "puur chocolate",
      //     description: "description",
      //   },
      // ];
      // const subcategoryItemsTwo = [
      //   {
      //     title: "Alice in the Wonderland",
      //     description: "description",
      //   },
      //   {
      //     title: "Leave the world behind",
      //     description: "description",
      //   },
      //   {
      //     title: "Nevel let me go",
      //     description: "description",
      //   },
      //   {
      //     title: "It ends with us",
      //     description: "description",
      //   },
      //   {
      //     title: "Total recall",
      //     description: "description",
      //   },
      // ];
      // const subcategoryItemsThree = [
      //   {
      //     title: "Autralia",
      //     description: "description",
      //   },
      //   {
      //     title: "Canada",
      //     description: "description",
      //   },
      //   {
      //     title: "Poland",
      //     description: "description",
      //   },
      //   {
      //     title: "Griece",
      //     description: "description",
      //   },
      // ];
      const userOne = testUsers[0]._id;
      const userTwo = testUsers[1]._id;

      for (let i = 0; i < categories.length; i++) {
        //create categories for 2 users
        const newCategoryUserOne = await Category({
          ...categories[i],
          userId: userOne,
        });
        const newCategoryUserTwo = await Category({
          ...categories[i],
          userId: userTwo,
        });
        const categoryUserOne = await newCategoryUserOne.save();
        const categoryUserTwo = await newCategoryUserTwo.save();

        //create subcategories for created categories
        const subcategoryUserOne = await Subcategory({
          ...subcategories[i],
          categoryId: categoryUserOne._id,
          userId: userOne,
        });
        const subcategoryUserTwo = await Subcategory({
          ...subcategories[i],
          categoryId: categoryUserTwo,
          userId: userTwo,
        });
        const subctrgUserOne = await subcategoryUserOne.save();
        const subctrgUserTwo = await subcategoryUserTwo.save();

        //create subcategory items
        let items = [];
        if (i === 0) {
          items = [...subcategoryItemsOne];
        } else if (i === 1) {
          items = [...subcategoryItemsTwo];
        } else if (i === 2) {
          items = [...subcategoryItemsThree];
        }
        for (let j = 0; j < items.length; j++) {
          const item1 = await SubcategoryItem({
            ...items[j],
            userId: userOne,
            subcategoryId: subctrgUserOne._id,
          });
          const item2 = await SubcategoryItem({
            ...items[j],
            userId: userTwo,
            subcategoryId: subctrgUserTwo._id,
          });
          await item1.save();
          await item2.save();
        }
      }

      const users = testUsers.map((user) => {
        return { id: user.id, email: user.email, username: user.username };
      });
      return res.status(200).json({
        message:
          "Database seeded. Use one of these users to login and view data",
        users: users,
      });
    }
    res.status(500).json({ message: "method not allowed in producution" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
