// const aws = require('aws-sdk');
// const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = require('../../config')


// aws.config.update({
//     accessKeyId: AWS_ACCESS_KEY_ID,
//     secretAccessKey: AWS_SECRET_ACCESS_KEY,
//     region: AWS_REGION
// })


// const uploadFiles = async (file) => {
//     return new Promise((resolve, reject) => {
//         const s3 = new aws.S3({apiVersion : "2006-03-01"});
//         let uploadParams = {
//             ACL: "public-read",
//             Bucket: "classroom-training-bucket",
//             Key: "abc/" + file.originalname, 
//             Body: file.buffer
//         }
//         s3.upload(uploadParams, function (err, data) {
//             if (err) {
//                 return reject({ "error": err })
//             }
//             return resolve(data.Location)
//         })
//     })
// }

// module.exports = {
//     uploadFiles
// }
//==================================================new version to add aws =================================
// const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
// const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = require('../../config');

// const uploadFiles = async (file) => {
//   const s3Client = new S3Client({
//     region: AWS_REGION,
//     credentials: {
//       accessKeyId: AWS_ACCESS_KEY_ID,
//       secretAccessKey: AWS_SECRET_ACCESS_KEY
//     }
//   });

//   const uploadParams = {
//     ACL : 'public-read',
//     Bucket: 'classroom-training-bucket',
//     Key: `abc/${file.originalname}`,
//     Body: file.buffer,
//     Date : Date.now()
//   };

//   try {
//     const command = new PutObjectCommand(uploadParams);
//     const p = await s3Client.send(command, (err, data)=>{
//       if(err){
//         console.log(err);
//       }
//       return data.Location
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// module.exports = {
//   uploadFiles
// };




// const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
// const { Readable } = require('stream');
// const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = require('../../config');

// const uploadFiles = (file) => {
//     const s3Client = new S3Client({
//         region: AWS_REGION,
//         credentials: {
//             accessKeyId: AWS_ACCESS_KEY_ID,
//             secretAccessKey: AWS_SECRET_ACCESS_KEY
//         }
//     });

//     const uploadParams = {
//         Bucket: 'classroom-training-bucket',
//         Key: `abc/${file.originalname}`,
//         Body: new Readable({
//             read() {
//                 this.push(file.buffer);
//                 this.push(null);
//             }
//         })
//     };

//     return new Promise((resolve, reject) => {
//         const command = new PutObjectCommand(uploadParams);
//         s3Client
//             .send(command)
//             .then((data) => resolve(data.Location))
//             .catch((error) => reject(error));
//     });
// };

// module.exports = {
//     uploadFiles
// };



const AWS = require('aws-sdk');
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = require('../../config');
const fs = require('fs');

const uploadFiles = async (file) => {
    AWS.config.update({
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
        region: AWS_REGION
    });

    const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

    const uploadParams = {
        Bucket: 'classroom-training-bucket',
        Key: `abc/${file.originalname}`,
        Body: file.buffer,
        ACL: 'public-read'
    };

    try {
        const data = await s3.upload(uploadParams).promise();
        return data.Location;
    } catch (error) {
        return {error : error.message}
    }
};

module.exports = {
    uploadFiles
};

