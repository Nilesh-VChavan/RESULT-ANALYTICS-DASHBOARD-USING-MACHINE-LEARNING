import College from "../models/College.js";
import { getStudentModel } from "../models/Student.js";


/*
|--------------------------------------------------------------------------
| GET ACTIVE COLLEGE
|--------------------------------------------------------------------------
*/

async function getCollegeFromUser(reqUser) {
  const college = await College.findOne({
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
| NORMALIZE STUDENT DATA
|--------------------------------------------------------------------------
*/

function normalizeStudentData(data) {
  return {
    studentId:
      data.studentId
        ?.trim()
        .toUpperCase(),

    name:
      data.name?.trim(),

    email:
      data.email
        ? data.email.trim().toLowerCase()
        : null,

    phone:
      data.phone
        ? data.phone.trim()
        : null,

    department:
      data.department?.trim(),

    academicYear:
      data.academicYear?.trim(),

    semester:
      data.semester !== undefined
        ? Number(data.semester)
        : undefined,

    division:
      data.division
        ? data.division.trim()
        : null,

    admissionYear:
      data.admissionYear !== undefined &&
      data.admissionYear !== null
        ? Number(data.admissionYear)
        : null,

    isActive:
      data.isActive !== undefined
        ? Boolean(data.isActive)
        : true
  };
}


/*
|--------------------------------------------------------------------------
| VALIDATE STUDENT DATA
|--------------------------------------------------------------------------
*/

function validateStudentData(data) {
  if (!data.studentId) {
    throw new Error(
      "Student ID is required"
    );
  }

  if (!data.name) {
    throw new Error(
      "Student name is required"
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
}


/*
|--------------------------------------------------------------------------
| CHECK STUDENT ACCESS
|--------------------------------------------------------------------------
*/

function canAccessStudent(
  reqUser,
  student
) {
  /*
  |--------------------------------------------------------------------------
  | Principal
  |--------------------------------------------------------------------------
  */

  if (reqUser.role === "principal") {
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

  if (reqUser.role === "hod") {
    return (
      reqUser.department &&
      student.department ===
        reqUser.department
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Student
  |--------------------------------------------------------------------------
  */

  if (reqUser.role === "student") {
    return (
      reqUser.studentId &&
      student.studentId ===
        reqUser.studentId
    );
  }

  return false;
}


/*
|--------------------------------------------------------------------------
| GET ALL STUDENTS
|--------------------------------------------------------------------------
*/

export async function getAllStudents(
  reqUser
) {
  const college =
    await getCollegeFromUser(reqUser);

  const Student =
    getStudentModel(
      college.databaseName
    );


  /*
  |--------------------------------------------------------------------------
  | PRINCIPAL
  |--------------------------------------------------------------------------
  */

  if (reqUser.role === "principal") {
    return await Student.find({})
      .sort({
        department: 1,
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
    return await Student.find({})
      .sort({
        department: 1,
        name: 1
      });
  }


  /*
  |--------------------------------------------------------------------------
  | HOD
  |--------------------------------------------------------------------------
  */

  if (reqUser.role === "hod") {
    if (!reqUser.department) {
      return [];
    }

    return await Student.find({
      department: reqUser.department
    }).sort({
      name: 1
    });
  }


  /*
  |--------------------------------------------------------------------------
  | STUDENT
  |--------------------------------------------------------------------------
  */

  if (reqUser.role === "student") {
    if (!reqUser.studentId) {
      return [];
    }

    return await Student.find({
      studentId: reqUser.studentId
    });
  }


  throw new Error("Access denied");
}


/*
|--------------------------------------------------------------------------
| GET DEPARTMENT STUDENTS
|--------------------------------------------------------------------------
*/

export async function getDepartmentStudents(
  reqUser,
  department
) {
  const college =
    await getCollegeFromUser(reqUser);

  const Student =
    getStudentModel(
      college.databaseName
    );

  let departmentName =
    department?.trim();


  /*
  |--------------------------------------------------------------------------
  | HOD
  |--------------------------------------------------------------------------
  |
  | HOD cannot request another department.
  |
  */

  if (reqUser.role === "hod") {
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
  | Student cannot access department list.
  |
  */

  if (reqUser.role === "student") {
    throw new Error(
      "Access denied"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Principal / Exam Department
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


  if (!departmentName) {
    throw new Error(
      "Department is required"
    );
  }

  return await Student.find({
    department: departmentName
  }).sort({
    name: 1
  });
}


/*
|--------------------------------------------------------------------------
| GET STUDENT BY ID
|--------------------------------------------------------------------------
*/

export async function getStudentById(
  reqUser,
  studentId
) {
  const college =
    await getCollegeFromUser(reqUser);

  const Student =
    getStudentModel(
      college.databaseName
    );

  const student =
    await Student.findOne({
      _id: studentId
    });


  if (!student) {
    throw new Error(
      "Student not found"
    );
  }


  if (
    !canAccessStudent(
      reqUser,
      student
    )
  ) {
    throw new Error(
      "Access denied"
    );
  }


  return student;
}


/*
|--------------------------------------------------------------------------
| CREATE STUDENT
|--------------------------------------------------------------------------
*/

export async function createStudent(
  reqUser,
  data
) {
  const college =
    await getCollegeFromUser(reqUser);


  /*
  |--------------------------------------------------------------------------
  | Only Principal and Exam Department
  |--------------------------------------------------------------------------
  */

  if (
    ![
      "principal",
      "exam_department"
    ].includes(reqUser.role)
  ) {
    throw new Error(
      "Access denied"
    );
  }


  const Student =
    getStudentModel(
      college.databaseName
    );


  const studentData =
    normalizeStudentData(data);


  validateStudentData(
    studentData
  );


  /*
  |--------------------------------------------------------------------------
  | CHECK DUPLICATE STUDENT ID
  |--------------------------------------------------------------------------
  */

  const existingStudent =
    await Student.findOne({
      studentId:
        studentData.studentId
    });


  if (existingStudent) {
    throw new Error(
      "Student ID already exists"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | CHECK DUPLICATE EMAIL
  |--------------------------------------------------------------------------
  */

  if (studentData.email) {
    const existingEmail =
      await Student.findOne({
        email:
          studentData.email
      });

    if (existingEmail) {
      throw new Error(
        "Student email already exists"
      );
    }
  }


  const student =
    await Student.create(
      studentData
    );


  return student;
}


/*
|--------------------------------------------------------------------------
| UPDATE STUDENT
|--------------------------------------------------------------------------
*/

export async function updateStudent(
  reqUser,
  studentId,
  data
) {
  const college =
    await getCollegeFromUser(reqUser);


  /*
  |--------------------------------------------------------------------------
  | Only Principal and Exam Department
  |--------------------------------------------------------------------------
  */

  if (
    ![
      "principal",
      "exam_department"
    ].includes(reqUser.role)
  ) {
    throw new Error(
      "Access denied"
    );
  }


  const Student =
    getStudentModel(
      college.databaseName
    );


  const student =
    await Student.findOne({
      _id: studentId
    });


  if (!student) {
    throw new Error(
      "Student not found"
    );
  }


  const studentData =
    normalizeStudentData(data);


  /*
  |--------------------------------------------------------------------------
  | STUDENT ID
  |--------------------------------------------------------------------------
  */

  if (
    studentData.studentId !==
      undefined &&
    studentData.studentId !==
      student.studentId
  ) {
    const duplicate =
      await Student.findOne({
        studentId:
          studentData.studentId,
        _id: {
          $ne: studentId
        }
      });

    if (duplicate) {
      throw new Error(
        "Student ID already exists"
      );
    }

    student.studentId =
      studentData.studentId;
  }


  /*
  |--------------------------------------------------------------------------
  | NAME
  |--------------------------------------------------------------------------
  */

  if (
    studentData.name !==
      undefined
  ) {
    student.name =
      studentData.name;
  }


  /*
  |--------------------------------------------------------------------------
  | EMAIL
  |--------------------------------------------------------------------------
  */

  if (
    studentData.email !==
      undefined
  ) {
    if (studentData.email) {
      const duplicate =
        await Student.findOne({
          email:
            studentData.email,
          _id: {
            $ne: studentId
          }
        });

      if (duplicate) {
        throw new Error(
          "Student email already exists"
        );
      }
    }

    student.email =
      studentData.email;
  }


  /*
  |--------------------------------------------------------------------------
  | PHONE
  |--------------------------------------------------------------------------
  */

  if (
    studentData.phone !==
      undefined
  ) {
    student.phone =
      studentData.phone;
  }


  /*
  |--------------------------------------------------------------------------
  | DEPARTMENT
  |--------------------------------------------------------------------------
  */

  if (
    studentData.department !==
      undefined
  ) {
    student.department =
      studentData.department;
  }


  /*
  |--------------------------------------------------------------------------
  | ACADEMIC YEAR
  |--------------------------------------------------------------------------
  */

  if (
    studentData.academicYear !==
      undefined
  ) {
    student.academicYear =
      studentData.academicYear;
  }


  /*
  |--------------------------------------------------------------------------
  | SEMESTER
  |--------------------------------------------------------------------------
  */

  if (
    studentData.semester !==
      undefined
  ) {
    if (
      studentData.semester < 1 ||
      studentData.semester > 8
    ) {
      throw new Error(
        "Semester must be between 1 and 8"
      );
    }

    student.semester =
      studentData.semester;
  }


  /*
  |--------------------------------------------------------------------------
  | DIVISION
  |--------------------------------------------------------------------------
  */

  if (
    studentData.division !==
      undefined
  ) {
    student.division =
      studentData.division;
  }


  /*
  |--------------------------------------------------------------------------
  | ADMISSION YEAR
  |--------------------------------------------------------------------------
  */

  if (
    studentData.admissionYear !==
      undefined
  ) {
    student.admissionYear =
      studentData.admissionYear;
  }


  /*
  |--------------------------------------------------------------------------
  | ACTIVE STATUS
  |--------------------------------------------------------------------------
  */

  if (
    studentData.isActive !==
      undefined
  ) {
    student.isActive =
      studentData.isActive;
  }


  await student.save();

  return student;
}


/*
|--------------------------------------------------------------------------
| DELETE STUDENT
|--------------------------------------------------------------------------
*/

export async function deleteStudent(
  reqUser,
  studentId
) {
  const college =
    await getCollegeFromUser(reqUser);


  /*
  |--------------------------------------------------------------------------
  | Only Principal and Exam Department
  |--------------------------------------------------------------------------
  */

  if (
    ![
      "principal",
      "exam_department"
    ].includes(reqUser.role)
  ) {
    throw new Error(
      "Access denied"
    );
  }


  const Student =
    getStudentModel(
      college.databaseName
    );


  const student =
    await Student.findOne({
      _id: studentId
    });


  if (!student) {
    throw new Error(
      "Student not found"
    );
  }


  await Student.findByIdAndDelete(
    studentId
  );


  return true;
}