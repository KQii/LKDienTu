const informationModel = require('../models/informationModel');
const AppError = require('../utils/appError');

exports.getAllInfoService = async () => {
  const allInfo = await informationModel.getAllInfo();
  return allInfo;
};

exports.createNewInfoService = async infoData => {
  const result = await informationModel.createInfo(infoData);
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
  const info = await informationModel.getInfoById(CIC);
  if (!info) {
    throw new AppError(`Info with ID ${CIC} not found`, 404);
  }
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
