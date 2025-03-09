import User from "../../../DB/models/user-model.js";

export const getProfile = async (req, res, next) => {
  try {
    const { password, ...user } = req.user._doc;

    res.json({ message: "Profile fetched successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkUnique = async (field, value, userId) => {
  const query = {};
  query[field] = value;
  query._id = { $ne: userId };
  return await User.findOne(query);
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { username, email, phoneNumbers, addresses, age } = req.body;

    if (username) {
      user.username = username;
      if (await checkUnique("username", username, user._id)) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    if (email) {
      user.email = email;
      if (await checkUnique("email", email, user._id)) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    if (phoneNumbers) {
      user.phoneNumbers = phoneNumbers;
      if (await checkUnique("phoneNumbers", { $in: phoneNumbers }, user._id)) {
        return res.status(400).json({ message: "Phone number already exists" });
      }
    }

    user.addresses = addresses || user.addresses;
    user.age = age || user.age;

    await user.save();

    const { password, ...updatedUser } = user._doc;

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getuserByEmail = async (req, res, next) => {
  const { email } = req.params;

  const user = await User.findOne({ email: email });

  if (!user) {
    return next({ cause: 404, message: "User not found" });
  }

  return res
    .status(200)
    .json({ success: true, message: "User found", data: user });
};
