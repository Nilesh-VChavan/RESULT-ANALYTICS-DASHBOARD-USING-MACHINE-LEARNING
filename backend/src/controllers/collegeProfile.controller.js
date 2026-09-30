import {
  getCollegeProfile,
  updateCollegeProfile,
  getCollegeSettings
} from "../services/collegeProfile.service.js";

export async function profile(req, res) {
  try {
    const college = await getCollegeProfile(
      req.user.collegeId
    );

    return res.status(200).json({
      success: true,
      message: "College profile fetched successfully",
      college
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
}

export async function updateProfile(req, res) {
  try {
    const college = await updateCollegeProfile(
      req.user.collegeId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "College profile updated successfully",
      college
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

export async function settings(req, res) {
  try {
    const settings = await getCollegeSettings(
      req.user.collegeId
    );

    return res.status(200).json({
      success: true,
      message: "College settings fetched successfully",
      settings
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
}