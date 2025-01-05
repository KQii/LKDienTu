const informationModel = require('../models/informationModel');
const AppError = require('../utils/appError');

exports.getAllInfoService = async () => {
  const allInfo = await informationModel.getAllInfo();
  return allInfo;
};

exports.createNewInfoService = async (infoData, connection) => {
  const result = await informationModel.createInfoWithTrans(
    infoData,
    connection
  );
  return result;
};

exports.getInfoByIdService = async id => {
  const info = await informationModel.getInfoById(id);
  if (!info) {
    throw new AppError(`Info with ID ${id} not found`, 404);
  }
  return info;
};

exports.getInfoByCICService = async CIC => {
  const info = await informationModel.getInfoByCIC(CIC);
  return info;
};

exports.updateInfoService = async (id, infoData) => {
  const { updatedInfo } = await informationModel.updateInfoById(id, infoData);
  return updatedInfo;
};

exports.deleteInfoService = async id => {
  const result = await informationModel.deleteInfoById(id);
  if (result.affectedRows === 0) {
    throw new AppError(`Info with ID ${id} not found`, 404);
  }
};

exports.getInfoByPhoneNumberService = async phoneNumber => {
  const info = await informationModel.getInfoByPhoneNumber(phoneNumber);
  return info;
};

exports.getInfoByAccountCICService = async CIC => {
  const info = await informationModel.getInfoByAccountCIC(CIC);
  return info;
};
