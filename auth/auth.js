// importing modules
const jwt = require(`jsonwebtoken`);
const User = require(`../models/userModel`);
const { use } = require("../routes/userRoute");

const auth = async (req, res, next) => {
  try {
    const token = req.header(`Authorization`).replace("Bearer ", "");
    // console.log(token);

    const decode = await jwt.verify(token, "randomString");

    const user = await User.findOne({
      _id: decode._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error("User Not Authenticated");
    }
    // console.log(user);
    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    res.status(500).send(error);
  }
};

// exporting the authentication module
module.exports = auth;
