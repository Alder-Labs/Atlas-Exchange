const { SSM } = require('@aws-sdk/client-ssm');

const REGION = "us-west-2";

(async() => {
    const client = new SSM({ region: REGION });
    const parameter = await client.getParameter({
        Name: '/api/url',
        WithDecryption: true
    })
    console.log(parameter.Parameter.Value);
})();
