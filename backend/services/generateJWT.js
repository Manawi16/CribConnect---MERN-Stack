const jwt = require('jsonwebtoken');
const generateUserToken=(user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      profile_url: user.avatar,
      role:user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const generateStateToken=(payload) => {
    return jwt.sign(
      payload, process.env.JWT_SECRET, { expiresIn: "5m" }
    ); 

};
const decodeStateToken=(token)=>{
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null; 
  }

}
module.exports = {generateUserToken,generateStateToken,decodeStateToken};