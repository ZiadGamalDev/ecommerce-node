import db_connection from "../DB/db-connection.js";
import cors from "cors";
export const initiateApp = (app, express) => {
  const port = process.env.PORT;
  console.log(port);
  app.use(express.json());

  db_connection();

  app.use(cors());

  app.get("/", (req, res) => res.send("Hello World!"));

  app.use("*", (req, res, next) => {
    res.status(404).json({ message: "Not Found" });
  });

  const server = app.listen(port, () =>
    console.log(`app listening on port ${port}!`)
  );
};
