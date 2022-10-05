export interface EmptyContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  letter: string;
}

export const EmptyContent = (props: EmptyContentProps) => {
  const { letter, children } = props;

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="mt-4 mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-brand-400/25">
        <div className="text-5xl font-bold text-brand-400">{letter}</div>
      </div>
      {children}
    </div>
  );
};
