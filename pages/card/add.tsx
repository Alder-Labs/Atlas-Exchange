import React from 'react';

import { NextPage } from 'next';

import AddCard from '../../components/card/AddCard';

const Page: NextPage = () => {
  return (
    <div className="max-w-2xl">
      <AddCard />
    </div>
  );
};

export default Page;
