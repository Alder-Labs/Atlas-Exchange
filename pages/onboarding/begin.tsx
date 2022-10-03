import { useRouter } from 'next/router';

import { Button } from '../../components/base';
import { TitledModal } from '../../components/modals/TitledModal';
import { CustomPage } from '../../lib/types';
import { AuthLevel } from '../../lib/types/auth-level';

const BeginPage: CustomPage = () => {
  const router = useRouter();
  return (
    <TitledModal isOpen={true} title="STOP">
      <div>
        <div>KYC LEVEL 1 IS REQUIRED</div>
        <Button
          onClick={() => {
            router.push('/onboarding');
          }}
        >
          LETS GO
        </Button>
      </div>
    </TitledModal>
  );
};

BeginPage.requiredAuthLevel = AuthLevel.LoggedIn;

export default BeginPage;
