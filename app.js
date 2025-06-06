const express = require('express');
const morgan = require('morgan');
const qs = require('qs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const productRouter = require('./routes/productRoutes');
const productV2Router = require('./routes/productV2Routes');
const accountRouter = require('./routes/accountRoutes');
const roleRouter = require('./routes/roleRoutes');
const productCatalogRouter = require('./routes/productCatalogRoutes');
const informationRouter = require('./routes/informationRoutes');
const cartDetailRouter = require('./routes/cartDetailRoutes');
const invoiceRouter = require('./routes/invoiceRoutes');
const invoiceDetailRouter = require('./routes/invoiceDetailRoutes');
const receiptRouter = require('./routes/receiptRoutes');
// const receiptDetailRouter = require('./routes/receiptDetailRoutes');

const app = express();

app.use(cors());

// Set security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same API
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from this IP, please try again in an hour!'
// });
// app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));

// Data sanitization against MySQL query injection
// Data sanitization against XSS
app.use(xss());
// Prevent parameter pollution
app.use(hpp({ whitelist: ['price', 'quantity', 'hide '] }));

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.query = qs.parse(req._parsedUrl.query);
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

app.use('/api/v1/products', productRouter);
app.use('/api/v2/products', productV2Router);
app.use('/api/v1/accounts', accountRouter);
app.use('/api/v1/roles', roleRouter);
app.use('/api/v1/productCatalogs', productCatalogRouter);
app.use('/api/v1/info', informationRouter);
app.use('/api/v1/cartDetails', cartDetailRouter);
app.use('/api/v1/invoices', invoiceRouter);
app.use('/api/v1/invoiceDetails', invoiceDetailRouter);
app.use('/api/v1/receipts', receiptRouter);
// app.use('/api/v1/receiptDetails', receiptDetailRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
