import { GoPlus } from 'react-icons/go';

interface PlusReactIconProps {
  className?: string;
  size?: number;
  color?: string;
}

export const PlusReactIcon = ({ className, size, color }: PlusReactIconProps) => (
  <GoPlus size={size} color={color} className={className} />
);
