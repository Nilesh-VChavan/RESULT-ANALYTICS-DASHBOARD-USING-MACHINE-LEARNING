import College from "../models/College.js";
import { getDepartmentModel } from "../models/Department.js";
import { getUserModel } from "../models/User.js";


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
| GENERATE DEPARTMENT CODE
|--------------------------------------------------------------------------
*/

function generateDepartmentCode(name) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .replace(/[^a-zA-Z]/g, "")
      .substring(0, 4)
      .toUpperCase();
  }

  return words
    .map((word) => word.charAt(0))
    .join("")
    .substring(0, 6)
    .toUpperCase();
}


/*
|--------------------------------------------------------------------------
| SYNC DEPARTMENTS FROM USERS
|--------------------------------------------------------------------------
|
| Existing HOD users already contain department names such as:
|
| Computer Engineering
| Mechanical Engineering
|
| This function creates missing Department documents so the
| Department module and User module stay synchronized.
|
*/

async function syncDepartmentsFromUsers(
  databaseName,
  Department
) {
  const User = getUserModel(databaseName);

  const users = await User.find(
    {
      department: {
        $ne: null
      }
    },
    {
      department: 1,
      role: 1
    }
  ).lean();

  if (!users.length) {
    return;
  }

  const departmentMap = new Map();

  for (const user of users) {
    if (!user.department) {
      continue;
    }

    const departmentName = user.department.trim();

    if (!departmentName) {
      continue;
    }

    const key = departmentName.toLowerCase();

    if (!departmentMap.has(key)) {
      departmentMap.set(key, {
        name: departmentName,
        hodId: user.role === "hod" ? user._id : null
      });
    } else if (
      user.role === "hod" &&
      !departmentMap.get(key).hodId
    ) {
      departmentMap.get(key).hodId = user._id;
    }
  }

  for (const departmentData of departmentMap.values()) {
    const existingDepartment =
      await Department.findOne({
        name: {
          $regex: `^${departmentData.name.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )}$`,
          $options: "i"
        }
      });

    if (existingDepartment) {
      /*
      | If department already exists but does not have
      | an HOD assigned, assign the HOD from users.
      */

      if (
        !existingDepartment.hodId &&
        departmentData.hodId
      ) {
        existingDepartment.hodId =
          departmentData.hodId;

        await existingDepartment.save();
      }

      continue;
    }

    let baseCode =
      generateDepartmentCode(
        departmentData.name
      );

    if (!baseCode) {
      baseCode = "DEPT";
    }

    let departmentCode = baseCode;
    let counter = 1;

    /*
    | Make sure generated department code is unique.
    */

    while (
      await Department.findOne({
        code: departmentCode
      })
    ) {
      departmentCode =
        `${baseCode}${counter}`;

      counter++;
    }

    try {
      await Department.create({
        name: departmentData.name,
        code: departmentCode,
        description:
          `${departmentData.name} Department`,
        hodId:
          departmentData.hodId || null,
        isActive: true
      });

      console.log(
        `✅ Department synced: ${departmentData.name}`
      );
    } catch (error) {
      /*
      | Ignore duplicate key errors caused by
      | simultaneous requests.
      */

      if (error.code !== 11000) {
        throw error;
      }
    }
  }
}


/*
|--------------------------------------------------------------------------
| GET ALL DEPARTMENTS
|--------------------------------------------------------------------------
*/

export async function getAllDepartments(
  reqUser
) {
  const college =
    await getCollegeFromUser(reqUser);

  const Department =
    getDepartmentModel(
      college.databaseName
    );

  /*
  |--------------------------------------------------------------------------
  | FIX
  |--------------------------------------------------------------------------
  |
  | Existing users already contain department information.
  | Synchronize those departments into the departments collection
  | before reading the collection.
  |
  */

  await syncDepartmentsFromUsers(
    college.databaseName,
    Department
  );

  let query = {};

  /*
   * Principal and Exam Department
   * can see all departments.
   *
   * HOD can see only own department.
   *
   * Student can see only own department.
   */

  if (
    reqUser.role === "hod" ||
    reqUser.role === "student"
  ) {
    if (!reqUser.department) {
      return [];
    }

    query = {
      name: reqUser.department
    };
  }

  return await Department.find(query)
    .sort({ name: 1 });
}


/*
|--------------------------------------------------------------------------
| GET DEPARTMENT BY ID
|--------------------------------------------------------------------------
*/

export async function getDepartmentById(
  reqUser,
  departmentId
) {
  const college =
    await getCollegeFromUser(reqUser);

  const Department =
    getDepartmentModel(
      college.databaseName
    );

  /*
  | Make sure existing user departments are synchronized.
  */

  await syncDepartmentsFromUsers(
    college.databaseName,
    Department
  );

  const department =
    await Department.findById(
      departmentId
    );

  if (!department) {
    throw new Error(
      "Department not found"
    );
  }

  /*
   * HOD can access only own department.
   */

  if (
    reqUser.role === "hod" &&
    department.name !==
      reqUser.department
  ) {
    throw new Error("Access denied");
  }

  /*
   * Student can access only own department.
   */

  if (
    reqUser.role === "student" &&
    department.name !==
      reqUser.department
  ) {
    throw new Error("Access denied");
  }

  return department;
}


/*
|--------------------------------------------------------------------------
| CREATE DEPARTMENT
|--------------------------------------------------------------------------
*/

export async function createDepartment(
  reqUser,
  data
) {
  const college =
    await getCollegeFromUser(reqUser);

  /*
   * Only Principal and Exam Department
   * can create departments.
   */

  if (
    ![
      "principal",
      "exam_department"
    ].includes(reqUser.role)
  ) {
    throw new Error("Access denied");
  }

  const Department =
    getDepartmentModel(
      college.databaseName
    );

  const {
    name,
    code,
    description,
    hodId
  } = data;

  if (!name || !code) {
    throw new Error(
      "Department name and code are required"
    );
  }

  const existingDepartment =
    await Department.findOne({
      code: code.toUpperCase().trim()
    });

  if (existingDepartment) {
    throw new Error(
      "Department code already exists"
    );
  }

  const existingName =
    await Department.findOne({
      name: name.trim()
    });

  if (existingName) {
    throw new Error(
      "Department already exists"
    );
  }

  const department =
    await Department.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      description:
        description || "",
      hodId: hodId || null,
      isActive: true
    });

  return department;
}


/*
|--------------------------------------------------------------------------
| UPDATE DEPARTMENT
|--------------------------------------------------------------------------
*/

export async function updateDepartment(
  reqUser,
  departmentId,
  data
) {
  const college =
    await getCollegeFromUser(reqUser);

  /*
   * Only Principal and Exam Department
   * can update departments.
   */

  if (
    ![
      "principal",
      "exam_department"
    ].includes(reqUser.role)
  ) {
    throw new Error("Access denied");
  }

  const Department =
    getDepartmentModel(
      college.databaseName
    );

  const department =
    await Department.findById(
      departmentId
    );

  if (!department) {
    throw new Error(
      "Department not found"
    );
  }

  if (data.name !== undefined) {
    const newName =
      data.name.trim();

    const duplicateName =
      await Department.findOne({
        name: newName,
        _id: {
          $ne: departmentId
        }
      });

    if (duplicateName) {
      throw new Error(
        "Department name already exists"
      );
    }

    department.name = newName;
  }

  if (data.description !== undefined) {
    department.description =
      data.description;
  }

  if (data.hodId !== undefined) {
    department.hodId =
      data.hodId || null;
  }

  if (data.isActive !== undefined) {
    department.isActive =
      data.isActive;
  }

  if (data.code !== undefined) {
    const newCode =
      data.code.toUpperCase().trim();

    const duplicate =
      await Department.findOne({
        code: newCode,
        _id: {
          $ne: departmentId
        }
      });

    if (duplicate) {
      throw new Error(
        "Department code already exists"
      );
    }

    department.code = newCode;
  }

  await department.save();

  return department;
}


/*
|--------------------------------------------------------------------------
| DELETE DEPARTMENT
|--------------------------------------------------------------------------
*/

export async function deleteDepartment(
  reqUser,
  departmentId
) {
  const college =
    await getCollegeFromUser(reqUser);

  /*
   * Only Principal and Exam Department
   * can delete departments.
   */

  if (
    ![
      "principal",
      "exam_department"
    ].includes(reqUser.role)
  ) {
    throw new Error("Access denied");
  }

  const Department =
    getDepartmentModel(
      college.databaseName
    );

  const department =
    await Department.findById(
      departmentId
    );

  if (!department) {
    throw new Error(
      "Department not found"
    );
  }

  await Department.findByIdAndDelete(
    departmentId
  );

  return true;
}