const AWS = require("aws-sdk");

const REGION = "us-west-2";

(async () => {
  const ssm = new AWS.SSM({ region: REGION });
  const parameter = await ssm
    .getParameter({
      Name: "/api/url",
      WithDecryption: true,
    })
    .promise();
  console.log(parameter.Parameter.Value);
})();
