import College from "../models/College.js";
import { getResultModel } from "../models/Result.js";


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
    throw new Error("Active college not found");
  }

  return college;
}


/*
|--------------------------------------------------------------------------
| GET RESULT MODEL
|--------------------------------------------------------------------------
*/

async function getAnalyticsContext(reqUser) {
  const college = await getCollegeFromUser(reqUser);

  const Result = getResultModel(
    college.databaseName
  );

  return {
    college,
    Result
  };
}


/*
|--------------------------------------------------------------------------
| BUILD BASE FILTER
|--------------------------------------------------------------------------
|
| Role based analytics:
|
| Principal       -> Entire college
| Exam Department -> Entire college
| HOD             -> Own department
| Student         -> Own student results
|
|--------------------------------------------------------------------------
*/

function buildRoleFilter(reqUser) {
  const filter = {
    isPublished: true
  };

  if (
    reqUser.role === "hod"
  ) {
    if (!reqUser.department) {
      throw new Error(
        "Department information is required"
      );
    }

    filter.department =
      reqUser.department;
  }

  if (
    reqUser.role === "student"
  ) {
    if (!reqUser.studentId) {
      throw new Error(
        "Student ID is required"
      );
    }

    filter.studentId =
      reqUser.studentId;
  }

  return filter;
}


/*
|--------------------------------------------------------------------------
| APPLY COMMON QUERY FILTERS
|--------------------------------------------------------------------------
*/

function applyQueryFilters(
  filter,
  query
) {
  if (query.department) {
    filter.department =
      query.department;
  }

  if (query.academicYear) {
    filter.academicYear =
      query.academicYear;
  }

  if (query.semester) {
    const semester =
      Number(query.semester);

    if (!Number.isNaN(semester)) {
      filter.semester = semester;
    }
  }

  if (query.examType) {
    filter.examType =
      query.examType;
  }

  if (query.subjectCode) {
    filter.subjectCode =
      query.subjectCode.toUpperCase();
  }

  if (query.studentId) {
    filter.studentId =
      query.studentId.toUpperCase();
  }

  return filter;
}


/*
|--------------------------------------------------------------------------
| VALIDATE DEPARTMENT ACCESS
|--------------------------------------------------------------------------
*/

function validateDepartmentAccess(
  reqUser,
  query
) {
  if (
    reqUser.role === "hod" &&
    query.department &&
    query.department !== reqUser.department
  ) {
    throw new Error("Access denied");
  }
}


/*
|--------------------------------------------------------------------------
| VALIDATE STUDENT ACCESS
|--------------------------------------------------------------------------
*/

function validateStudentAccess(
  reqUser,
  query
) {
  if (
    reqUser.role === "student" &&
    query.studentId &&
    query.studentId.toUpperCase() !==
      reqUser.studentId
  ) {
    throw new Error("Access denied");
  }
}


/*
|--------------------------------------------------------------------------
| 1. COLLEGE OVERVIEW
|--------------------------------------------------------------------------
|
| Overall:
| - total results
| - total students
| - total subjects
| - average percentage
| - pass count
| - fail count
| - pass percentage
|
|--------------------------------------------------------------------------
*/

export async function getCollegeOverview(
  reqUser,
  query
) {
  if (
    ![
      "principal",
      "exam_department"
    ].includes(reqUser.role)
  ) {
    throw new Error("Access denied");
  }

  const {
    Result
  } = await getAnalyticsContext(
    reqUser
  );

  const filter =
    buildRoleFilter(reqUser);

  applyQueryFilters(
    filter,
    query
  );

  const result = await Result.aggregate([
    {
      $match: filter
    },

    {
      $group: {
        _id: null,

        totalResults: {
          $sum: 1
        },

        totalStudents: {
          $addToSet: "$studentId"
        },

        totalSubjects: {
          $addToSet: "$subjectCode"
        },

        averagePercentage: {
          $avg: "$percentage"
        },

        passCount: {
          $sum: {
            $cond: [
              {
                $eq: [
                  "$resultStatus",
                  "pass"
                ]
              },
              1,
              0
            ]
          }
        },

        failCount: {
          $sum: {
            $cond: [
              {
                $eq: [
                  "$resultStatus",
                  "fail"
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },

    {
      $project: {
        _id: 0,

        totalResults: 1,

        totalStudents: {
          $size: "$totalStudents"
        },

        totalSubjects: {
          $size: "$totalSubjects"
        },

        averagePercentage: {
          $round: [
            "$averagePercentage",
            2
          ]
        },

        passCount: 1,
        failCount: 1,

        passPercentage: {
          $round: [
            {
              $multiply: [
                {
                  $cond: [
                    {
                      $gt: [
                        "$totalResults",
                        0
                      ]
                    },
                    {
                      $divide: [
                        "$passCount",
                        "$totalResults"
                      ]
                    },
                    0
                  ]
                },
                100
              ]
            },
            2
          ]
        }
      }
    }
  ]);

  return (
    result[0] || {
      totalResults: 0,
      totalStudents: 0,
      totalSubjects: 0,
      averagePercentage: 0,
      passCount: 0,
      failCount: 0,
      passPercentage: 0
    }
  );
}


/*
|--------------------------------------------------------------------------
| 2. DEPARTMENT OVERVIEW
|--------------------------------------------------------------------------
|
| Department-wise:
| - students
| - results
| - average
| - pass percentage
|
|--------------------------------------------------------------------------
*/

export async function getDepartmentOverview(
  reqUser,
  query
) {
  const {
    Result
  } = await getAnalyticsContext(
    reqUser
  );

  validateDepartmentAccess(
    reqUser,
    query
  );

  const filter =
    buildRoleFilter(reqUser);

  applyQueryFilters(
    filter,
    query
  );

  const result =
    await Result.aggregate([
      {
        $match: filter
      },

      {
        $group: {
          _id: "$department",

          totalResults: {
            $sum: 1
          },

          students: {
            $addToSet: "$studentId"
          },

          averagePercentage: {
            $avg: "$percentage"
          },

          passCount: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$resultStatus",
                    "pass"
                  ]
                },
                1,
                0
              ]
            }
          },

          failCount: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$resultStatus",
                    "fail"
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },

      {
        $project: {
          _id: 0,

          department: "$_id",

          totalResults: 1,

          totalStudents: {
            $size: "$students"
          },

          averagePercentage: {
            $round: [
              "$averagePercentage",
              2
            ]
          },

          passCount: 1,
          failCount: 1,

          passPercentage: {
            $round: [
              {
                $multiply: [
                  {
                    $cond: [
                      {
                        $gt: [
                          "$totalResults",
                          0
                        ]
                      },
                      {
                        $divide: [
                          "$passCount",
                          "$totalResults"
                        ]
                      },
                      0
                    ]
                  },
                  100
                ]
              },
              2
            ]
          }
        }
      },

      {
        $sort: {
          department: 1
        }
      }
    ]);

  return result;
}


/*
|--------------------------------------------------------------------------
| 3. STUDENT PERFORMANCE
|--------------------------------------------------------------------------
|
| Student-wise performance:
| - average percentage
| - subjects
| - pass/fail
| - grade
|
|--------------------------------------------------------------------------
*/

export async function getStudentPerformance(
  reqUser,
  query
) {
  const {
    Result
  } = await getAnalyticsContext(
    reqUser
  );

  validateDepartmentAccess(
    reqUser,
    query
  );

  validateStudentAccess(
    reqUser,
    query
  );

  const filter =
    buildRoleFilter(reqUser);

  applyQueryFilters(
    filter,
    query
  );

  const result =
    await Result.aggregate([
      {
        $match: filter
      },

      {
        $group: {
          _id: "$studentId",

          studentName: {
            $first: "$studentName"
          },

          department: {
            $first: "$department"
          },

          academicYear: {
            $first: "$academicYear"
          },

          semester: {
            $first: "$semester"
          },

          totalSubjects: {
            $sum: 1
          },

          averagePercentage: {
            $avg: "$percentage"
          },

          highestPercentage: {
            $max: "$percentage"
          },

          lowestPercentage: {
            $min: "$percentage"
          },

          passCount: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$resultStatus",
                    "pass"
                  ]
                },
                1,
                0
              ]
            }
          },

          failCount: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$resultStatus",
                    "fail"
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },

      {
        $project: {
          _id: 0,

          studentId: "$_id",

          studentName: 1,
          department: 1,
          academicYear: 1,
          semester: 1,

          totalSubjects: 1,

          averagePercentage: {
            $round: [
              "$averagePercentage",
              2
            ]
          },

          highestPercentage: 1,
          lowestPercentage: 1,

          passCount: 1,
          failCount: 1,

          passPercentage: {
            $round: [
              {
                $multiply: [
                  {
                    $cond: [
                      {
                        $gt: [
                          "$totalSubjects",
                          0
                        ]
                      },
                      {
                        $divide: [
                          "$passCount",
                          "$totalSubjects"
                        ]
                      },
                      0
                    ]
                  },
                  100
                ]
              },
              2
            ]
          }
        }
      },

      {
        $sort: {
          averagePercentage: -1
        }
      }
    ]);

  return result;
}


/*
|--------------------------------------------------------------------------
| 4. SUBJECT PERFORMANCE
|--------------------------------------------------------------------------
|
| Paper specifically describes subject-wise
| averages and pass rates using aggregation.
|
|--------------------------------------------------------------------------
*/

export async function getSubjectPerformance(
  reqUser,
  query
) {
  const {
    Result
  } = await getAnalyticsContext(
    reqUser
  );

  validateDepartmentAccess(
    reqUser,
    query
  );

  const filter =
    buildRoleFilter(reqUser);

  applyQueryFilters(
    filter,
    query
  );

  const result =
    await Result.aggregate([
      {
        $match: filter
      },

      {
        $group: {
          _id: "$subjectCode",

          subjectName: {
            $first: "$subjectName"
          },

          department: {
            $first: "$department"
          },

          totalStudents: {
            $addToSet: "$studentId"
          },

          averagePercentage: {
            $avg: "$percentage"
          },

          highestPercentage: {
            $max: "$percentage"
          },

          lowestPercentage: {
            $min: "$percentage"
          },

          passCount: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$resultStatus",
                    "pass"
                  ]
                },
                1,
                0
              ]
            }
          },

          failCount: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$resultStatus",
                    "fail"
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },

      {
        $project: {
          _id: 0,

          subjectCode: "$_id",

          subjectName: 1,
          department: 1,

          totalStudents: {
            $size: "$totalStudents"
          },

          averagePercentage: {
            $round: [
              "$averagePercentage",
              2
            ]
          },

          highestPercentage: 1,
          lowestPercentage: 1,

          passCount: 1,
          failCount: 1,

          passPercentage: {
            $round: [
              {
                $multiply: [
                  {
                    $cond: [
                      {
                        $gt: [
                          {
                            $add: [
                              "$passCount",
                              "$failCount"
                            ]
                          },
                          0
                        ]
                      },
                      {
                        $divide: [
                          "$passCount",
                          {
                            $add: [
                              "$passCount",
                              "$failCount"
                            ]
                          }
                        ]
                      },
                      0
                    ]
                  },
                  100
                ]
              },
              2
            ]
          }
        }
      },

      {
        $sort: {
          averagePercentage: -1
        }
      }
    ]);

  return result;
}


/*
|--------------------------------------------------------------------------
| 5. GRADE DISTRIBUTION
|--------------------------------------------------------------------------
|
| Used for pie/bar chart.
|
|--------------------------------------------------------------------------
*/

export async function getGradeDistribution(
  reqUser,
  query
) {
  const {
    Result
  } = await getAnalyticsContext(
    reqUser
  );

  validateDepartmentAccess(
    reqUser,
    query
  );

  validateStudentAccess(
    reqUser,
    query
  );

  const filter =
    buildRoleFilter(reqUser);

  applyQueryFilters(
    filter,
    query
  );

  const result =
    await Result.aggregate([
      {
        $match: filter
      },

      {
        $group: {
          _id: "$grade",

          count: {
            $sum: 1
          }
        }
      },

      {
        $project: {
          _id: 0,

          grade: "$_id",

          count: 1
        }
      },

      {
        $sort: {
          grade: 1
        }
      }
    ]);

  return result;
}


/*
|--------------------------------------------------------------------------
| 6. PASS PERCENTAGE
|--------------------------------------------------------------------------
|
| Overall pass/fail statistics.
|
|--------------------------------------------------------------------------
*/

export async function getPassPercentage(
  reqUser,
  query
) {
  const {
    Result
  } = await getAnalyticsContext(
    reqUser
  );

  validateDepartmentAccess(
    reqUser,
    query
  );

  validateStudentAccess(
    reqUser,
    query
  );

  const filter =
    buildRoleFilter(reqUser);

  applyQueryFilters(
    filter,
    query
  );

  const result =
    await Result.aggregate([
      {
        $match: filter
      },

      {
        $group: {
          _id: null,

          total: {
            $sum: 1
          },

          pass: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$resultStatus",
                    "pass"
                  ]
                },
                1,
                0
              ]
            }
          },

          fail: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$resultStatus",
                    "fail"
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },

      {
        $project: {
          _id: 0,

          total: 1,
          pass: 1,
          fail: 1,

          passPercentage: {
            $round: [
              {
                $multiply: [
                  {
                    $cond: [
                      {
                        $gt: [
                          "$total",
                          0
                        ]
                      },
                      {
                        $divide: [
                          "$pass",
                          "$total"
                        ]
                      },
                      0
                    ]
                  },
                  100
                ]
              },
              2
            ]
          },

          failPercentage: {
            $round: [
              {
                $multiply: [
                  {
                    $cond: [
                      {
                        $gt: [
                          "$total",
                          0
                        ]
                      },
                      {
                        $divide: [
                          "$fail",
                          "$total"
                        ]
                      },
                      0
                    ]
                  },
                  100
                ]
              },
              2
            ]
          }
        }
      }
    ]);

  return (
    result[0] || {
      total: 0,
      pass: 0,
      fail: 0,
      passPercentage: 0,
      failPercentage: 0
    }
  );
}


/*
|--------------------------------------------------------------------------
| 7. PERFORMANCE TRENDS
|--------------------------------------------------------------------------
|
| Groups performance by academic year + semester.
| Suitable for line charts.
|
|--------------------------------------------------------------------------
*/

export async function getPerformanceTrends(
  reqUser,
  query
) {
  const {
    Result
  } = await getAnalyticsContext(
    reqUser
  );

  validateDepartmentAccess(
    reqUser,
    query
  );

  validateStudentAccess(
    reqUser,
    query
  );

  const filter =
    buildRoleFilter(reqUser);

  applyQueryFilters(
    filter,
    query
  );

  const result =
    await Result.aggregate([
      {
        $match: filter
      },

      {
        $group: {
          _id: {
            academicYear:
              "$academicYear",

            semester:
              "$semester"
          },

          averagePercentage: {
            $avg: "$percentage"
          },

          passCount: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$resultStatus",
                    "pass"
                  ]
                },
                1,
                0
              ]
            }
          },

          totalResults: {
            $sum: 1
          }
        }
      },

      {
        $project: {
          _id: 0,

          academicYear:
            "$_id.academicYear",

          semester:
            "$_id.semester",

          averagePercentage: {
            $round: [
              "$averagePercentage",
              2
            ]
          },

          passPercentage: {
            $round: [
              {
                $multiply: [
                  {
                    $cond: [
                      {
                        $gt: [
                          "$totalResults",
                          0
                        ]
                      },
                      {
                        $divide: [
                          "$passCount",
                          "$totalResults"
                        ]
                      },
                      0
                    ]
                  },
                  100
                ]
              },
              2
            ]
          },

          totalResults: 1
        }
      },

      {
        $sort: {
          academicYear: 1,
          semester: 1
        }
      }
    ]);

  return result;
}


/*
|--------------------------------------------------------------------------
| 8. AT-RISK STUDENTS
|--------------------------------------------------------------------------
|
| Analytics layer identifies students showing weak
| performance.
|
| Paper says predictive analytics considers:
| - current scores
| - improvement rates
| - comparative cohort performance
|
| The actual ML prediction model belongs to Module 11.
| This endpoint provides the analytics dataset used
| for that prediction/early-warning layer.
|
|--------------------------------------------------------------------------
*/

export async function getAtRiskStudents(
  reqUser,
  query
) {
  if (
    reqUser.role === "student"
  ) {
    throw new Error(
      "Access denied"
    );
  }

  const {
    Result
  } = await getAnalyticsContext(
    reqUser
  );

  validateDepartmentAccess(
    reqUser,
    query
  );

  const filter =
    buildRoleFilter(reqUser);

  applyQueryFilters(
    filter,
    query
  );

  const result =
    await Result.aggregate([
      {
        $match: filter
      },

      {
        $group: {
          _id: "$studentId",

          studentName: {
            $first: "$studentName"
          },

          department: {
            $first: "$department"
          },

          averagePercentage: {
            $avg: "$percentage"
          },

          totalSubjects: {
            $sum: 1
          },

          failedSubjects: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$resultStatus",
                    "fail"
                  ]
                },
                1,
                0
              ]
            }
          },

          lowestPercentage: {
            $min: "$percentage"
          }
        }
      },

      {
        $addFields: {
          riskScore: {
            $add: [
              {
                $cond: [
                  {
                    $lt: [
                      "$averagePercentage",
                      40
                    ]
                  },
                  50,
                  0
                ]
              },

              {
                $cond: [
                  {
                    $lt: [
                      "$averagePercentage",
                      50
                    ]
                  },
                  30,
                  0
                ]
              },

              {
                $multiply: [
                  "$failedSubjects",
                  10
                ]
              },

              {
                $cond: [
                  {
                    $lt: [
                      "$lowestPercentage",
                      40
                    ]
                  },
                  10,
                  0
                ]
              }
            ]
          }
        }
      },

      {
        $match: {
          $or: [
            {
              averagePercentage: {
                $lt: 50
              }
            },

            {
              failedSubjects: {
                $gt: 0
              }
            }
          ]
        }
      },

      {
        $addFields: {
          riskLevel: {
            $switch: {
              branches: [
                {
                  case: {
                    $gte: [
                      "$riskScore",
                      60
                    ]
                  },
                  then: "high"
                },

                {
                  case: {
                    $gte: [
                      "$riskScore",
                      30
                    ]
                  },
                  then: "medium"
                }
              ],

              default: "low"
            }
          }
        }
      },

      {
        $project: {
          _id: 0,

          studentId: "$_id",

          studentName: 1,
          department: 1,

          averagePercentage: {
            $round: [
              "$averagePercentage",
              2
            ]
          },

          totalSubjects: 1,
          failedSubjects: 1,

          lowestPercentage: 1,

          riskScore: 1,
          riskLevel: 1
        }
      },

      {
        $sort: {
          riskScore: -1,
          averagePercentage: 1
        }
      }
    ]);

  return result;
}