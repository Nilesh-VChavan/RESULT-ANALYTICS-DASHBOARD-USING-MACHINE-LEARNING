// backend/src/services/college.service.js

import College from "../models/College.js";

import {
  createCollegeDatabaseName,
  provisionCollegeDatabase,
  getCollegeDatabase
} from "../utils/collegeDb.js";


export async function registerCollege(data) {
  const existing = await College.findOne({
    collegeCode: data.collegeCode
  });

  if (existing) {
    const error = new Error("College code already exists");
    error.status = 409;
    throw error;
  }

  const databaseName =
    createCollegeDatabaseName(
      data.collegeCode
    );

  const college = await College.create({
    ...data,
    databaseName,
    status: "active"
  });

  try {
    await provisionCollegeDatabase(
      databaseName
    );
  } catch (error) {
    await College.findByIdAndDelete(
      college._id
    );

    throw error;
  }

  return college;
}


export async function getAllColleges() {
  return College.find().sort({
    createdAt: -1
  });
}


export async function getCollegeById(id) {
  const college =
    await College.findById(id);

  if (!college) {
    const error =
      new Error("College not found");

    error.status = 404;

    throw error;
  }

  return college;
}


export async function getCollegeByCode(
  collegeCode
) {
  const college =
    await College.findOne({
      collegeCode:
        collegeCode.toUpperCase()
    });

  if (!college) {
    const error =
      new Error("College not found");

    error.status = 404;

    throw error;
  }

  return college;
}


export async function updateCollege(
  id,
  data
) {
  const college =
    await College.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true
      }
    );

  if (!college) {
    const error =
      new Error("College not found");

    error.status = 404;

    throw error;
  }

  return college;
}


export async function setCollegeStatus(
  id,
  status
) {
  const college =
    await College.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true
      }
    );

  if (!college) {
    const error =
      new Error("College not found");

    error.status = 404;

    throw error;
  }

  return college;
}


/*
|--------------------------------------------------------------------------
| DELETE COLLEGE
|--------------------------------------------------------------------------
|
| Deletes:
|
| 1. College database
| 2. users
| 3. departments
| 4. students
| 5. subjects
| 6. results
| 7. resultUploads
| 8. College record from platform database
|
|--------------------------------------------------------------------------
*/

export async function deleteCollegeService(
  id
) {
  const college =
    await College.findById(id);

  if (!college) {
    const error =
      new Error("College not found");

    error.status = 404;

    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | GET COLLEGE DATABASE
  |--------------------------------------------------------------------------
  */

  const collegeDB =
    getCollegeDatabase(
      college.databaseName
    );


  /*
  |--------------------------------------------------------------------------
  | DELETE COMPLETE COLLEGE DATABASE
  |--------------------------------------------------------------------------
  |
  | This removes all collections and
  | all records belonging to the college.
  |
  */

  await collegeDB.dropDatabase();


  /*
  |--------------------------------------------------------------------------
  | DELETE COLLEGE FROM PLATFORM DATABASE
  |--------------------------------------------------------------------------
  */

  await College.findByIdAndDelete(
    college._id
  );


  return {
    collegeId: college._id,
    collegeName: college.collegeName,
    collegeCode: college.collegeCode,
    databaseName: college.databaseName
  };
}