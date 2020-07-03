const mongoose = require(`mongoose`);
const validator = require(`validator`);
const bcrypt = require(`bcrypt`);
const jwt = require(`jsonwebtoken`);

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    required: true,
    unique: true,
    type: String,
    trim: true,
    validate(val) {
      if (!validator.isEmail(val)) {
        throw new Error("This is not the correct type of the email");
      }
    },
  },
  password: {
    required: true,
    trim: true,
    minlength: 6,
    type: String,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// middleware goes here

// finding the users by credentials
userSchema.statics.findUserByCredentials = async function (email, password) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("No Such User Exist");
  }

  const isMatch = bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Wrong Password");
  }
  return user;
};

// middleware for adding tokens to the user's data
userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign({ _id: this._id.toString() }, "randomString");

  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};

// for encrypting the password
userSchema.pre("save", async function (next) {
  if (this.isModified(`password`)) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

//creating model form schema
const User = mongoose.model("User", userSchema);

// exporting schema
module.exports = User;
