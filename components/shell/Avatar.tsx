interface AvatarProps {
  name: string;
  size?: number;
}

export function Avatar({ name, size = 30 }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className="grid flex-none place-items-center rounded-full bg-neutral-800 font-semibold text-neutral-100"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
