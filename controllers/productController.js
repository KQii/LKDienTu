const productService = require('../services/productService');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProductsService(req.query);

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await productService.getProductDetailsService(
      req.params.id
    );

    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    // const newTour = new Tour({})
    // newTour.save()

    const newProduct = await productService.createNewProductService(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        product: newProduct
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    // const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true
    // });
    const updatedProduct = await productService.updateProductService(
      req.params.id,
      req.body
    );

    res.status(200).json({
      status: 'success',
      data: {
        product: updatedProduct
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    // await Tour.findByIdAndDelete(req.params.id);
    await productService.deleteProductService(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};
