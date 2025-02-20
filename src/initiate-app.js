import db_connection from "../DB/db-connection.js";
import cors from "cors";
import { globalResponse } from "./Middlewares/gloabl-response.js";

import * as routers from "../src/modules/index.routers.js";
import { rollBackSavedDocuments } from "./Middlewares/rollback-saved-docs.js";
export const initiateApp = (app, express) => {
  const port = process.env.PORT;
  console.log(port);
  app.use(express.json());

  db_connection();

  app.use(cors());

  app.use("/auth", routers.authRouter);
  app.get("/", (req, res) => res.send("Hello World!"));

  app.use("*", (req, res, next) => {
    res.status(404).json({ message: "Not Found" });
  });
  app.use(globalResponse, rollBackSavedDocuments);

  const server = app.listen(port, () =>
    console.log(`app listening on port ${port}!`)
  );
};
