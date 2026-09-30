import XLSX from "xlsx";

import College from "../models/College.js";
import {
  getResultUploadModel
} from "../models/ResultUpload.js";

import {
  getResultModel
} from "../models/Result.js";

import {
  getStudentModel
} from "../models/Student.js";

import {
  getSubjectModel
} from "../models/Subject.js";


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
| CHECK EXAM DEPARTMENT ACCESS
|--------------------------------------------------------------------------
*/

function checkExamDepartment(
  reqUser
) {
  if (
    ![
      "exam_department",
      "principal"
    ].includes(reqUser.role)
  ) {
    throw new Error(
      "Only Exam Department or Principal can perform this operation"
    );
  }
}


/*
|--------------------------------------------------------------------------
| PARSE UPLOADED FILE
|--------------------------------------------------------------------------
*/

function parseUploadedFile(
  file
) {
  if (!file) {
    throw new Error(
      "Result file is required"
    );
  }

  const workbook =
    XLSX.read(
      file.buffer,
      {
        type: "buffer"
      }
    );

  const sheetName =
    workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error(
      "No worksheet found in uploaded file"
    );
  }

  const worksheet =
    workbook.Sheets[
      sheetName
    ];

  const rows =
    XLSX.utils.sheet_to_json(
      worksheet,
      {
        defval: ""
      }
    );

  if (!rows.length) {
    throw new Error(
      "Uploaded file contains no data"
    );
  }

  return rows;
}


/*
|--------------------------------------------------------------------------
| NORMALIZE UPLOAD ROW
|--------------------------------------------------------------------------
*/

function normalizeRow(
  row
) {
  return {
    studentId:
      String(
        row.studentId ??
        row.StudentId ??
        row.studentID ??
        row["Student ID"] ??
        ""
      )
        .trim()
        .toUpperCase(),

    subjectCode:
      String(
        row.subjectCode ??
        row.SubjectCode ??
        row["Subject Code"] ??
        ""
      )
        .trim()
        .toUpperCase(),

    academicYear:
      String(
        row.academicYear ??
        row.AcademicYear ??
        row["Academic Year"] ??
        ""
      ).trim(),

    semester:
      Number(
        row.semester ??
        row.Semester ??
        ""
      ),

    examType:
      String(
        row.examType ??
        row.ExamType ??
        row["Exam Type"] ??
        ""
      ).trim(),

    marksObtained:
      Number(
        row.marksObtained ??
        row.MarksObtained ??
        row["Marks Obtained"] ??
        ""
      ),

    maxMarks:
      Number(
        row.maxMarks ??
        row.MaxMarks ??
        row["Max Marks"] ??
        ""
      ),

    remarks:
      String(
        row.remarks ??
        row.Remarks ??
        ""
      ).trim()
  };
}


/*
|--------------------------------------------------------------------------
| VALIDATE SINGLE ROW
|--------------------------------------------------------------------------
*/

async function validateRow(
  row,
  rowNumber,
  Student,
  Subject,
  Result
) {
  const errors = [];


  if (!row.studentId) {
    errors.push(
      "Student ID is required"
    );
  }


  if (!row.subjectCode) {
    errors.push(
      "Subject code is required"
    );
  }


  if (!row.academicYear) {
    errors.push(
      "Academic year is required"
    );
  }


  if (
    !row.semester ||
    row.semester < 1 ||
    row.semester > 8
  ) {
    errors.push(
      "Semester must be between 1 and 8"
    );
  }


  const allowedExamTypes = [
    "internal",
    "midterm",
    "practical",
    "theory",
    "end_semester",
    "final"
  ];


  if (
    !allowedExamTypes.includes(
      row.examType
    )
  ) {
    errors.push(
      "Invalid exam type"
    );
  }


  if (
    Number.isNaN(
      row.marksObtained
    )
  ) {
    errors.push(
      "Marks obtained is required"
    );
  }


  if (
    Number.isNaN(
      row.maxMarks
    ) ||
    row.maxMarks <= 0
  ) {
    errors.push(
      "Maximum marks must be greater than 0"
    );
  }


  if (
    !Number.isNaN(
      row.marksObtained
    ) &&
    !Number.isNaN(
      row.maxMarks
    ) &&
    row.marksObtained >
      row.maxMarks
  ) {
    errors.push(
      "Marks obtained cannot exceed maximum marks"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | FIND STUDENT
  |--------------------------------------------------------------------------
  */

  let student = null;

  if (row.studentId) {
    student =
      await Student.findOne({
        studentId:
          row.studentId,
        isActive: true
      });

    if (!student) {
      errors.push(
        `Student not found: ${row.studentId}`
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | FIND SUBJECT
  |--------------------------------------------------------------------------
  */

  let subject = null;

  if (row.subjectCode) {
    subject =
      await Subject.findOne({
        code:
          row.subjectCode,
        isActive: true
      });

    if (!subject) {
      errors.push(
        `Subject not found: ${row.subjectCode}`
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | DEPARTMENT CHECK
  |--------------------------------------------------------------------------
  */

  if (
    student &&
    subject &&
    student.department !==
      subject.department
  ) {
    errors.push(
      "Student and subject belong to different departments"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | SEMESTER CHECK
  |--------------------------------------------------------------------------
  */

  if (
    student &&
    row.semester &&
    student.semester !==
      row.semester
  ) {
    errors.push(
      "Result semester does not match student semester"
    );
  }


  if (
    subject &&
    row.semester &&
    subject.semester !==
      row.semester
  ) {
    errors.push(
      "Result semester does not match subject semester"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | DUPLICATE RESULT CHECK
  |--------------------------------------------------------------------------
  */

  if (
    row.studentId &&
    row.subjectCode &&
    row.academicYear &&
    row.semester &&
    row.examType
  ) {
    if (student && subject) {
      const existingResult =
        await Result.findOne({
          studentId:
            row.studentId,

          subjectId:
            subject._id,

          academicYear:
            row.academicYear,

          semester:
            row.semester,

          examType:
            row.examType
        });

      if (existingResult) {
        errors.push(
          "Result already exists"
        );
      }
    }
  }


  return {
    rowNumber,
    valid:
      errors.length === 0,
    errors,
    student,
    subject
  };
}


/*
|--------------------------------------------------------------------------
| UPLOAD RESULT CSV / EXCEL
|--------------------------------------------------------------------------
*/

export async function uploadResults(
  reqUser,
  file
) {
  checkExamDepartment(
    reqUser
  );

  const college =
    await getCollegeFromUser(
      reqUser
    );

  const ResultUpload =
    getResultUploadModel(
      college.databaseName
    );


  const rawRows =
    parseUploadedFile(
      file
    );


  const rows =
    rawRows.map(
      normalizeRow
    );


  const extension =
    file.originalname
      .split(".")
      .pop()
      .toLowerCase();


  const upload =
    await ResultUpload.create({
      fileName:
        file.originalname,

      fileType:
        extension,

      uploadedBy:
        reqUser.sub ||
        reqUser.userId,

      status:
        "uploaded",

      totalRows:
        rows.length,

      rows
    });


  return upload;
}


/*
|--------------------------------------------------------------------------
| VALIDATE RESULTS
|--------------------------------------------------------------------------
*/

export async function validateResults(
  reqUser,
  uploadId
) {
  checkExamDepartment(
    reqUser
  );

  const college =
    await getCollegeFromUser(
      reqUser
    );

  const ResultUpload =
    getResultUploadModel(
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

  const Result =
    getResultModel(
      college.databaseName
    );


  const upload =
    await ResultUpload.findById(
      uploadId
    );


  if (!upload) {
    throw new Error(
      "Result upload not found"
    );
  }


  const validationErrors = [];

  let validRows = 0;


  for (
    let index = 0;
    index < upload.rows.length;
    index++
  ) {
    const row =
      upload.rows[index];

    const validation =
      await validateRow(
        row,
        index + 2,
        Student,
        Subject,
        Result
      );


    if (validation.valid) {
      validRows++;
    } else {
      for (
        const error of
          validation.errors
      ) {
        validationErrors.push({
          row:
            validation.rowNumber,

          message:
            error
        });
      }
    }
  }


  upload.validRows =
    validRows;

  upload.invalidRows =
    upload.totalRows -
    validRows;

  upload.validationErrors =
    validationErrors;

  upload.status =
    validationErrors.length === 0
      ? "validated"
      : "failed";


  await upload.save();


  return upload;
}


/*
|--------------------------------------------------------------------------
| PREVIEW RESULTS
|--------------------------------------------------------------------------
*/

export async function previewResults(
  reqUser,
  uploadId
) {
  checkExamDepartment(
    reqUser
  );

  const college =
    await getCollegeFromUser(
      reqUser
    );

  const ResultUpload =
    getResultUploadModel(
      college.databaseName
    );


  const upload =
    await ResultUpload.findById(
      uploadId
    );


  if (!upload) {
    throw new Error(
      "Result upload not found"
    );
  }


  return {
    id:
      upload._id,

    fileName:
      upload.fileName,

    fileType:
      upload.fileType,

    status:
      upload.status,

    totalRows:
      upload.totalRows,

    validRows:
      upload.validRows,

    invalidRows:
      upload.invalidRows,

    validationErrors:
      upload.validationErrors,

    rows:
      upload.rows
  };
}


/*
|--------------------------------------------------------------------------
| PUBLISH RESULTS
|--------------------------------------------------------------------------
*/

export async function publishResults(
  reqUser,
  uploadId
) {
  checkExamDepartment(
    reqUser
  );

  const college =
    await getCollegeFromUser(
      reqUser
    );

  const ResultUpload =
    getResultUploadModel(
      college.databaseName
    );

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


  const upload =
    await ResultUpload.findById(
      uploadId
    );


  if (!upload) {
    throw new Error(
      "Result upload not found"
    );
  }


  if (
    upload.status !==
    "validated"
  ) {
    throw new Error(
      "Results must be successfully validated before publishing"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | CREATE RESULTS
  |--------------------------------------------------------------------------
  */

  for (
    const row of upload.rows
  ) {
    const student =
      await Student.findOne({
        studentId:
          row.studentId,
        isActive: true
      });


    const subject =
      await Subject.findOne({
        code:
          row.subjectCode,
        isActive: true
      });


    if (
      !student ||
      !subject
    ) {
      throw new Error(
        `Invalid student or subject for ${row.studentId} / ${row.subjectCode}`
      );
    }


    const percentage =
      Number(
        (
          (
            row.marksObtained /
            row.maxMarks
          ) * 100
        ).toFixed(2)
      );


    let grade = "F";
    let gradePoint = 0;


    if (percentage >= 90) {
      grade = "A+";
      gradePoint = 10;
    } else if (
      percentage >= 80
    ) {
      grade = "A";
      gradePoint = 9;
    } else if (
      percentage >= 70
    ) {
      grade = "B+";
      gradePoint = 8;
    } else if (
      percentage >= 60
    ) {
      grade = "B";
      gradePoint = 7;
    } else if (
      percentage >= 50
    ) {
      grade = "C";
      gradePoint = 6;
    } else if (
      percentage >= 40
    ) {
      grade = "D";
      gradePoint = 5;
    }


    const resultStatus =
      percentage >= 40
        ? "pass"
        : "fail";


    const existingResult =
      await Result.findOne({
        studentId:
          student.studentId,

        subjectId:
          subject._id,

        academicYear:
          row.academicYear,

        semester:
          row.semester,

        examType:
          row.examType
      });


    if (existingResult) {
      throw new Error(
        `Result already exists for ${student.studentId} - ${subject.code}`
      );
    }


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
        row.academicYear,

      semester:
        row.semester,

      examType:
        row.examType,

      marksObtained:
        row.marksObtained,

      maxMarks:
        row.maxMarks,

      percentage,

      grade,

      gradePoint,

      resultStatus,

      remarks:
        row.remarks || "",

      isPublished:
        true
    });
  }


  /*
  |--------------------------------------------------------------------------
  | UPDATE UPLOAD STATUS
  |--------------------------------------------------------------------------
  */

  upload.status =
    "published";

  upload.publishedAt =
    new Date();

  await upload.save();


  return upload;
}


/*
|--------------------------------------------------------------------------
| UPDATE PUBLISHED RESULT
|--------------------------------------------------------------------------
*/

export async function updatePublishedResult(
  reqUser,
  resultId,
  data
) {
  checkExamDepartment(
    reqUser
  );

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


  if (
    !result.isPublished
  ) {
    throw new Error(
      "Only published results can be updated using this endpoint"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | UPDATE MARKS
  |--------------------------------------------------------------------------
  */

  if (
    data.marksObtained !==
    undefined
  ) {
    data.marksObtained =
      Number(
        data.marksObtained
      );
  }


  if (
    data.maxMarks !==
    undefined
  ) {
    data.maxMarks =
      Number(
        data.maxMarks
      );
  }


  const marksObtained =
    data.marksObtained !==
    undefined
      ? data.marksObtained
      : result.marksObtained;


  const maxMarks =
    data.maxMarks !==
    undefined
      ? data.maxMarks
      : result.maxMarks;


  if (
    Number.isNaN(
      marksObtained
    ) ||
    marksObtained < 0
  ) {
    throw new Error(
      "Invalid marks obtained"
    );
  }


  if (
    Number.isNaN(
      maxMarks
    ) ||
    maxMarks <= 0
  ) {
    throw new Error(
      "Invalid maximum marks"
    );
  }


  if (
    marksObtained >
    maxMarks
  ) {
    throw new Error(
      "Marks obtained cannot exceed maximum marks"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | RECALCULATE
  |--------------------------------------------------------------------------
  */

  const percentage =
    Number(
      (
        (
          marksObtained /
          maxMarks
        ) * 100
      ).toFixed(2)
    );


  let grade = "F";
  let gradePoint = 0;


  if (percentage >= 90) {
    grade = "A+";
    gradePoint = 10;
  } else if (
    percentage >= 80
  ) {
    grade = "A";
    gradePoint = 9;
  } else if (
    percentage >= 70
  ) {
    grade = "B+";
    gradePoint = 8;
  } else if (
    percentage >= 60
  ) {
    grade = "B";
    gradePoint = 7;
  } else if (
    percentage >= 50
  ) {
    grade = "C";
    gradePoint = 6;
  } else if (
    percentage >= 40
  ) {
    grade = "D";
    gradePoint = 5;
  }


  result.marksObtained =
    marksObtained;

  result.maxMarks =
    maxMarks;

  result.percentage =
    percentage;

  result.grade =
    grade;

  result.gradePoint =
    gradePoint;

  result.resultStatus =
    percentage >= 40
      ? "pass"
      : "fail";


  if (
    data.remarks !==
    undefined
  ) {
    result.remarks =
      data.remarks;
  }


  /*
  |--------------------------------------------------------------------------
  | REMAIN PUBLISHED
  |--------------------------------------------------------------------------
  */

  result.isPublished =
    true;


  await result.save();


  return result;
}