import College from "../models/College.js";
import { getSubjectModel } from "../models/Subject.js";


/*
|--------------------------------------------------------------------------
| GET ACTIVE COLLEGE
|--------------------------------------------------------------------------
*/

async function getCollegeFromUser(
  reqUser
) {
  const college =
    await College.findOne({
      _id: reqUser.collegeId,
      status: "active"
    });

  if (!college) {
    throw new Error(
      "Active college not found"
    );
  }

  return college;
}


/*
|--------------------------------------------------------------------------
| NORMALIZE SUBJECT DATA
|--------------------------------------------------------------------------
*/

function normalizeSubjectData(
  data
) {
  return {
    code:
      data.code !== undefined
        ? data.code
            .trim()
            .toUpperCase()
        : undefined,

    name:
      data.name !== undefined
        ? data.name.trim()
        : undefined,

    department:
      data.department !== undefined
        ? data.department.trim()
        : undefined,

    semester:
      data.semester !== undefined
        ? Number(data.semester)
        : undefined,

    academicYear:
      data.academicYear !== undefined
        ? data.academicYear.trim()
        : undefined,

    credits:
      data.credits !== undefined
        ? Number(data.credits)
        : undefined,

    description:
      data.description !== undefined
        ? data.description
        : undefined,

    isActive:
      data.isActive !== undefined
        ? Boolean(data.isActive)
        : undefined
  };
}


/*
|--------------------------------------------------------------------------
| VALIDATE SUBJECT DATA
|--------------------------------------------------------------------------
*/

function validateSubjectData(
  data
) {
  if (!data.code) {
    throw new Error(
      "Subject code is required"
    );
  }

  if (!data.name) {
    throw new Error(
      "Subject name is required"
    );
  }

  if (!data.department) {
    throw new Error(
      "Department is required"
    );
  }

  if (!data.academicYear) {
    throw new Error(
      "Academic year is required"
    );
  }

  if (
    data.semester === undefined ||
    data.semester === null ||
    Number.isNaN(data.semester)
  ) {
    throw new Error(
      "Semester is required"
    );
  }

  if (
    data.semester < 1 ||
    data.semester > 8
  ) {
    throw new Error(
      "Semester must be between 1 and 8"
    );
  }

  if (
    data.credits !== undefined &&
    (
      Number.isNaN(data.credits) ||
      data.credits < 0
    )
  ) {
    throw new Error(
      "Credits must be a valid positive number"
    );
  }
}


/*
|--------------------------------------------------------------------------
| CHECK SUBJECT ACCESS
|--------------------------------------------------------------------------
*/

function canAccessSubject(
  reqUser,
  subject
) {
  /*
  |--------------------------------------------------------------------------
  | Principal
  |--------------------------------------------------------------------------
  */

  if (
    reqUser.role === "principal"
  ) {
    return true;
  }


  /*
  |--------------------------------------------------------------------------
  | Exam Department
  |--------------------------------------------------------------------------
  */

  if (
    reqUser.role === "exam_department"
  ) {
    return true;
  }


  /*
  |--------------------------------------------------------------------------
  | HOD
  |--------------------------------------------------------------------------
  */

  if (
    reqUser.role === "hod"
  ) {
    return (
      reqUser.department &&
      subject.department ===
        reqUser.department
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Student
  |--------------------------------------------------------------------------
  */

  if (
    reqUser.role === "student"
  ) {
    return (
      reqUser.department &&
      subject.department ===
        reqUser.department
    );
  }


  return false;
}


/*
|--------------------------------------------------------------------------
| GET ALL SUBJECTS
|--------------------------------------------------------------------------
*/

export async function getAllSubjects(
  reqUser
) {
  const college =
    await getCollegeFromUser(
      reqUser
    );

  const Subject =
    getSubjectModel(
      college.databaseName
    );


  /*
  |--------------------------------------------------------------------------
  | PRINCIPAL
  |--------------------------------------------------------------------------
  */

  if (
    reqUser.role === "principal"
  ) {
    return await Subject.find({})
      .sort({
        department: 1,
        semester: 1,
        name: 1
      });
  }


  /*
  |--------------------------------------------------------------------------
  | EXAM DEPARTMENT
  |--------------------------------------------------------------------------
  */

  if (
    reqUser.role === "exam_department"
  ) {
    return await Subject.find({})
      .sort({
        department: 1,
        semester: 1,
        name: 1
      });
  }


  /*
  |--------------------------------------------------------------------------
  | HOD
  |--------------------------------------------------------------------------
  */

  if (
    reqUser.role === "hod"
  ) {
    if (!reqUser.department) {
      return [];
    }

    return await Subject.find({
      department:
        reqUser.department
    }).sort({
      semester: 1,
      name: 1
    });
  }


  /*
  |--------------------------------------------------------------------------
  | STUDENT
  |--------------------------------------------------------------------------
  */

  if (
    reqUser.role === "student"
  ) {
    if (!reqUser.department) {
      return [];
    }

    return await Subject.find({
      department:
        reqUser.department
    }).sort({
      semester: 1,
      name: 1
    });
  }


  throw new Error(
    "Access denied"
  );
}


/*
|--------------------------------------------------------------------------
| GET DEPARTMENT SUBJECTS
|--------------------------------------------------------------------------
*/

export async function getDepartmentSubjects(
  reqUser,
  department
) {
  const college =
    await getCollegeFromUser(
      reqUser
    );

  const Subject =
    getSubjectModel(
      college.databaseName
    );


  let departmentName =
    department?.trim();


  /*
  |--------------------------------------------------------------------------
  | HOD
  |--------------------------------------------------------------------------
  |
  | HOD can only access own department.
  |
  */

  if (
    reqUser.role === "hod"
  ) {
    if (!reqUser.department) {
      return [];
    }

    departmentName =
      reqUser.department;
  }


  /*
  |--------------------------------------------------------------------------
  | STUDENT
  |--------------------------------------------------------------------------
  |
  | Student can only access own department.
  |
  */

  if (
    reqUser.role === "student"
  ) {
    if (!reqUser.department) {
      return [];
    }

    departmentName =
      reqUser.department;
  }


  /*
  |--------------------------------------------------------------------------
  | ALLOWED ROLES
  |--------------------------------------------------------------------------
  */

  if (
    ![
      "principal",
      "exam_department",
      "hod",
      "student"
    ].includes(reqUser.role)
  ) {
    throw new Error(
      "Access denied"
    );
  }


  if (!departmentName) {
    throw new Error(
      "Department is required"
    );
  }


  return await Subject.find({
    department:
      departmentName
  }).sort({
    semester: 1,
    name: 1
  });
}


/*
|--------------------------------------------------------------------------
| GET SUBJECT BY ID
|--------------------------------------------------------------------------
*/

export async function getSubjectById(
  reqUser,
  subjectId
) {
  const college =
    await getCollegeFromUser(
      reqUser
    );

  const Subject =
    getSubjectModel(
      college.databaseName
    );


  const subject =
    await Subject.findById(
      subjectId
    );


  if (!subject) {
    throw new Error(
      "Subject not found"
    );
  }


  if (
    !canAccessSubject(
      reqUser,
      subject
    )
  ) {
    throw new Error(
      "Access denied"
    );
  }


  return subject;
}


/*
|--------------------------------------------------------------------------
| CREATE SUBJECT
|--------------------------------------------------------------------------
*/

export async function createSubject(
  reqUser,
  data
) {
  const college =
    await getCollegeFromUser(
      reqUser
    );


  /*
  |--------------------------------------------------------------------------
  | PRINCIPAL / EXAM DEPARTMENT
  |--------------------------------------------------------------------------
  */

  if (
    [
      "principal",
      "exam_department"
    ].includes(reqUser.role)
  ) {
    // allowed
  }


  /*
  |--------------------------------------------------------------------------
  | HOD
  |--------------------------------------------------------------------------
  */

  else if (
    reqUser.role === "hod"
  ) {
    if (!reqUser.department) {
      throw new Error(
        "HOD department not found"
      );
    }

    if (
      data.department?.trim() !==
      reqUser.department
    ) {
      throw new Error(
        "HOD can create subjects only for own department"
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | OTHER ROLES
  |--------------------------------------------------------------------------
  */

  else {
    throw new Error(
      "Access denied"
    );
  }


  const Subject =
    getSubjectModel(
      college.databaseName
    );


  const subjectData =
    normalizeSubjectData(
      data
    );


  validateSubjectData(
    subjectData
  );


  /*
  |--------------------------------------------------------------------------
  | DUPLICATE SUBJECT CODE
  |--------------------------------------------------------------------------
  */

  const existingSubject =
    await Subject.findOne({
      code:
        subjectData.code
    });


  if (existingSubject) {
    throw new Error(
      "Subject code already exists"
    );
  }


  const subject =
    await Subject.create({
      code:
        subjectData.code,

      name:
        subjectData.name,

      department:
        subjectData.department,

      semester:
        subjectData.semester,

      academicYear:
        subjectData.academicYear,

      credits:
        subjectData.credits ??
        0,

      description:
        subjectData.description ||
        "",

      isActive: true
    });


  return subject;
}


/*
|--------------------------------------------------------------------------
| UPDATE SUBJECT
|--------------------------------------------------------------------------
*/

export async function updateSubject(
  reqUser,
  subjectId,
  data
) {
  const college =
    await getCollegeFromUser(
      reqUser
    );

  const Subject =
    getSubjectModel(
      college.databaseName
    );


  const subject =
    await Subject.findById(
      subjectId
    );


  if (!subject) {
    throw new Error(
      "Subject not found"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | HOD ACCESS
  |--------------------------------------------------------------------------
  */

  if (
    reqUser.role === "hod"
  ) {
    if (
      subject.department !==
      reqUser.department
    ) {
      throw new Error(
        "HOD can update subjects only for own department"
      );
    }

    if (
      data.department !==
        undefined &&
      data.department.trim() !==
        reqUser.department
    ) {
      throw new Error(
        "HOD cannot change subject to another department"
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | STUDENT
  |--------------------------------------------------------------------------
  */

  if (
    reqUser.role === "student"
  ) {
    throw new Error(
      "Access denied"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | ROLE CHECK
  |--------------------------------------------------------------------------
  */

  if (
    ![
      "principal",
      "exam_department",
      "hod"
    ].includes(reqUser.role)
  ) {
    throw new Error(
      "Access denied"
    );
  }


  const subjectData =
    normalizeSubjectData(
      data
    );


  /*
  |--------------------------------------------------------------------------
  | CODE
  |--------------------------------------------------------------------------
  */

  if (
    subjectData.code !==
      undefined
  ) {
    const duplicate =
      await Subject.findOne({
        code:
          subjectData.code,
        _id: {
          $ne: subjectId
        }
      });


    if (duplicate) {
      throw new Error(
        "Subject code already exists"
      );
    }


    subject.code =
      subjectData.code;
  }


  /*
  |--------------------------------------------------------------------------
  | NAME
  |--------------------------------------------------------------------------
  */

  if (
    subjectData.name !==
      undefined
  ) {
    subject.name =
      subjectData.name;
  }


  /*
  |--------------------------------------------------------------------------
  | DEPARTMENT
  |--------------------------------------------------------------------------
  */

  if (
    subjectData.department !==
      undefined
  ) {
    subject.department =
      subjectData.department;
  }


  /*
  |--------------------------------------------------------------------------
  | SEMESTER
  |--------------------------------------------------------------------------
  */

  if (
    subjectData.semester !==
      undefined
  ) {
    if (
      subjectData.semester < 1 ||
      subjectData.semester > 8
    ) {
      throw new Error(
        "Semester must be between 1 and 8"
      );
    }

    subject.semester =
      subjectData.semester;
  }


  /*
  |--------------------------------------------------------------------------
  | ACADEMIC YEAR
  |--------------------------------------------------------------------------
  */

  if (
    subjectData.academicYear !==
      undefined
  ) {
    subject.academicYear =
      subjectData.academicYear;
  }


  /*
  |--------------------------------------------------------------------------
  | CREDITS
  |--------------------------------------------------------------------------
  */

  if (
    subjectData.credits !==
      undefined
  ) {
    if (
      subjectData.credits < 0
    ) {
      throw new Error(
        "Credits cannot be negative"
      );
    }

    subject.credits =
      subjectData.credits;
  }


  /*
  |--------------------------------------------------------------------------
  | DESCRIPTION
  |--------------------------------------------------------------------------
  */

  if (
    subjectData.description !==
      undefined
  ) {
    subject.description =
      subjectData.description;
  }


  /*
  |--------------------------------------------------------------------------
  | ACTIVE STATUS
  |--------------------------------------------------------------------------
  */

  if (
    subjectData.isActive !==
      undefined
  ) {
    subject.isActive =
      subjectData.isActive;
  }


  await subject.save();


  return subject;
}


/*
|--------------------------------------------------------------------------
| DELETE SUBJECT
|--------------------------------------------------------------------------
*/

export async function deleteSubject(
  reqUser,
  subjectId
) {
  const college =
    await getCollegeFromUser(
      reqUser
    );

  const Subject =
    getSubjectModel(
      college.databaseName
    );


  const subject =
    await Subject.findById(
      subjectId
    );


  if (!subject) {
    throw new Error(
      "Subject not found"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | HOD
  |--------------------------------------------------------------------------
  */

  if (
    reqUser.role === "hod"
  ) {
    if (
      subject.department !==
      reqUser.department
    ) {
      throw new Error(
        "HOD can delete subjects only for own department"
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | STUDENT
  |--------------------------------------------------------------------------
  */

  if (
    reqUser.role === "student"
  ) {
    throw new Error(
      "Access denied"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | ROLE CHECK
  |--------------------------------------------------------------------------
  */

  if (
    ![
      "principal",
      "exam_department",
      "hod"
    ].includes(reqUser.role)
  ) {
    throw new Error(
      "Access denied"
    );
  }


  await Subject.findByIdAndDelete(
    subjectId
  );


  return true;
}