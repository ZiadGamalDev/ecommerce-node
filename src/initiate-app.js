import db_connection from "../DB/db-connection.js";
import cors from "cors";
import { globalResponse } from "./Middlewares/gloabl-response.js";
import path from "path";
import { fileURLToPath } from "url";
import * as routers from "../src/modules/index.routers.js";
import { rollBackSavedDocuments } from "./Middlewares/rollback-saved-docs.js";
import Category from "../DB/models/category-model.js";
import { rollbackUploadedFiles } from "./Middlewares/rollback-uploaded-files.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initiateApp = async (app, express) => {
  const port = process.env.PORT;
  console.log(port);

  app.use(
    "/order/webhook",
    express.raw({ type: "application/json" }) 
  );
  
  app.use(express.json());

    db_connection();

    try {
        await Category.collection.dropIndex("image.public_id_1");
        console.log("Index dropped successfully");
    } catch (err) {
        console.log("No problematic index found");
    }

    // CORS configuration using environment variables
    const allowedOrigins = [
        process.env.ECOMMERCE_FRONTEND_URL,
        process.env.ADMIN_FRONTEND_URL,
        process.env.CHAT_FRONTEND_URL
    ].filter(Boolean); // Remove any undefined values

    app.use(cors({
        origin: allowedOrigins,
        credentials: true
    }));

    app.use("/auth", routers.authRouter);
    app.use("/category", routers.categoryRouter);
    app.use("/product", routers.productRouter);
    app.use("/coupon", routers.couponRouter);
    app.use("/cart", routers.cartRouter);
    app.use("/order", routers.orderRouter);
    app.use("/wishList", routers.wishListRouter);
    app.use("/tracking/product", routers.productActivityRouter);
    app.use("/tracking/search", routers.searchActivityRouter);
    app.use("/settings", routers.settingsRouter);
    app.use("/review", routers.reviewRouter);
    app.use("/brand", routers.brandRouter);
    app.use("/profile", routers.profileRouter);

    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "../public/index.html"));
    });

    app.use("*", (req, res, next) => {
        res.status(404).json({ message: "Not Found" });
    });

    app.use(globalResponse, rollbackUploadedFiles, rollBackSavedDocuments);

    const server = app.listen(port, () => console.log(`app listening on port ${port}!`));
};
