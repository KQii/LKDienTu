const productModel = require('../models/productModel');

exports.getAllProductsService = async reqQuery => {
  const allProducts = await productModel.getAllProducts(reqQuery);
  if (!allProducts) {
    throw new Error('Products not found');
  }
  return allProducts;
};

exports.getProductDetailsService = async id => {
  const product = await productModel.getProductById(id);
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

exports.createNewProductService = async productData => {
  // Validate (simple)
  const { ProductName: productName, Price: price } = productData;
  if (!productName || typeof productName !== 'string') {
    throw new Error('Invalid product name');
  }

  if (!price || typeof price !== 'number' || price <= 0) {
    throw new Error('Invalid product price');
  }

  const result = await productModel.createProduct(productData);
  return result;
};

exports.updateProductService = async (productId, productData) => {
  const { result, updatedProduct } = await productModel.updateProductById(
    productId,
    productData
  );

  // console.log(result, updatedProduct);

  if (
    result.info
      .split('  ')
      .at(1)
      .slice(-1) === '0'
  ) {
    throw new Error(
      `Product with ID ${productId} not found or no changes detected.`
    );
  }
  return updatedProduct;
};

exports.deleteProductService = async productId => {
  const result = await productModel.deleteProductById(productId);
  if (result.affectedRows === 0) {
    throw new Error(`Product with ID ${productId} not found`);
  }
};
