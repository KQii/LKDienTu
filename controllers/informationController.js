const db = require('../database');
const informationService = require('../services/informationService');
const accountService = require('../services/accountService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllInfo = catchAsync(async (req, res, next) => {
  const allInfo = await informationService.getAllInfoService(req.query);

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: allInfo.length,
    data: {
      infos: allInfo
    }
  });
});

exports.createInfo = catchAsync(async (req, res, next) => {
  const CICExists = await informationService.getInfoByCICService(req.body.CIC);
  if (CICExists) {
    return next(
      new AppError('This CIC has been used! Please check your CIC again', 400)
    );
  }

  const phoneNumberExists = await informationService.getInfoByPhoneNumberService(
    req.body.PhoneNumber
  );
  if (phoneNumberExists) {
    return next(
      new AppError(
        'This phone number has been used! Please use another phone number',
        400
      )
    );
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const newInfo = await informationService.createNewInfoService(
      req.body,
      connection
    );

    await connection.commit();

    res.status(201).json({
      status: 'success',
      data: {
        info: newInfo
      }
    });
  } catch (err) {
    await connection.rollback();
    return next(err);
  } finally {
    connection.release();
  }
});

exports.getInfoById = catchAsync(async (req, res, next) => {
  const info = await informationService.getInfoByIdService(req.params.id);
  if (!info) {
    return next(new AppError(`Info with ID ${req.params.id} not found`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      info
    }
  });
});

exports.updateInfo = catchAsync(async (req, res, next) => {
  const info = await informationService.getInfoByIdService(req.params.id);
  if (!info) {
    return next(new AppError(`Info with ID ${req.params.id} not found`, 404));
  }

  const CICExists = await informationService.getOtherInfoByCICService(
    req.params.id,
    req.body.CIC
  );
  if (CICExists)
    return next(new AppError('This CIC has been used! Please use another CIC'));

  const phoneNumberExists = await informationService.getOtherInfoByPhoneNumberService(
    req.params.id,
    req.body.PhoneNumber
  );
  if (phoneNumberExists)
    return next(
      new AppError(
        'This phone number has been used! Please use another phone number'
      )
    );

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
  const infoExists = await informationService.getInfoByCICService(
    req.Account.CIC
  );
  if (infoExists) {
    return next(
      new AppError('You have already created your information!', 400)
    );
  }

  const CICExists = await informationService.getInfoByCICService(req.body.CIC);
  if (CICExists) {
    return next(
      new AppError('This CIC has been used! Please check your CIC again', 400)
    );
  }

  const phoneNumberExists = await informationService.getInfoByPhoneNumberService(
    req.body.PhoneNumber
  );
  if (phoneNumberExists) {
    return next(
      new AppError(
        'This phone number has been used! Please use another phone number',
        400
      )
    );
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const newInfo = await informationService.createNewInfoService(
      req.body,
      connection
    );
    const account = await accountService.updateAccountCICService(
      req.Account.AccountID,
      newInfo.CIC,
      connection
    );

    await connection.commit();

    res.status(201).json({
      status: 'success',
      data: {
        info: newInfo,
        account
      }
    });
  } catch (err) {
    await connection.rollback();
    return next(err);
  } finally {
    connection.release();
  }
});

exports.updateMyInfo = catchAsync(async (req, res, next) => {
  const myInfo = await informationService.getInfoByAccountCICService(
    req.Account.CIC
  );
  if (!myInfo)
    return next(
      new AppError(
        'This account has no information! Please create your infomation first at /api/v1/accounts/createMyInfo',
        400
      )
    );

  if (req.body.CIC && req.body.CIC !== myInfo.CIC) {
    const CICExists = await informationService.getInfoByCICService(
      req.body.CIC
    );
    if (CICExists) {
      return next(
        new AppError('This CIC has been used! Please check your CIC again', 400)
      );
    }
  }
  if (req.body.PhoneNumber && req.body.PhoneNumber !== myInfo.PhoneNumber) {
    const phoneNumberExists = await informationService.getInfoByPhoneNumberService(
      req.body.PhoneNumber
    );
    if (phoneNumberExists) {
      return next(
        new AppError(
          'This phone number has been used! Please use another phone number',
          400
        )
      );
    }
  }

  const updatedInfo = await informationService.updateInfoService(
    myInfo.InfoID,
    req.body
  );

  res.status(200).json({
    status: 'success',
    data: {
      info: updatedInfo
    }
  });
});
