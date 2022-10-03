export function DimOutside({ dim }: { dim?: boolean }) {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0 h-full w-full transition "
      style={{
        boxShadow: dim ? '0 0 0 100vmax rgba(0,0,0,.7)' : '',
      }}
    />
  );
}
