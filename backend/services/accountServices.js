const bcrypt = require('bcrypt');
const Account = require('../models/account');
const User = require('../models/user');
//insert import for userServices.js

async function createAccount(data) {
  // check if email or phone already registered
  const emailExists = await Account.findOne({ user_email: data.user_email });
  const phoneExists = await Account.findOne({ user_mobile_no: data.user_mobile_no });
  if (emailExists || phoneExists) return;

  // hash password 
  const hashed = await bcrypt.hash(data.user_password, 10);

  // save to login info account
  const acc = await new Account({
    user_name: data.user_name,
    user_mobile_no: data.user_mobile_no,
    user_email: data.user_email,
    user_category: data.user_category,
    user_password: hashed,
  }).save();

  // also create User profile (extra info, same email/phone)
  // await new User({
  //   uname: data.user_name,
  //   email: data.user_email,
  //   phone_number: data.user_mobile_no,
  //   username: data.user_name,
  //   user_category: data.user_category,
  // }).save();
               //REPLACE ABOVE WITH IMPORT FROM CREATE USER FUNCTION FROM USERSERVICES.JS
   
  return acc;
}

// delete both account + user by email
async function deleteAccount(email) {
  const acc = await Account.findOne({ user_email: email });
  if (!acc) return;

  await User.deleteOne({ email }); // remove user profile 
  //or should i call if i'm importing, but isnt that more complexity ^
  return await Account.deleteOne({ _id: acc._id }); // remove login/account
}

// update account info and reflect common wale in user profile
async function updateAccount(email, changes) {
  const acc = await Account.findOne({ user_email: email });
  if (!acc) return;
  const usr = await User.findOne({ email });
  if (!usr) return;

  // change name in both collections
  if (changes.user_name) {
    acc.user_name = changes.user_name;
    usr.uname = changes.user_name;
    usr.username = changes.user_name;
  }
  // update phone no
  if (changes.user_mobile_no) {
    acc.user_mobile_no = changes.user_mobile_no;
    usr.phone_number = changes.user_mobile_no;
  }
  // update category (tenant/landlord)
  if (changes.user_category) {
    acc.user_category = changes.user_category;
    usr.user_category = changes.user_category;
  }
  // if password is changing, re-hash it
  if (changes.user_password) {
    acc.user_password = await bcrypt.hash(changes.user_password, 10);
  }

  await acc.save();
  return await usr.save();
}

// email, pass login (oh can i connect with authenticator app instead of otp?)
async function emailLogin(email, password) {
  const acc = await Account.findOne({ user_email: email });
  if (!acc) return;

  const ok = await bcrypt.compare(password, acc.user_password);
  if (!ok) return;

  return await User.findOne({ email });
}

// phone_no login
async function phoneNoLogin(phone) {
  const acc = await Account.findOne({ user_mobile_no: phone });
  if (!acc) return;
  return await User.findOne({ phone_number: phone });
}

module.exports = {
  createAccount,
  deleteAccount,
  updateAccount,
  emailLogin,
  phoneNoLogin,
};
