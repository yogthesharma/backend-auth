const express = require(`express`);
const bcrypt = require(`bcrypt`);
const auth = require(`../auth/auth`);

// importing methods

// importing user model
const User = require(`../models/userModel`);
const { findByIdAndDelete } = require("../models/userModel");

const userRouter = express.Router();

// adding new user in the db
userRouter.post("/api/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const token = await user.generateAuthToken();
    await user.save();
    res.status(200).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// getting a single user
userRouter.get("/api/users", auth, async (req, res) => {
  try {
    const user1 = req.user;
    res.status(200).send(user1);
  } catch (error) {
    res.status(400).send({ error });
  }
});

// updating users
userRouter.patch("/api/users/", auth, async (req, res) => {
  const updatedAttributes = Object.keys(req.body);
  const availableUpates = ["firstName", "lastName", "email", "password"];

  const check = updatedAttributes.every((udate) =>
    availableUpates.includes(udate)
  );

  if (!check) {
    return res.status(400).send({ error: "Requested Fields Can't Be Updated" });
  }

  const password = req.body.password;
  if (password) {
    const hashedPass = await bcrypt.hash(password, 8);
    req.body.password = hashedPass;
  }

  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      runValidators: true,
      new: true,
    });
    res.status(202).send(user);
  } catch (error) {
    res.status(400).send({ error });
  }
});

// deleting users form the database
userRouter.delete("/api/users/", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    res.status(204).send(`User Deleted`);
  } catch (error) {}
});

// after activities
// ##################################
// logging in users
userRouter.post("/api/user/login", async (req, res) => {
  try {
    const user = await User.findUserByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();
    res.status(200).send({ user, token });
  } catch (error) {
    res.status(401).send({ error });
  }
});

userRouter.post("/api/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send("Logged Out");
  } catch (error) {
    res.status(500).send({ error });
  }
});

// exporting the userRouter route
module.exports = userRouter;
