export const ANIMATION_DURATION = 200;

export const ChartGradient = (props: { id: string; color: string }) => {
  const { color, id } = props;
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="50%" stopColor={color} stopOpacity={0.2} />
      <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.0} />
    </linearGradient>
  );
};
