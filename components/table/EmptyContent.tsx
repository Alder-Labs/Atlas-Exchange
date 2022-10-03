export interface EmptyContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  letter: string;
}

export const EmptyContent = (props: EmptyContentProps) => {
  const { letter, children } = props;

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="bg-brand-400/25 mt-4 mb-4 flex h-24 w-24 items-center justify-center rounded-full">
        <div className="text-brand-400 text-5xl font-bold">{letter}</div>
      </div>
      {children}
    </div>
  );
};
