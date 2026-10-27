//to add in Account

const Account = require("../models/account");
const bcrypt = require("bcrypt");

async function loginUserEmail(email, password) {
  try {
    const account = await Account.findOne({ email });
    if (!account) {
      throw new Error("Account not found with this email");
    }
    const isMatch = await bcrypt.compare(password, account.passwordHash);
    if (!isMatch) {
      throw new Error("Invalid password");
    }

    // 3. Fetch user profile linked to account
    const user = await User.findById(account.userId);
    if (!user) {
      throw new Error("User profile not found");
    }

    console.log("Email login successful for:", user.username);
    return user;

  } catch (error) {
    console.error("Error in loginUserEmail():", error.message);
    throw error;
  }
}
