import {
  uploadResults,
  validateResults,
  previewResults,
  publishResults,
  updatePublishedResult
} from "../services/examDepartment.service.js";


/*
|--------------------------------------------------------------------------
| UPLOAD RESULT FILE
|--------------------------------------------------------------------------
*/

export async function upload(
  req,
  res
) {
  try {
    const upload =
      await uploadResults(
        req.user,
        req.file
      );

    return res.status(201).json({
      success: true,
      message:
        "Result file uploaded successfully",
      upload
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error.message
    });
  }
}


/*
|--------------------------------------------------------------------------
| VALIDATE RESULTS
|--------------------------------------------------------------------------
*/

export async function validate(
  req,
  res
) {
  try {
    const upload =
      await validateResults(
        req.user,
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message:
        upload.status === "validated"
          ? "Results validated successfully"
          : "Result validation failed",
      upload
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error.message
    });
  }
}


/*
|--------------------------------------------------------------------------
| PREVIEW RESULTS
|--------------------------------------------------------------------------
*/

export async function preview(
  req,
  res
) {
  try {
    const upload =
      await previewResults(
        req.user,
        req.params.id
      );

    return res.status(200).json({
      success: true,
      upload
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error.message
    });
  }
}


/*
|--------------------------------------------------------------------------
| PUBLISH RESULTS
|--------------------------------------------------------------------------
*/

export async function publish(
  req,
  res
) {
  try {
    const upload =
      await publishResults(
        req.user,
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message:
        "Results published successfully",
      upload
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error.message
    });
  }
}


/*
|--------------------------------------------------------------------------
| UPDATE PUBLISHED RESULT
|--------------------------------------------------------------------------
*/

export async function updatePublished(
  req,
  res
) {
  try {
    const result =
      await updatePublishedResult(
        req.user,
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Published result updated successfully",
      result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error.message
    });
  }
}