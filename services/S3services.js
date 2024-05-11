const AWS = require("aws-sdk");

const uploadToS3 = async (stringifiedExpenses, filename) => {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
  });

  var params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: stringifiedExpenses,
    ACL: "public-read",
  };

  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (error, s3response) => {
      if (error) {
        console.log("Something went wrong");
        reject(error);
      } else {
        console.log("success", s3response);
        resolve(s3response.Location);
      }
    });
  });
};

module.exports = {
  uploadToS3,
};
