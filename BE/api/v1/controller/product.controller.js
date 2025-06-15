const Product = require("../../../model/product.model");
// const ProductCategory = require("../../../model/product.category.modle")
const searchHelper = require("../../../helper/search.helper");
const paginationHelper = require("../../../helper/pagination.helper");
// const treeHelper = require("../../../helper/category");
const Account = require("../../../model/account.model");
const { connectors } = require("googleapis/build/src/apis/connectors");
const ProductCategory = require("../../../model/product.category.modle");
const productCategoryHelper = require("../../../helper/product-category");

module.exports.product = async (req, res) => {
  const find = {
    deleted: false,
    // status: "active", // Remove this line to not filter by status
  };

  // Pagination
  let initPagination = {
    currentPage: 1,
    limitItem: 10,
  };
  const countProduct = await Product.countDocuments(find);
  const ojectPanigation = paginationHelper(
    initPagination,
    req.query,
    countProduct
  );

  // Sorting
  const sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "desc";
  }

  // Remove status filter
  // if(req.query.status){
  //     find.status = req.query.status
  // }

  // Search
  const search = searchHelper(req.query);
  if (search.regex) {
    find.title = search.regex;
  }

  // Lấy danh sách sản phẩm
  const products = await Product.find(find)
    .sort(sort)
    .limit(ojectPanigation.limitItem)
    .skip(ojectPanigation.skip);

  // Tính giá mới và thêm thông tin người tạo + người cập nhật gần nhất
  const productData = await Promise.all(
    products.map(async (item) => {
      try {
        // Tính giá mới theo phần trăm giảm giá
        const priceNew = (
          (item.price * (100 - item.discountPercentage)) /
          100
        ).toFixed(0);

        // Lấy thông tin người tạo
        let accountFullName = "Unknown";
        if (item.createBy && item.createBy.account_id) {
          const user = await Account.findOne({
            _id: item.createBy.account_id,
          });
          accountFullName = user ? user.fullName : "Account Not Found";
        }

        // Lấy thông tin người cập nhật gần nhất
        let lastUpdater = {
          name: "Not updated yet",
          time: item.createdAt, // Mặc định dùng thời gian tạo nếu chưa cập nhật
        };

        if (item.updatedBy && item.updatedBy.length > 0) {
          const lastUpdate = item.updatedBy.slice(-1)[0]; // Lấy bản ghi cập nhật cuối cùng
          if (lastUpdate && lastUpdate.account_id) {
            const userUpdate = await Account.findOne({
              _id: lastUpdate.account_id,
            });
            lastUpdater = {
              name: userUpdate ? userUpdate.fullName : "Account Not Found",
              time: lastUpdate.updatedAt || item.updatedAt,
            };
          }
        }

        return {
          ...item._doc,
          priceNew: priceNew,
          accountFullName: accountFullName,
          productName: item.title,
          lastUpdater: lastUpdater, // Thông tin người cập nhật gần nhất
        };
      } catch (error) {
        console.error(`Error processing product ${item._id}:`, error);
        return {
          ...item._doc,
          priceNew: item.price.toString(),
          accountFullName: "Error",
          productName: item.title,
          lastUpdater: { name: "Error", time: item.createdAt },
        };
      }
    })
  );

  res.json([
    {
      data: productData,
      page: req.query.page || initPagination.currentPage.toString(),
      limit: req.query.limit || initPagination.limitItem.toString(),
      totalPages: Math.ceil(
        countProduct / ojectPanigation.limitItem
      ).toString(),
      isfeatured: false,
      keyword: req.query.keyword || null,
      code: 200,
      message: "Hiển thị thành công",
    },
  ]);
};

module.exports.create = async (req, res) => {
  try {
    let products = Array.isArray(req.body) ? req.body : [req.body];
    let createdProducts = [];
    for (let item of products) {
      if (item.position == "") {
        const productCount = await Product.countDocuments();
        item.position = productCount + 1;
      } else {
        item.position = parseInt(item.position);
      }
      item.createBy = {
        account_id: res.locals.user.id,
        createAt: new Date(),
      };
      const product = new Product(item);
      await product.save();
      createdProducts.push(product);
    }
    res.json({
      data: Array.isArray(req.body) ? createdProducts : createdProducts[0],
      code: 200,
      message: "cap nhat thanh cong",
    });
  } catch (error) {
    res.json({
      code: 404,
      message: "khong thanh cong",
    });
  }
};

module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Product.updateOne({ _id: id }, { deleted: true });
    // const deletedBy =  {
    //     account_id: res.locals.user.id,  // tọa thêm trường deletedAt: Date để có thể lấy được thời gian thay đổi trường trong database
    //     deletedAt: new Date()
    // }
    res.json({
      code: 200,
      message: "xoa thanh cong",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "xoa khong thanh cong",
    });
  }
};

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const updateBy = {
      account_id: res.locals.user.id,
      updateAt: new Date(),
    };
    req.body.updateBy = updateBy;
    await Product.updateOne(
      { _id: id },
      {
        ...req.body, // lấy ra tát cả ác trường đã tồn tại trong database
        $push: { updatedBy: updateBy },
      }
    );
    res.json({
      code: 200,
      message: " cap nhat thanh cong",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "cap nhat khong thanh cong",
    });
  }
};

module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findOne(
      { _id: id },
      {
        deleted: false,
      }
    );
    res.json({
      data: product,
      code: 200,
    });
  } catch (error) {
    res.json({
      code: 400,
      error: error,
    });
  }
};

module.exports.changeStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const status = req.body.status;
    const updateBy = {
      account_id: res.locals.user.id,
      updateAt: new Date(),
    };
    await Product.updateOne(
      { _id: id },
      { status: status, $push: { updatedBy: updateBy } }
    );
    res.json({
      code: 200,
      message: "thay đổi trạng thái thành công",
    });
  } catch (error) {}
};

module.exports.featured = async (req, res) => {
  try {
    // Lọc sản phẩm featured = "1"
    const find = { deleted: false, featured: "1" };
    const products = await Product.find(find);
    res.json({
      data: products,
      code: 200,
      message: "Lấy sản phẩm featured thành công",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Không thể lấy sản phẩm featured",
    });
  }
};

module.exports.updateFeatured = async (req, res) => {
  try {
    const { productid, featured } = req.body;
    if (!Array.isArray(productid) || (featured !== "1" && featured !== "0")) {
      return res.json({ code: 400, message: "Dữ liệu không hợp lệ" });
    }
    await Product.updateMany(
      { _id: { $in: productid } },
      { featured: featured }
    );
    res.json({
      code: 200,
      message: "Cập nhật trạng thái featured thành công",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Cập nhật trạng thái featured thất bại",
    });
  }
};

module.exports.changeMulti = async (req, res) => {
  try {
    const { ids, key, value } = req.body;
    const updateBy = {
      account_id: res.locals.user.id,
      updateAt: new Date(),
    };
    switch (key) {
      case "status":
        await Product.updateMany(
          { _id: { $in: ids } },
          {
            status: value,
            $push: { updatedBy: updateBy },
          }
        );
        res.json({
          code: 200,
          message: "cập nhật thành công",
        });
        break;
      case "deleted":
        await Product.updateMany(
          { _id: { $in: ids } },
          {
            deleted: value,
            deletedAt: new Date(),
          }
        );
        res.json({
          code: 200,
          message: "cập nhật thành công",
        });
        break;
      default:
        res.json({
          code: 404,
          message: "Không thành công",
        });
        break;
    }
  } catch (error) {
    res.json({
      code: 400,
      message: "chỉnh sửa khong thành công",
    });
  }
};

module.exports.slugCategory = async (req, res) => {
  try {
    const slug = req.params.slug;

    // Tìm danh mục theo slug
    const category = await ProductCategory.findOne({
      slug: slug,
      deleted: false,
    });

    if (!category) {
      return res.status(404).json([
        {
          code: 404,
          message: "Category not found",
        },
      ]);
    }

    // Pagination setup
    let objectPagination = {
      currentPage: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 6,
    };

    objectPagination.skip =
      (objectPagination.currentPage - 1) * objectPagination.limit;

    // Lấy toàn bộ danh mục con
    const listCategory = await productCategoryHelper.getSubCategory(
      category._id
    );
    const listCategoryId = listCategory.map((item) => item._id.toString());

    // Gộp danh mục cha + con
    const allCategoryIds = [category._id.toString(), ...listCategoryId];

    // Đếm tổng sản phẩm để tính tổng số trang
    const totalProduct = await Product.countDocuments({
      product_category_id: { $in: allCategoryIds },
      deleted: false,
    });

    // Lấy sản phẩm phân trang
    const products = await Product.find({
      product_category_id: { $in: allCategoryIds },
      deleted: false,
    })
      .sort({ position: "desc" })
      .limit(objectPagination.limit)
      .skip(objectPagination.skip);

    // Tính giá mới theo phần trăm giảm giá
    const newProducts = products.map((item) => {
      item.priceNew = (
        (item.price * (100 - item.discountPercentage)) /
        100
      ).toFixed(0);
      return item;
    });

    // Trả JSON
    return res.json([
      {
        data: newProducts,
        page: objectPagination.currentPage.toString(),
        limit: objectPagination.limit.toString(),
        totalPages: Math.ceil(totalProduct / objectPagination.limit).toString(),
        code: 200,
        message: "hiển thị thành công",
        category: {
          id: category._id,
          title: category.title,
          slug: category.slug,
        },
      },
    ]);
  } catch (error) {
    console.error("Error in slugCategory API:", error);
    return res.status(500).json([
      {
        code: 500,
        message: "Internal server error",
      },
    ]);
  }
};
