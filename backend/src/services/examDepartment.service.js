import fs from "fs";
import path from "path";
import XLSX from "xlsx";

import College from "../models/College.js";
import { getResultUploadModel } from "../models/ResultUpload.js";
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
| CHECK EXAM DEPARTMENT
|--------------------------------------------------------------------------
*/

function checkExamDepartment(
  reqUser
) {
  if (
    reqUser.role !==
    "exam_department"
  ) {
    throw new Error(
      "Only Exam Department can perform this operation"
    );
  }
}


/*
|--------------------------------------------------------------------------
| READ CSV / EXCEL
|--------------------------------------------------------------------------
*/

function readResultFile(
  filePath
) {
  const workbook =
    XLSX.readFile(
      filePath,
      {
        cellDates: false
      }
    );


  const sheetName =
    workbook
      .SheetNames[0];


  if (!sheetName) {
    throw new Error(
      "File does not contain a worksheet"
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
        defval: "",
        raw: false
      }
    );


  const headerRows =
    XLSX.utils.sheet_to_json(
      worksheet,
      {
        header: 1,
        defval: ""
      }
    );


  const headers =
    headerRows[0] || [];


  return {
    rows,
    headers:
      headers.map(
        (header) =>
          String(header).trim()
      )
  };
}


/*
|--------------------------------------------------------------------------
| FIND SUBJECT COLUMNS
|--------------------------------------------------------------------------
|
| Any column ending with "marks" is treated as a subject
| marks column.
|
| Examples:
|
| CS101 marks
| CS102 marks
| CS103 marks
| DBMS marks
| ML marks
|
|--------------------------------------------------------------------------
*/

function getSubjectColumns(
  headers
) {
  const excludedHeaders =
    new Set([
      "studentid",
      "academicyear",
      "semester",
      "examtype",
      "marksobtained",
      "maxmarks"
    ]);


  return headers
    .map(
      (header) => ({
        original:
          header,

        normalized:
          header
            .toLowerCase()
            .replace(
              /\s+/g,
              ""
            )
      })
    )
    .filter(
      ({
        original,
        normalized
      }) => {
        if (
          excludedHeaders.has(
            normalized
          )
        ) {
          return false;
        }

        return normalized.endsWith(
          "marks"
        );
      }
    )
    .map(
      ({
        original
      }) => {
        const subjectCode =
          original
            .replace(
              /\s*marks\s*$/i,
              ""
            )
            .trim()
            .toUpperCase();

        return {
          header:
            original,

          subjectCode
        };
      }
    );
}


/*
|--------------------------------------------------------------------------
| GET FIXED FIELD
|--------------------------------------------------------------------------
*/

function getRowValue(
  row,
  fieldName
) {
  const key =
    Object.keys(row).find(
      (key) =>
        key
          .toLowerCase()
          .replace(
            /\s+/g,
            ""
          ) ===
        fieldName
          .toLowerCase()
          .replace(
            /\s+/g,
            ""
          )
    );


  if (!key) {
    return "";
  }


  return row[key];
}


/*
|--------------------------------------------------------------------------
| NUMBER VALUE
|--------------------------------------------------------------------------
*/

function toNumber(
  value
) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return NaN;
  }

  const number =
    Number(
      String(value)
        .replace(
          /,/g,
          ""
        )
        .trim()
    );

  return number;
}


/*
|--------------------------------------------------------------------------
| VALIDATE FILE STRUCTURE
|--------------------------------------------------------------------------
*/

function validateFileStructure(
  headers,
  subjectColumns
) {
  const requiredFields = [
    "studentId",
    "academicYear",
    "semester",
    "examType",
    "marksObtained",
    "maxMarks"
  ];


  const normalizedHeaders =
    headers.map(
      (header) =>
        header
          .toLowerCase()
          .replace(
            /\s+/g,
            ""
          )
    );


  for (
    const field of requiredFields
  ) {
    if (
      !normalizedHeaders.includes(
        field
          .toLowerCase()
          .replace(
            /\s+/g,
            ""
          )
      )
    ) {
      throw new Error(
        `Required column missing: ${field}`
      );
    }
  }


  if (
    subjectColumns.length === 0
  ) {
    throw new Error(
      "No subject marks columns found. Use columns like CS101 marks, CS102 marks"
    );
  }
}


/*
|--------------------------------------------------------------------------
| GET GRADE
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
| VALIDATE UPLOAD
|--------------------------------------------------------------------------
*/

export async function validateResultUpload(
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


  const upload =
    await ResultUpload.findById(
      uploadId
    );


  if (!upload) {
    throw new Error(
      "Result upload not found"
    );
  }


  const {
    rows,
    headers
  } =
    readResultFile(
      upload.filePath
    );


  const subjectColumns =
    getSubjectColumns(
      headers
    );


  validateFileStructure(
    headers,
    subjectColumns
  );


  const validationErrors =
    [];


  let validRows = 0;


  const subjectCodes =
    subjectColumns.map(
      (item) =>
        item.subjectCode
    );


  /*
  |--------------------------------------------------------------------------
  | LOAD SUBJECTS
  |--------------------------------------------------------------------------
  */

  const subjects =
    await Subject.find({
      code: {
        $in:
          subjectCodes
      },
      isActive: true
    });


  const subjectMap =
    new Map();


  for (
    const subject of subjects
  ) {
    subjectMap.set(
      subject.code.toUpperCase(),
      subject
    );
  }


  /*
  |--------------------------------------------------------------------------
  | VALIDATE EACH ROW
  |--------------------------------------------------------------------------
  */

  for (
    let index = 0;
    index < rows.length;
    index++
  ) {
    const row =
      rows[index];


    const rowNumber =
      index + 2;


    const studentId =
      String(
        getRowValue(
          row,
          "studentId"
        )
      )
        .trim()
        .toUpperCase();


    const academicYear =
      String(
        getRowValue(
          row,
          "academicYear"
        )
      ).trim();


    const semester =
      toNumber(
        getRowValue(
          row,
          "semester"
        )
      );


    const examType =
      String(
        getRowValue(
          row,
          "examType"
        )
      )
        .trim();


    const totalMarksObtained =
      toNumber(
        getRowValue(
          row,
          "marksObtained"
        )
      );


    const totalMaxMarks =
      toNumber(
        getRowValue(
          row,
          "maxMarks"
        )
      );


    const errors = [];


    /*
    |--------------------------------------------------------------------------
    | STUDENT
    |--------------------------------------------------------------------------
    */

    if (!studentId) {
      errors.push(
        "Student ID is required"
      );
    }


    let student = null;


    if (studentId) {
      student =
        await Student.findOne({
          studentId,
          isActive: true
        });


      if (!student) {
        errors.push(
          `Student not found: ${studentId}`
        );
      }
    }


    /*
    |--------------------------------------------------------------------------
    | ACADEMIC YEAR
    |--------------------------------------------------------------------------
    */

    if (!academicYear) {
      errors.push(
        "Academic year is required"
      );
    }


    /*
    |--------------------------------------------------------------------------
    | SEMESTER
    |--------------------------------------------------------------------------
    */

    if (
      Number.isNaN(
        semester
      ) ||
      semester < 1 ||
      semester > 8
    ) {
      errors.push(
        "Invalid semester"
      );
    }


    /*
    |--------------------------------------------------------------------------
    | EXAM TYPE
    |--------------------------------------------------------------------------
    */

    if (!examType) {
      errors.push(
        "Exam type is required"
      );
    }


    /*
    |--------------------------------------------------------------------------
    | TOTAL MARKS
    |--------------------------------------------------------------------------
    */

    if (
      Number.isNaN(
        totalMarksObtained
      )
    ) {
      errors.push(
        "marksObtained is required"
      );
    }


    if (
      Number.isNaN(
        totalMaxMarks
      ) ||
      totalMaxMarks <= 0
    ) {
      errors.push(
        "maxMarks is required and must be greater than 0"
      );
    }


    /*
    |--------------------------------------------------------------------------
    | SUBJECT VALIDATION
    |--------------------------------------------------------------------------
    */

    let calculatedMarks =
      0;


    let calculatedMaxMarks =
      0;


    for (
      const subjectColumn
      of subjectColumns
    ) {
      const subject =
        subjectMap.get(
          subjectColumn.subjectCode
        );


      if (!subject) {
        errors.push(
          `Subject not found or inactive: ${subjectColumn.subjectCode}`
        );

        continue;
      }


      if (
        student &&
        student.department !==
          subject.department
      ) {
        errors.push(
          `${subject.code} does not belong to student department`
        );
      }


      if (
        !Number.isNaN(
          semester
        ) &&
        subject.semester !==
          semester
      ) {
        errors.push(
          `${subject.code} does not belong to semester ${semester}`
        );
      }


      const marks =
        toNumber(
          row[
            subjectColumn.header
          ]
        );


      if (
        Number.isNaN(
          marks
        )
      ) {
        errors.push(
          `${subject.code} marks are required`
        );

        continue;
      }


      if (
        marks < 0 ||
        marks > 100
      ) {
        errors.push(
          `${subject.code} marks must be between 0 and 100`
        );

        continue;
      }


      calculatedMarks +=
        marks;

      calculatedMaxMarks +=
        100;
    }


    /*
    |--------------------------------------------------------------------------
    | TOTAL CHECK
    |--------------------------------------------------------------------------
    */

    if (
      !Number.isNaN(
        totalMarksObtained
      ) &&
      calculatedMarks !==
        totalMarksObtained
    ) {
      errors.push(
        `marksObtained does not match subject marks. Expected ${calculatedMarks}, received ${totalMarksObtained}`
      );
    }


    if (
      !Number.isNaN(
        totalMaxMarks
      ) &&
      calculatedMaxMarks !==
        totalMaxMarks
    ) {
      errors.push(
        `maxMarks does not match subject columns. Expected ${calculatedMaxMarks}, received ${totalMaxMarks}`
      );
    }


    /*
    |--------------------------------------------------------------------------
    | RESULT
    |--------------------------------------------------------------------------
    */

    if (
      errors.length === 0
    ) {
      validRows++;
    } else {
      validationErrors.push({
        row: rowNumber,
        studentId,
        errors
      });
    }
  }


  upload.totalRows =
    rows.length;

  upload.validRows =
    validRows;

  upload.invalidRows =
    validationErrors.length;

  upload.headers =
    headers;

  upload.subjectCodes =
    subjectCodes;

  upload.validationErrors =
    validationErrors;

  upload.status =
    validationErrors.length === 0
      ? "validated"
      : "invalid";


  await upload.save();


  return {
    uploadId:
      upload._id,

    status:
      upload.status,

    totalRows:
      upload.totalRows,

    validRows:
      upload.validRows,

    invalidRows:
      upload.invalidRows,

    subjectCodes,

    validationErrors
  };
}


/*
|--------------------------------------------------------------------------
| UPLOAD RESULT FILE
|--------------------------------------------------------------------------
*/

export async function uploadResultFile(
  reqUser,
  file
) {
  checkExamDepartment(
    reqUser
  );


  if (!file) {
    throw new Error(
      "CSV or Excel file is required"
    );
  }


  const college =
    await getCollegeFromUser(
      reqUser
    );


  const ResultUpload =
    getResultUploadModel(
      college.databaseName
    );


  const extension =
    path
      .extname(
        file.originalname
      )
      .toLowerCase();


  const fileType =
    extension === ".csv"
      ? "csv"
      : "excel";


  const {
    rows,
    headers
  } =
    readResultFile(
      file.path
    );


  if (
    rows.length === 0
  ) {
    throw new Error(
      "Uploaded file is empty"
    );
  }


  const subjectColumns =
    getSubjectColumns(
      headers
    );


  validateFileStructure(
    headers,
    subjectColumns
  );


  const upload =
    await ResultUpload.create({
      fileName:
        file.originalname,

      fileType,

      filePath:
        file.path,

      status:
        "uploaded",

      totalRows:
        rows.length,

      validRows: 0,

      invalidRows: 0,

      subjectCodes:
        subjectColumns.map(
          (item) =>
            item.subjectCode
        ),

      headers,

      uploadedBy:
        reqUser.sub || null
    });


  return {
    uploadId:
      upload._id,

    fileName:
      upload.fileName,

    fileType:
      upload.fileType,

    totalRows:
      upload.totalRows,

    subjectCodes:
      upload.subjectCodes,

    status:
      upload.status
  };
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


  const {
    rows,
    headers
  } =
    readResultFile(
      upload.filePath
    );


  const subjectColumns =
    getSubjectColumns(
      headers
    );


  return {
    uploadId:
      upload._id,

    fileName:
      upload.fileName,

    status:
      upload.status,

    headers,

    subjectCodes:
      subjectColumns.map(
        (item) =>
          item.subjectCode
      ),

    totalRows:
      rows.length,

    rows:
      rows.slice(
        0,
        20
      )
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


  /*
  |--------------------------------------------------------------------------
  | VALIDATE BEFORE PUBLISH
  |--------------------------------------------------------------------------
  */

  const validation =
    await validateResultUpload(
      reqUser,
      uploadId
    );


  if (
    validation.status !==
    "validated"
  ) {
    throw new Error(
      "Cannot publish invalid results"
    );
  }


  const {
    rows,
    headers
  } =
    readResultFile(
      upload.filePath
    );


  const subjectColumns =
    getSubjectColumns(
      headers
    );


  const subjects =
    await Subject.find({
      code: {
        $in:
          subjectColumns.map(
            (item) =>
              item.subjectCode
          )
      },
      isActive: true
    });


  const subjectMap =
    new Map();


  for (
    const subject of subjects
  ) {
    subjectMap.set(
      subject.code.toUpperCase(),
      subject
    );
  }


  const createdResults =
    [];


  /*
  |--------------------------------------------------------------------------
  | PROCESS EACH STUDENT ROW
  |--------------------------------------------------------------------------
  */

  for (
    const row of rows
  ) {
    const studentId =
      String(
        getRowValue(
          row,
          "studentId"
        )
      )
        .trim()
        .toUpperCase();


    const academicYear =
      String(
        getRowValue(
          row,
          "academicYear"
        )
      ).trim();


    const semester =
      toNumber(
        getRowValue(
          row,
          "semester"
        )
      );


    const examType =
      String(
        getRowValue(
          row,
          "examType"
        )
      ).trim();


    const student =
      await Student.findOne({
        studentId,
        isActive: true
      });


    if (!student) {
      continue;
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE RESULT FOR EACH SUBJECT COLUMN
    |--------------------------------------------------------------------------
    */

    for (
      const subjectColumn
      of subjectColumns
    ) {
      const subject =
        subjectMap.get(
          subjectColumn.subjectCode
        );


      if (!subject) {
        continue;
      }


      const marks =
        toNumber(
          row[
            subjectColumn.header
          ]
        );


      if (
        Number.isNaN(
          marks
        )
      ) {
        continue;
      }


      /*
      |--------------------------------------------------------------------------
      | CHECK EXISTING RESULT
      |--------------------------------------------------------------------------
      */

      const existingResult =
        await Result.findOne({
          studentId:
            student.studentId,

          subjectId:
            subject._id,

          academicYear,

          semester,

          examType
        });


      const percentage =
        Number(
          (
            (marks / 100) *
            100
          ).toFixed(2)
        );


      const gradeData =
        calculateGrade(
          percentage
        );


      const resultStatus =
        percentage >= 40
          ? "pass"
          : "fail";


      /*
      |--------------------------------------------------------------------------
      | UPDATE EXISTING
      |--------------------------------------------------------------------------
      */

      if (existingResult) {
        existingResult.studentName =
          student.name;

        existingResult.subjectCode =
          subject.code;

        existingResult.subjectName =
          subject.name;

        existingResult.department =
          student.department;

        existingResult.marksObtained =
          marks;

        existingResult.maxMarks =
          100;

        existingResult.percentage =
          percentage;

        existingResult.grade =
          gradeData.grade;

        existingResult.gradePoint =
          gradeData.gradePoint;

        existingResult.resultStatus =
          resultStatus;

        existingResult.isPublished =
          true;

        await existingResult.save();

        createdResults.push(
          existingResult
        );

        continue;
      }


      /*
      |--------------------------------------------------------------------------
      | CREATE NEW RESULT
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

          academicYear,

          semester,

          examType,

          marksObtained:
            marks,

          maxMarks: 100,

          percentage,

          grade:
            gradeData.grade,

          gradePoint:
            gradeData.gradePoint,

          resultStatus,

          remarks: "",

          isPublished:
            true
        });


      createdResults.push(
        result
      );
    }
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


  return {
    uploadId:
      upload._id,

    status:
      "published",

    resultsCreated:
      createdResults.length,

    subjectCodes:
      subjectColumns.map(
        (item) =>
          item.subjectCode
      ),

    publishedAt:
      upload.publishedAt
  };
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
      "Result is not published"
    );
  }


  if (
    data.marksObtained ===
      undefined
  ) {
    throw new Error(
      "marksObtained is required"
    );
  }


  const marks =
    Number(
      data.marksObtained
    );


  const maxMarks =
    data.maxMarks !==
      undefined
      ? Number(
          data.maxMarks
        )
      : result.maxMarks;


  if (
    Number.isNaN(marks) ||
    marks < 0
  ) {
    throw new Error(
      "Invalid marksObtained"
    );
  }


  if (
    Number.isNaN(maxMarks) ||
    maxMarks <= 0
  ) {
    throw new Error(
      "Invalid maxMarks"
    );
  }


  if (
    marks > maxMarks
  ) {
    throw new Error(
      "Marks obtained cannot exceed max marks"
    );
  }


  const percentage =
    Number(
      (
        (marks / maxMarks) *
        100
      ).toFixed(2)
    );


  const gradeData =
    calculateGrade(
      percentage
    );


  result.marksObtained =
    marks;

  result.maxMarks =
    maxMarks;

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
  | REMARKS ARE NOT PART OF CSV
  |--------------------------------------------------------------------------
  |
  | Manual API update can still use the existing Result remarks field.
  |
  */

  if (
    data.remarks !==
      undefined
  ) {
    result.remarks =
      data.remarks;
  }


  await result.save();


  return result;
}


/*
|--------------------------------------------------------------------------
| DELETE UPLOAD FILE
|--------------------------------------------------------------------------
*/

export async function deleteUploadFile(
  filePath
) {
  try {
    if (
      filePath &&
      fs.existsSync(filePath)
    ) {
      fs.unlinkSync(
        filePath
      );
    }
  } catch (error) {
    console.error(
      "Upload file cleanup failed:",
      error.message
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE UPLOADED RESULT RECORD
|--------------------------------------------------------------------------
*/

export async function deleteResultUpload(
  reqUser,
  uploadId
) {
  checkExamDepartment(reqUser);

  const college =
    await getCollegeFromUser(reqUser);

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

  /*
  |--------------------------------------------------------------------------
  | DELETE PHYSICAL FILE
  |--------------------------------------------------------------------------
  */

  await deleteUploadFile(
    upload.filePath
  );

  /*
  |--------------------------------------------------------------------------
  | DELETE DATABASE RECORD
  |--------------------------------------------------------------------------
  */

  await ResultUpload.findByIdAndDelete(
    uploadId
  );

  return true;
}