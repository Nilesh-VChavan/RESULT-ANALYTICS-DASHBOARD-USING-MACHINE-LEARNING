import College from "../models/College.js";

export async function getCollegeProfile(collegeId) {
  const college = await College.findById(collegeId).select(
    "-__v"
  );

  if (!college) {
    throw new Error("College not found");
  }

  return college;
}

export async function updateCollegeProfile(
  collegeId,
  data
) {
  const allowedFields = [
    "collegeName",
    "adminEmail",
    "address",
    "city",
    "state",
    "pincode"
  ];

  const updateData = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  const college = await College.findByIdAndUpdate(
    collegeId,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).select("-__v");

  if (!college) {
    throw new Error("College not found");
  }

  return college;
}

export async function getCollegeSettings(
  collegeId
) {
  const college = await College.findById(collegeId).select(
    "collegeName collegeCode databaseName status"
  );

  if (!college) {
    throw new Error("College not found");
  }

  return {
    collegeId: college._id,
    collegeName: college.collegeName,
    collegeCode: college.collegeCode,
    databaseName: college.databaseName,
    status: college.status
  };
}