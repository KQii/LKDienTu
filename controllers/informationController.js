const informationService = require('../services/informationService');
const accountService = require('../services/accountService');
const catchAsync = require('../utils/catchAsync');

exports.getAllInfo = catchAsync(async (req, res, next) => {
  const allInfo = await informationService.getAllInfoService();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: allInfo.length,
    data: {
      allInfo
    }
  });
});

exports.createInfo = catchAsync(async (req, res, next) => {
  const newInfo = await informationService.createNewInfoService(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      info: newInfo
    }
  });
});

exports.getInfoById = catchAsync(async (req, res, next) => {
  const info = await informationService.getInfoByIdService(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      info
    }
  });
});

exports.updateInfo = catchAsync(async (req, res, next) => {
  const updatedInfo = await informationService.updateInfoService(
    req.params.id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    data: {
      info: updatedInfo
    }
  });
});

exports.deleteInfo = catchAsync(async (req, res, next) => {
  await informationService.deleteInfoService(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createMyInfo = catchAsync(async (req, res, next) => {
  const newInfo = await informationService.createNewInfoService(req.body);
  const account = await accountService.updateAccountCICService(
    req.Account.AccountID,
    newInfo.CIC
  );

  res.status(201).json({
    status: 'success',
    data: {
      info: newInfo,
      account
    }
  });
});
