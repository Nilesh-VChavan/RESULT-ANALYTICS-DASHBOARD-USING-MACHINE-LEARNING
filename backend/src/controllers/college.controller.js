// backend/src/controllers/college.controller.js

import {
  registerCollege,
  getAllColleges,
  getCollegeById,
  getCollegeByCode,
  updateCollege,
  setCollegeStatus,
  deleteCollegeService
} from "../services/college.service.js";


export async function register(req, res, next) {
  try {
    const college = await registerCollege(req.body);

    res.status(201).json({
      success: true,
      message: "College registered successfully",
      data: college
    });
  } catch (error) {
    next(error);
  }
}


export async function getAll(req, res, next) {
  try {
    const colleges = await getAllColleges();

    res.json({
      success: true,
      count: colleges.length,
      data: colleges
    });
  } catch (error) {
    next(error);
  }
}


export async function getById(req, res, next) {
  try {
    const college = await getCollegeById(req.params.id);

    res.json({
      success: true,
      data: college
    });
  } catch (error) {
    next(error);
  }
}


export async function getByCode(req, res, next) {
  try {
    const college = await getCollegeByCode(req.params.code);

    res.json({
      success: true,
      data: college
    });
  } catch (error) {
    next(error);
  }
}


export async function update(req, res, next) {
  try {
    const college = await updateCollege(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      message: "College updated successfully",
      data: college
    });
  } catch (error) {
    next(error);
  }
}


export async function activate(req, res, next) {
  try {
    const college = await setCollegeStatus(
      req.params.id,
      "active"
    );

    res.json({
      success: true,
      message: "College activated",
      data: college
    });
  } catch (error) {
    next(error);
  }
}


export async function deactivate(req, res, next) {
  try {
    const college = await setCollegeStatus(
      req.params.id,
      "inactive"
    );

    res.json({
      success: true,
      message: "College deactivated",
      data: college
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| DELETE COLLEGE
|--------------------------------------------------------------------------
*/

export async function deleteCollege(req, res, next) {
  try {
    const result = await deleteCollegeService(
      req.params.id
    );

    res.json({
      success: true,
      message: "College and all related records deleted successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
}