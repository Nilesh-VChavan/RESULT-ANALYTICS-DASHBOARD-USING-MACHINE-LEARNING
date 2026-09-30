import College from "../models/College.js";
import { getResultModel } from "../models/Result.js";
import { getStudentModel } from "../models/Student.js";
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
| CALCULATE PERCENTAGE
|--------------------------------------------------------------------------
*/

function calculatePercentage(
  marksObtained,
  maxMarks
) {
  return Number(
    (
      (marksObtained / maxMarks) *
      100
    ).toFixed(2)
  );
}


/*
|--------------------------------------------------------------------------
| CALCULATE GRADE
|--------------------------------------------------------------------------
*/

function calculateGrade(
  percentage
) {
  if (percentage >= 90) {
    return {
      grade: "A+",
      gradePoint: 10
    };
  }

  if (percentage >= 80) {
    return {
      grade: "A",
      gradePoint: 9
    };
  }

  if (percentage >= 70) {
    return {
      grade: "B+",
      gradePoint: 8
    };
  }

  if (percentage >= 60) {
    return {
      grade: "B",
      gradePoint: 7
    };
  }

  if (percentage >= 50) {
    return {
      grade: "C",
      gradePoint: 6
    };
  }

  if (percentage >= 40) {
    return {
      grade: "D",
      gradePoint: 5
    };
  }

  return {
    grade: "F",
    gradePoint: 0
  };
}


/*
|--------------------------------------------------------------------------
| NORMALIZE RESULT DATA
|--------------------------------------------------------------------------
*/

function normalizeResultData(
  data
) {
  return {
    studentId:
      data.studentId !== undefined
        ? data.studentId
            .trim()
            .toUpperCase()
        : undefined,

    subjectId:
      data.subjectId !== undefined
        ? data.subjectId
        : undefined,

    academicYear:
      data.academicYear !== undefined
        ? data.academicYear.trim()
        : undefined,

    semester:
      data.semester !== undefined
        ? Number(data.semester)
        : undefined,

    examType:
      data.examType !== undefined
        ? data.examType.trim()
        : undefined,

    marksObtained:
      data.marksObtained !== undefined
        ? Number(data.marksObtained)
        : undefined,

    maxMarks:
      data.maxMarks !== undefined
        ? Number(data.maxMarks)
        : undefined,

    remarks:
      data.remarks !== undefined
        ? data.remarks
        : undefined,

    isPublished:
      data.isPublished !== undefined
        ? Boolean(data.isPublished)
        : undefined
  };
}


/*
|--------------------------------------------------------------------------
| VALIDATE RESULT DATA
|--------------------------------------------------------------------------
*/

function validateResultData(
  data
) {
  if (!data.studentId) {
    throw new Error(
      "Student ID is required"
    );
  }

  if (!data.subjectId) {
    throw new Error(
      "Subject ID is required"
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

  if (!data.examType) {
    throw new Error(
      "Exam type is required"
    );
  }

  if (
    data.marksObtained === undefined ||
    Number.isNaN(data.marksObtained)
  ) {
    throw new Error(
      "Marks obtained is required"
    );
  }

  if (
    data.maxMarks === undefined ||
    Number.isNaN(data.maxMarks)
  ) {
    throw new Error(
      "Maximum marks is required"
    );
  }

  if (
    data.maxMarks <= 0
  ) {
    throw new Error(
      "Maximum marks must be greater than 0"
    );
  }

  if (
    data.marksObtained < 0
  ) {
    throw new Error(
      "Marks obtained cannot be negative"
    );
  }

  if (
    data.marksObtained >
    data.maxMarks
  ) {
    throw new Error(
      "Marks obtained cannot exceed maximum marks"
    );
  }
}


/*
|--------------------------------------------------------------------------
| CHECK ROLE
|--------------------------------------------------------------------------
*/

function isManagementRole(
  role
) {
  return [
    "principal",
    "exam_department"
  ].includes(role);
}


/*
|--------------------------------------------------------------------------
| GET ALL RESULTS
|--------------------------------------------------------------------------
*/

export async function getAllResults(
  reqUser
) {
  const college =
    await getCollegeFromUser(
      reqUser
    );

  const Result =
    getResultModel(
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
    return await Result.find({})
      .sort({
        department: 1,
        semester: 1,
        studentName: 1
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
    return await Result.find({})
      .sort({
        department: 1,
        semester: 1,
        studentName: 1
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

    return await Result.find({
      department:
        reqUser.department
    }).sort({
      semester: 1,
      studentName: 1
    });
  }


  /*
  |--------------------------------------------------------------------------
  | STUDENT
  |--------------------------------------------------------------------------
  |
  | Student can see only own published results.
  |
  */

  if (
    reqUser.role === "student"
  ) {
    if (!reqUser.studentId) {
      return [];
    }

    return await Result.find({
      studentId:
        reqUser.studentId,
      isPublished: true
    }).sort({
      semester: 1,
      subjectName: 1
    });
  }


  throw new Error(
    "Access denied"
  );
}


/*
|--------------------------------------------------------------------------
| GET DEPARTMENT RESULTS
|--------------------------------------------------------------------------
*/

export async function getDepartmentResults(
  reqUser,
  department
) {
  const college =
    await getCollegeFromUser(
      reqUser
    );

  const Result =
    getResultModel(
      college.databaseName
    );


  let departmentName =
    department?.trim();


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

    departmentName =
      reqUser.department;
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
  | ALLOWED ROLES
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


  return await Result.find({
    department:
      departmentName
  }).sort({
    semester: 1,
    studentName: 1
  });
}


/*
|--------------------------------------------------------------------------
| GET STUDENT RESULTS
|--------------------------------------------------------------------------
*/

export async function getStudentResults(
  reqUser,
  studentId
) {
  const college =
    await getCollegeFromUser(
      reqUser
    );

  const Result =
    getResultModel(
      college.databaseName
    );


  let targetStudentId =
    studentId?.trim()
      .toUpperCase();


  /*
  |--------------------------------------------------------------------------
  | STUDENT
  |--------------------------------------------------------------------------
  |
  | Student can only access own results.
  |
  */

  if (
    reqUser.role === "student"
  ) {
    if (!reqUser.studentId) {
      return [];
    }

    targetStudentId =
      reqUser.studentId
        .toUpperCase();
  }


  /*
  |--------------------------------------------------------------------------
  | HOD
  |--------------------------------------------------------------------------
  |
  | HOD can access students belonging
  | to own department only.
  |
  */

  if (
    reqUser.role === "hod"
  ) {
    const Student =
      getStudentModel(
        college.databaseName
      );

    const student =
      await Student.findOne({
        studentId:
          targetStudentId
      });

    if (!student) {
      throw new Error(
        "Student not found"
      );
    }

    if (
      student.department !==
      reqUser.department
    ) {
      throw new Error(
        "Access denied"
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | MANAGEMENT
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


  if (!targetStudentId) {
    throw new Error(
      "Student ID is required"
    );
  }


  const query = {
    studentId:
      targetStudentId
  };


  /*
  | Student sees only published results.
  */

  if (
    reqUser.role === "student"
  ) {
    query.isPublished = true;
  }


  return await Result.find(
    query
  ).sort({
    semester: 1,
    subjectName: 1
  });
}


/*
|--------------------------------------------------------------------------
| GET RESULT BY ID
|--------------------------------------------------------------------------
*/

export async function getResultById(
  reqUser,
  resultId
) {
  const college =
    await getCollegeFromUser(
      reqUser
    );

  const Result =
    getResultModel(
      college.databaseName
    );


  const result =
    await Result.findById(
      resultId
    );


  if (!result) {
    throw new Error(
      "Result not found"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | PRINCIPAL / EXAM DEPARTMENT
  |--------------------------------------------------------------------------
  */

  if (
    isManagementRole(
      reqUser.role
    )
  ) {
    return result;
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
      result.department !==
      reqUser.department
    ) {
      throw new Error(
        "Access denied"
      );
    }

    return result;
  }


  /*
  |--------------------------------------------------------------------------
  | STUDENT
  |--------------------------------------------------------------------------
  */

  if (
    reqUser.role === "student"
  ) {
    if (
      result.studentId !==
      reqUser.studentId
    ) {
      throw new Error(
        "Access denied"
      );
    }

    if (!result.isPublished) {
      throw new Error(
        "Result is not published"
      );
    }

    return result;
  }


  throw new Error(
    "Access denied"
  );
}


/*
|--------------------------------------------------------------------------
| CREATE RESULT
|--------------------------------------------------------------------------
*/

export async function createResult(
  reqUser,
  data
) {
  const college =
    await getCollegeFromUser(
      reqUser
    );


  /*
  |--------------------------------------------------------------------------
  | STUDENT CANNOT CREATE RESULT
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
  | ALLOWED ROLES
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


  const Result =
    getResultModel(
      college.databaseName
    );

  const Student =
    getStudentModel(
      college.databaseName
    );

  const Subject =
    getSubjectModel(
      college.databaseName
    );


  const resultData =
    normalizeResultData(
      data
    );


  validateResultData(
    resultData
  );


  /*
  |--------------------------------------------------------------------------
  | GET STUDENT
  |--------------------------------------------------------------------------
  */

  const student =
    await Student.findOne({
      studentId:
        resultData.studentId,
      isActive: true
    });


  if (!student) {
    throw new Error(
      "Active student not found"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | HOD OWN DEPARTMENT CHECK
  |--------------------------------------------------------------------------
  */

  if (
    reqUser.role === "hod"
  ) {
    if (
      student.department !==
      reqUser.department
    ) {
      throw new Error(
        "HOD can create results only for own department"
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | GET SUBJECT
  |--------------------------------------------------------------------------
  */

  const subject =
    await Subject.findById(
      resultData.subjectId
    );


  if (!subject) {
    throw new Error(
      "Subject not found"
    );
  }


  if (!subject.isActive) {
    throw new Error(
      "Subject is inactive"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | STUDENT / SUBJECT DEPARTMENT CHECK
  |--------------------------------------------------------------------------
  */

  if (
    student.department !==
    subject.department
  ) {
    throw new Error(
      "Student and subject must belong to the same department"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | SEMESTER CHECK
  |--------------------------------------------------------------------------
  */

  if (
    student.semester !==
    resultData.semester
  ) {
    throw new Error(
      "Result semester does not match student semester"
    );
  }


  if (
    subject.semester !==
    resultData.semester
  ) {
    throw new Error(
      "Result semester does not match subject semester"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | DUPLICATE RESULT CHECK
  |--------------------------------------------------------------------------
  */

  const existingResult =
    await Result.findOne({
      studentId:
        resultData.studentId,

      subjectId:
        resultData.subjectId,

      academicYear:
        resultData.academicYear,

      semester:
        resultData.semester,

      examType:
        resultData.examType
    });


  if (existingResult) {
    throw new Error(
      "Result already exists for this student, subject, semester and exam type"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | MARKS
  |--------------------------------------------------------------------------
  */

  const percentage =
    calculatePercentage(
      resultData.marksObtained,
      resultData.maxMarks
    );


  const gradeData =
    calculateGrade(
      percentage
    );


  let resultStatus =
    percentage >= 40
      ? "pass"
      : "fail";


  /*
  |--------------------------------------------------------------------------
  | CREATE RESULT
  |--------------------------------------------------------------------------
  */

  const result =
    await Result.create({
      studentId:
        student.studentId,

      studentName:
        student.name,

      subjectId:
        subject._id,

      subjectCode:
        subject.code,

      subjectName:
        subject.name,

      department:
        student.department,

      academicYear:
        resultData.academicYear,

      semester:
        resultData.semester,

      examType:
        resultData.examType,

      marksObtained:
        resultData.marksObtained,

      maxMarks:
        resultData.maxMarks,

      percentage,

      grade:
        gradeData.grade,

      gradePoint:
        gradeData.gradePoint,

      resultStatus,

      remarks:
        resultData.remarks || "",

      isPublished:
        resultData.isPublished ??
        false
    });


  return result;
}


/*
|--------------------------------------------------------------------------
| UPDATE RESULT
|--------------------------------------------------------------------------
*/

export async function updateResult(
  reqUser,
  resultId,
  data
) {
  const college =
    await getCollegeFromUser(
      reqUser
    );


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


  const Result =
    getResultModel(
      college.databaseName
    );


  const result =
    await Result.findById(
      resultId
    );


  if (!result) {
    throw new Error(
      "Result not found"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | HOD OWN DEPARTMENT CHECK
  |--------------------------------------------------------------------------
  */

  if (
    reqUser.role === "hod" &&
    result.department !==
      reqUser.department
  ) {
    throw new Error(
      "HOD can update results only for own department"
    );
  }


  const Student =
    getStudentModel(
      college.databaseName
    );

  const Subject =
    getSubjectModel(
      college.databaseName
    );


  const resultData =
    normalizeResultData(
      data
    );


  /*
  |--------------------------------------------------------------------------
  | STUDENT
  |--------------------------------------------------------------------------
  */

  if (
    resultData.studentId !==
      undefined &&
    resultData.studentId !==
      result.studentId
  ) {
    const student =
      await Student.findOne({
        studentId:
          resultData.studentId,
        isActive: true
      });

    if (!student) {
      throw new Error(
        "Active student not found"
      );
    }

    if (
      reqUser.role === "hod" &&
      student.department !==
        reqUser.department
    ) {
      throw new Error(
        "HOD can update results only for own department"
      );
    }

    result.studentId =
      student.studentId;

    result.studentName =
      student.name;

    result.department =
      student.department;
  }


  /*
  |--------------------------------------------------------------------------
  | SUBJECT
  |--------------------------------------------------------------------------
  */

  if (
    resultData.subjectId !==
      undefined
  ) {
    const subject =
      await Subject.findById(
        resultData.subjectId
      );

    if (!subject) {
      throw new Error(
        "Subject not found"
      );
    }

    if (!subject.isActive) {
      throw new Error(
        "Subject is inactive"
      );
    }

    if (
      reqUser.role === "hod" &&
      subject.department !==
        reqUser.department
    ) {
      throw new Error(
        "HOD can update subjects only for own department"
      );
    }

    result.subjectId =
      subject._id;

    result.subjectCode =
      subject.code;

    result.subjectName =
      subject.name;

    result.department =
      subject.department;
  }


  /*
  |--------------------------------------------------------------------------
  | ACADEMIC YEAR
  |--------------------------------------------------------------------------
  */

  if (
    resultData.academicYear !==
      undefined
  ) {
    result.academicYear =
      resultData.academicYear;
  }


  /*
  |--------------------------------------------------------------------------
  | SEMESTER
  |--------------------------------------------------------------------------
  */

  if (
    resultData.semester !==
      undefined
  ) {
    if (
      resultData.semester < 1 ||
      resultData.semester > 8
    ) {
      throw new Error(
        "Semester must be between 1 and 8"
      );
    }

    result.semester =
      resultData.semester;
  }


  /*
  |--------------------------------------------------------------------------
  | EXAM TYPE
  |--------------------------------------------------------------------------
  */

  if (
    resultData.examType !==
      undefined
  ) {
    result.examType =
      resultData.examType;
  }


  /*
  |--------------------------------------------------------------------------
  | MARKS
  |--------------------------------------------------------------------------
  */

  if (
    resultData.marksObtained !==
      undefined
  ) {
    result.marksObtained =
      resultData.marksObtained;
  }


  /*
  |--------------------------------------------------------------------------
  | MAX MARKS
  |--------------------------------------------------------------------------
  */

  if (
    resultData.maxMarks !==
      undefined
  ) {
    result.maxMarks =
      resultData.maxMarks;
  }


  /*
  |--------------------------------------------------------------------------
  | VALIDATE MARKS
  |--------------------------------------------------------------------------
  */

  if (
    result.marksObtained < 0
  ) {
    throw new Error(
      "Marks obtained cannot be negative"
    );
  }


  if (
    result.maxMarks <= 0
  ) {
    throw new Error(
      "Maximum marks must be greater than 0"
    );
  }


  if (
    result.marksObtained >
    result.maxMarks
  ) {
    throw new Error(
      "Marks obtained cannot exceed maximum marks"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | RECALCULATE RESULT
  |--------------------------------------------------------------------------
  */

  const percentage =
    calculatePercentage(
      result.marksObtained,
      result.maxMarks
    );


  const gradeData =
    calculateGrade(
      percentage
    );


  result.percentage =
    percentage;

  result.grade =
    gradeData.grade;

  result.gradePoint =
    gradeData.gradePoint;

  result.resultStatus =
    percentage >= 40
      ? "pass"
      : "fail";


  /*
  |--------------------------------------------------------------------------
  | REMARKS
  |--------------------------------------------------------------------------
  */

  if (
    resultData.remarks !==
      undefined
  ) {
    result.remarks =
      resultData.remarks;
  }


  /*
  |--------------------------------------------------------------------------
  | PUBLISH STATUS
  |--------------------------------------------------------------------------
  */

  if (
    resultData.isPublished !==
      undefined
  ) {
    result.isPublished =
      resultData.isPublished;
  }


  await result.save();


  return result;
}


/*
|--------------------------------------------------------------------------
| DELETE RESULT
|--------------------------------------------------------------------------
*/

export async function deleteResult(
  reqUser,
  resultId
) {
  const college =
    await getCollegeFromUser(
      reqUser
    );


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


  const Result =
    getResultModel(
      college.databaseName
    );


  const result =
    await Result.findById(
      resultId
    );


  if (!result) {
    throw new Error(
      "Result not found"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | HOD OWN DEPARTMENT CHECK
  |--------------------------------------------------------------------------
  */

  if (
    reqUser.role === "hod" &&
    result.department !==
      reqUser.department
  ) {
    throw new Error(
      "HOD can delete results only for own department"
    );
  }


  await Result.findByIdAndDelete(
    resultId
  );


  return true;
}