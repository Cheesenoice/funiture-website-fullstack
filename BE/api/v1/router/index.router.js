const productRouter = require("./product.router");
const productsCategoryRouter = require("./products-category.router");
const userRouter = require("./user.router");
const authAdminRuter = require("./auth.router");
const accountRouter = require("./account.router");
const permissionRouter = require("./permission.router");
const articleRouter = require("./article.router");
const myaccountAdmin = require("./myAccountAdmin.router");
const searchAiRouter = require("./searchAi.router");
const myaccountClient = require("./myAccountClient.router");
const authAdmin = require("../../../middleware/authAdmin.middleware copy");
const authClient = require("../../../middleware/authClient.middleware");
const blogFeatured = require("./blogFeatured.router");
const loginGoogle = require("./authGoogle.router");
const loginFacebook = require("./loginFacebook.router");
const logoutRouter = require("./logout.router");
const homeRouter = require("./home.router");
const cartRouter = require("./cart.router");
const cartMiddleware = require("../../../middleware/cart.middleware");
const checkoutRouter = require("./checkout.router");
const paymomoRouter = require("./paymomo.router");
const productClientRouter = require("./productClient.router");
const articleCategoryRouter = require("./articleCategory.router");
const getArticleCategoryRouter = require("./getArticleCategory.router");
const managerUserAccountRouter = require("./managerUserAccount.router");
const orderRouter = require("./order.router"); // Add this line
const dashboardRouter = require("./dashboard.router");
const shippingFeeRouter = require("./shippingFee.router");
module.exports = (app) => {
  try {
    app.use(cartMiddleware.cart);
    const version = "/api/v1";
    app.use(version + "/product", authAdmin.authRequire, productRouter);
    app.use(version + "/product-category", productsCategoryRouter);
    app.use(version + "/auth", userRouter);
    app.use(version + "/authAdmin", authAdminRuter);
    app.use(version + "/account", authAdmin.authRequire, accountRouter);
    app.use(version + "/permission", authAdmin.authRequire, permissionRouter);
    app.use(version + "/article", authAdmin.authRequire, articleRouter);
    app.use(version + "/searchAi", searchAiRouter);
    app.use(
      version + "/my-accountAdmin",
      authAdmin.authRequire,
      myaccountAdmin
    );
    app.use(
      version + "/my-accountClient",
      authClient.authRequire,
      myaccountClient
    );
    app.use(version + "/order", orderRouter); // Add this line
    app.use(version + "/home", homeRouter);
    app.use(version + "/blog", blogFeatured);
    app.use(version + "/", loginGoogle);
    app.use(version + "/", loginFacebook);
    app.use(version + "/cart", cartRouter);
    app.use(version + "/checkout", checkoutRouter);
    app.use(version + "/pay", paymomoRouter);
    app.use(version + "/products", productClientRouter);
    app.use(version + "/articles", getArticleCategoryRouter);
    app.use(
      version + "/articleCategory",
      authAdmin.authRequire,
      articleCategoryRouter
    );
    app.use(
      version + "/listUser",
      authAdmin.authRequire,
      managerUserAccountRouter
    );
    app.use(version + "/logout", logoutRouter);
    app.use(version + "/dashboard", dashboardRouter);
    app.use(version + "/shipping-fee", shippingFeeRouter);
  } catch (error) {
    console.log(error);
  }
};
