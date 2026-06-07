import bcrypt from "bcryptjs";

const password = "1234";

bcrypt.hash(password, 10).then((hash) => {
  console.log("HASHED PASSWORD:");
  console.log(hash);
});