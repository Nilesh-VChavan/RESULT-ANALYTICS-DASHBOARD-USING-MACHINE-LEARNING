import {
  uploadResultFile,
  validateResultUpload,
  previewResults,
  publishResults,
  updatePublishedResult,
  deleteResultUpload
} from "../services/examDepartment.service.js";


/*
|--------------------------------------------------------------------------
| GET UPLOADED FILE
|--------------------------------------------------------------------------
|
| Multer accepts:
| file
| csv
|
| Convert either one into req.file
|
*/

function getUploadedFile(req) {
  if (req.file) {
    return req.file;
  }

  if (
    req.files &&
    req.files.file &&
    req.files.file.length > 0
  ) {
    return req.files.file[0];
  }

  if (
    req.files &&
    req.files.csv &&
    req.files.csv.length > 0
  ) {
    return req.files.csv[0];
  }

  return null;
}


/*
|--------------------------------------------------------------------------
| UPLOAD RESULT CSV
|--------------------------------------------------------------------------
*/

export async function uploadCSV(
  req,
  res
) {
  try {

    const file =
      getUploadedFile(req);


    if (
      !file ||
      !file.originalname
    ) {
      return res.status(400).json({
        success: false,
        message:
          "CSV file is required"
      });
    }


    if (
      !file.originalname
        .toLowerCase()
        .endsWith(".csv")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "CSV file is required"
      });
    }


    const result =
      await uploadResultFile(
        req.user,
        file
      );


    return res.status(201).json({
      success: true,
      message:
        "Result CSV uploaded successfully",
      ...result
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
| UPLOAD RESULT EXCEL
|--------------------------------------------------------------------------
*/

export async function uploadExcel(
  req,
  res
) {
  try {

    const file =
      getUploadedFile(req);


    if (
      !file ||
      !file.originalname
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Excel file is required"
      });
    }


    const fileName =
      file.originalname
        .toLowerCase();


    if (
      !fileName.endsWith(
        ".xlsx"
      ) &&
      !fileName.endsWith(
        ".xls"
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Excel file is required"
      });
    }


    const result =
      await uploadResultFile(
        req.user,
        file
      );


    return res.status(201).json({
      success: true,
      message:
        "Result Excel uploaded successfully",
      ...result
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

    const result =
      await validateResultUpload(
        req.user,
        req.params.uploadId
      );


    return res.status(200).json({
      success: true,
      message:
        result.invalidRows === 0
          ? "Results validated successfully"
          : "Result validation completed with errors",
      ...result
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

    const result =
      await previewResults(
        req.user,
        req.params.uploadId
      );


    return res.status(200).json({
      success: true,
      ...result
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

    const result =
      await publishResults(
        req.user,
        req.params.uploadId
      );


    return res.status(200).json({
      success: true,
      message:
        "Results published successfully",
      ...result
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
        req.params.resultId,
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

/*
|--------------------------------------------------------------------------
| DELETE UPLOADED RESULT RECORD
|--------------------------------------------------------------------------
*/

export async function deleteUpload(
  req,
  res
) {
  try {
    await deleteResultUpload(
      req.user,
      req.params.uploadId
    );

    return res.status(200).json({
      success: true,
      message:
        "Uploaded result record deleted successfully"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error.message
    });
  }
}