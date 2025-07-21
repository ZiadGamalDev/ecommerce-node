import db_connection from "../DB/db-connection.js";
import cors from "cors";
import { globalResponse } from "./Middlewares/gloabl-response.js";

import * as routers from "../src/modules/index.routers.js";
import { rollBackSavedDocuments } from "./Middlewares/rollback-saved-docs.js";
import Category from "../DB/models/category-model.js";
import { rollbackUploadedFiles } from "./Middlewares/rollback-uploaded-files.js";
import bodyParser from "body-parser";

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

    app.use(cors());

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
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>E-Commerce Backend API</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        margin: 0;
                        padding: 20px;
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .container {
                        background: white;
                        border-radius: 12px;
                        padding: 40px;
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                        max-width: 600px;
                        text-align: center;
                    }
                    .header {
                        margin-bottom: 30px;
                    }
                    .title {
                        font-size: 2.5rem;
                        font-weight: 700;
                        color: #1a202c;
                        margin-bottom: 10px;
                    }
                    .subtitle {
                        color: #718096;
                        font-size: 1.1rem;
                        margin-bottom: 30px;
                    }
                    .status {
                        background: #48bb78;
                        color: white;
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-weight: 600;
                        display: inline-block;
                        margin-bottom: 30px;
                    }
                    .endpoints {
                        text-align: left;
                        background: #f7fafc;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                    .endpoint {
                        margin: 10px 0;
                        font-family: 'Courier New', monospace;
                        background: white;
                        padding: 8px 12px;
                        border-radius: 4px;
                        border-left: 4px solid #667eea;
                    }
                    .method {
                        color: #667eea;
                        font-weight: 600;
                        margin-right: 10px;
                    }
                    .footer {
                        margin-top: 30px;
                        color: #718096;
                        font-size: 0.9rem;
                    }
                    .link {
                        color: #667eea;
                        text-decoration: none;
                        font-weight: 600;
                    }
                    .link:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 class="title">🛒 E-Commerce API</h1>
                        <p class="subtitle">Node.js Backend for ITI Graduation Project</p>
                        <span class="status">🟢 Online</span>
                    </div>
                    
                    <div class="endpoints">
                        <h3>📚 API Endpoints</h3>
                        <div class="endpoint"><span class="method">GET</span>/category - Get categories</div>
                        <div class="endpoint"><span class="method">GET</span>/product - Get products</div>
                        <div class="endpoint"><span class="method">GET</span>/brand - Get brands</div>
                        <div class="endpoint"><span class="method">POST</span>/auth/login - User login</div>
                        <div class="endpoint"><span class="method">POST</span>/auth/register - User register</div>
                        <div class="endpoint"><span class="method">GET</span>/cart - Get user cart</div>
                        <div class="endpoint"><span class="method">GET</span>/order - Get user orders</div>
                    </div>

                    <div class="footer">
                        <p>Part of the <strong>Customer Support System</strong></p>
                        <p>
                            <a href="https://github.com/ZiadGamalDev/ecommerce-node" class="link">📁 Repository</a> |
                            <a href="https://github.com/ZiadGamalDev/customer-support-system" class="link">🏠 Root Project</a>
                        </p>
                        <p>Built with ❤️ by Ziad Gamal</p>
                    </div>
                </div>
            </body>
            </html>
        `);
    });

    app.use("*", (req, res, next) => {
        res.status(404).json({ message: "Not Found" });
    });

    app.use(globalResponse, rollbackUploadedFiles, rollBackSavedDocuments);

    const server = app.listen(port, () => console.log(`app listening on port ${port}!`));
};
