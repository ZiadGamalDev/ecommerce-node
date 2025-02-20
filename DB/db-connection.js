import mongoose from "mongoose";

const db_connection = async () => {
  await mongoose.connect(process.env.CONNECTION_URL_LOCAL)
    .then((x) => console.log("Database connected successfully"))
    .catch((error) => console.log(error, "Database connection failed"));
};

export default db_connection;
