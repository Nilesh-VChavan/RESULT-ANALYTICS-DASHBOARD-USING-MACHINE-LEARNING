import multer from "multer";
import path from "path";
import fs from "fs";


const uploadDirectory =
  path.join(
    process.cwd(),
    "src",
    "uploads",
    "results"
  );


if (
  !fs.existsSync(
    uploadDirectory
  )
) {
  fs.mkdirSync(
    uploadDirectory,
    {
      recursive: true
    }
  );
}


const storage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        uploadDirectory
      );
    },

    filename: (
      req,
      file,
      cb
    ) => {
      const extension =
        path.extname(
          file.originalname
        );

      const baseName =
        path
          .basename(
            file.originalname,
            extension
          )
          .replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
          );

      cb(
        null,
        `${Date.now()}_${baseName}${extension}`
      );
    }
  });


function fileFilter(
  req,
  file,
  cb
) {
  const extension =
    path
      .extname(
        file.originalname
      )
      .toLowerCase();


  if (
    extension === ".csv" ||
    extension === ".xlsx" ||
    extension === ".xls"
  ) {
    return cb(
      null,
      true
    );
  }


  cb(
    new Error(
      "Only CSV, XLSX or XLS files are allowed"
    )
  );
}


const upload =
  multer({
    storage,

    fileFilter,

    limits: {
      fileSize:
        10 * 1024 * 1024
    }
  });


/*
|--------------------------------------------------------------------------
| ACCEPT FILE FIELD
|--------------------------------------------------------------------------
|
| Supports:
| file
| csv
|
| This prevents:
| MulterError: Unexpected field
|
*/

export const uploadResultFile =
  upload.fields([
    {
      name: "file",
      maxCount: 1
    },
    {
      name: "csv",
      maxCount: 1
    }
  ]);


export default upload;