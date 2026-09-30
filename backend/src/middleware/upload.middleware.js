import multer from "multer";


/*
|--------------------------------------------------------------------------
| MEMORY STORAGE
|--------------------------------------------------------------------------
|
| File is kept in memory temporarily.
| It is parsed directly using XLSX.
|
*/

const storage =
  multer.memoryStorage();


/*
|--------------------------------------------------------------------------
| FILE FILTER
|--------------------------------------------------------------------------
*/

function fileFilter(
  req,
  file,
  callback
) {
  const allowedExtensions = [
    ".csv",
    ".xlsx",
    ".xls"
  ];

  const fileName =
    file.originalname.toLowerCase();

  const isAllowed =
    allowedExtensions.some(
      (extension) =>
        fileName.endsWith(
          extension
        )
    );

  if (!isAllowed) {
    return callback(
      new Error(
        "Only CSV, XLSX and XLS files are allowed"
      )
    );
  }

  callback(null, true);
}


/*
|--------------------------------------------------------------------------
| MULTER CONFIGURATION
|--------------------------------------------------------------------------
*/

const upload =
  multer({
    storage,
    fileFilter,

    limits: {
      fileSize:
        10 * 1024 * 1024
    }
  });


export default upload;