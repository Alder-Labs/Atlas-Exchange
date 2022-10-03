import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useMutation } from 'react-query';

import { Spinner } from '../../components/base';
import { getStripe } from '../../components/kyc/stripe';
import { SidePadding } from '../../components/layout/SidePadding';
import { useStripeVerificationSession } from '../../hooks/useStripeVerificationSession';
import { useFormMutationFetcher } from '../../lib/formMutation';

import type { NextPage } from 'next';

const IdentityVerification: NextPage = () => {
  const { data, error, isLoading } = useStripeVerificationSession();
  const router = useRouter();

  // Per FTX request, this request is fired after Stripe Verification
  // to trigger an update of kycStatus in the login_status response.
  const { mutate: updateKycState } = useMutation(
    useFormMutationFetcher<{ kycType: string }, { success: boolean }>(
      `/proxy/api/kyc/level_2`
    ),
    {
      onSuccess: (res) => {
        router.push('/account');
      },
      onError: (err: Error) => {
        router.push('/account');
      },
    }
  );

  useEffect(() => {
    if (!data || !data.client_secret) {
      return;
    }

    async function openStripeModal() {
      const stripeClient = await getStripe();
      if (!stripeClient || !data || !data.client_secret || error) {
        console.warn('Error loading Stripe', error);
        toast.error('Error loading Stripe');
        return;
      }
      const identityRes = await stripeClient.verifyIdentity(data.client_secret);
      if (!identityRes) {
        throw new Error('Failed to verify with Stripe. Please contact support');
      }
      if (identityRes?.error?.message) {
        throw new Error(identityRes.error.message);
      }
      return identityRes;
    }

    openStripeModal().then((res) => {
      updateKycState({ kycType: 'individual' });
    });
  }, [data, router, error, updateKycState]);

  return (
    <div className={'bg-grayLight-20 grow dark:bg-black'}>
      <SidePadding>
        <div className={'mt-24 flex justify-center'}>
          {isLoading && <Spinner />}
        </div>
      </SidePadding>
    </div>
  );
};

// -----------------------------------------------------------------------------
// -------------------- MANUAL IDENTITY VERIFICATION ---------------------------
// -----------------------------------------------------------------------------

// import 'filepond/dist/filepond.min.css';
// import type { IdentityVerification } from '../../lib/types/kyc';
// import imageCompression from 'browser-image-compression';
// import { FilePondFile } from 'filepond';
// import { useRouter } from 'next/router';
// import { FilePond } from 'react-filepond';
// import { useMutation } from 'react-query';
//
// import { Button, TextLabel } from '../../components/base';
// import { SidePadding } from '../../components/layout/SidePadding';
// import { OnboardingCard } from '../../components/onboarding/OnboardingCard';
// import { useFormMutationFetcher } from '../../lib/formMutation';
// import { toast } from '../../lib/toast';

// interface Validation {
//   frontDriverLicenseMissing: boolean;
//   backDriverLicenseMissing: boolean;
//   selfieDriverLicenseMissing: boolean;
// }
//
// const compressionOptions = {
//   maxSizeMB: 1,
//   useWebWorker: true,
// };
//
// const IdentityVerification: NextPage = () => {
//   const router = useRouter();
//   const [compressionIsLoading, setCompressionIsLoading] = useState(false);
//
//   const { isLoading: submitIdentityIsLoading, mutate: submitIdentity } =
//     useMutation(
//       useFormMutationFetcher<IdentityVerification, {}>(
//         `/proxy/api/kyc/level_2`
//       ),
//       {
//         onSuccess: () => {
//           toast.success('Successfully submitted KYC Level 2');
//           router.push('/');
//         },
//         onError: (err: Error) => {
//           toast.error(`Error: ${err.message}`);
//         },
//       }
//     );
//
//   const handleImageCompressionsAndUploads = async () => {
//     setCompressionIsLoading(true);
//     const compressedFrontImage = await imageCompression(
//       frontDriverLicenseFile[0].file as File,
//       compressionOptions
//     );
//     const compressedBackImage = await imageCompression(
//       backDriverLicenseFile[0].file as File,
//       compressionOptions
//     );
//     const compressedSelfieImage = await imageCompression(
//       selfieDriverLicenseFile[0].file as File,
//       compressionOptions
//     );
//     const formData = {
//       idDocFront: new File([compressedFrontImage], compressedFrontImage.name),
//       idDocBack: new File([compressedBackImage], compressedBackImage.name),
//       idSelfie: new File([compressedSelfieImage], compressedSelfieImage.name),
//     } as IdentityVerification;
//     submitIdentity(formData);
//     setCompressionIsLoading(false);
//   };
//
//   // Append Phone Data to KYC Form Data
//   const onSubmit = () => {
//     let errors: Validation = {
//       frontDriverLicenseMissing: false,
//       backDriverLicenseMissing: false,
//       selfieDriverLicenseMissing: false,
//     };
//     errors['frontDriverLicenseMissing'] =
//       !frontDriverLicenseFile || frontDriverLicenseFile.length <= 0;
//     errors['backDriverLicenseMissing'] =
//       !backDriverLicenseFile || backDriverLicenseFile.length <= 0;
//     errors['selfieDriverLicenseMissing'] =
//       !selfieDriverLicenseFile || selfieDriverLicenseFile.length <= 0;
//     if (Object.keys(errors).length > 0) {
//       setValidationErrors(errors);
//     }
//
//     if (
//       [
//         frontDriverLicenseFile,
//         backDriverLicenseFile,
//         selfieDriverLicenseFile,
//       ].every((file) => file && file.length > 0)
//     ) {
//       handleImageCompressionsAndUploads().catch(() => {
//         console.log('Error uploading file');
//       });
//     } else {
//       console.log('Missing files...');
//     }
//   };
//
//   const [frontDriverLicenseFile, setFrontDriverLicenseFile] = React.useState<
//     FilePondFile[]
//   >([]);
//   const [backDriverLicenseFile, setBackDriverLicenseFile] = React.useState<
//     FilePondFile[]
//   >([]);
//   const [selfieDriverLicenseFile, setSelfieDriverLicenseFile] = React.useState<
//     FilePondFile[]
//   >([]);
//
//   const [validationErrors, setValidationErrors] = React.useState<{
//     frontDriverLicenseMissing: boolean;
//     backDriverLicenseMissing: boolean;
//     selfieDriverLicenseMissing: boolean;
//   }>({
//     frontDriverLicenseMissing: false,
//     backDriverLicenseMissing: false,
//     selfieDriverLicenseMissing: false,
//   });
//
//   return (
//     <div className={'grow bg-grayLight-20 dark:bg-black'}>
//       <SidePadding>
//         <div className={'mt-24 flex justify-center'}>
//           <OnboardingCard title="Upload Driver's License" center={false}>
//             <div className={'m-4'}>
//               <ul className={'text-md list-disc text-grayLight-50'}>
//                 <li>
//                   The driver&apos;s license is issued by a US state or territory
//                 </li>
//                 <li>The driver&apos;s license is NOT expired</li>
//                 <li>
//                   All information on the front of your driver&apos;s license is
//                   legible
//                 </li>
//                 <li>
//                   The submitted file is in color. Black and white files will not
//                   be accepted.
//                 </li>
//               </ul>
//             </div>
//
//             <div className={'flex flex-row justify-between'}>
//               <TextLabel>Front Driver&apos;s License *</TextLabel>
//               {validationErrors.frontDriverLicenseMissing && (
//                 <span className={'text-error mr-2 text-sm'}> (Required)</span>
//               )}
//             </div>
//             <div className={'h-2'} />
//             <FilePond
//               allowMultiple={false}
//               credits={false}
//               labelIdle={
//                 'Drag and Drop here,<p class=text-brand-500> or click to Browse</p>'
//               }
//               onupdatefiles={setFrontDriverLicenseFile}
//             />
//
//             <div className={'h-2'} />
//
//             <div className={'flex flex-row justify-between'}>
//               <TextLabel>Back Driver&apos;s License * </TextLabel>
//               {validationErrors.backDriverLicenseMissing && (
//                 <span className={'text-error mr-2 text-sm'}> (Required) </span>
//               )}
//             </div>
//             <div className={'h-2'} />
//             <FilePond
//               allowMultiple={false}
//               credits={false}
//               labelIdle={
//                 'Drag and Drop here,<p class=text-brand-500> or click to Browse</p>'
//               }
//               onupdatefiles={setBackDriverLicenseFile}
//             />
//             <div className={'h-2'} />
//
//             <div className={'flex flex-row justify-between'}>
//               <TextLabel>Selfie with Driver&apos;s License *</TextLabel>
//               {validationErrors.selfieDriverLicenseMissing && (
//                 <span className={'text-error mr-2 text-sm'}> (Required) </span>
//               )}
//             </div>
//             <div className={'h-2'} />
//             <FilePond
//               allowMultiple={false}
//               credits={false}
//               labelIdle={
//                 'Drag and Drop here,<p class=text-brand-500> or click to Browse</p>'
//               }
//               onupdatefiles={setSelfieDriverLicenseFile}
//             />
//
//             <div className="h-4" />
//             <Button
//               className="w-full"
//               onClick={onSubmit}
//               loading={submitIdentityIsLoading || compressionIsLoading}
//             >
//               Submit
//             </Button>
//           </OnboardingCard>
//         </div>
//       </SidePadding>
//     </div>
//   );
// };

export default IdentityVerification;
