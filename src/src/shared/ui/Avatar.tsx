import React from 'react';
import { cn } from '../lib/utils';
interface AvatarProps {
  src?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}
export const Avatar: React.FC<AvatarProps> = ({
  src,
  fallback,
  size = 'md',
  className
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl'
  };
  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full bg-tg-primary/10 text-tg-primary font-semibold items-center justify-center border-2 border-tg-bg shadow-sm',
        sizes[size],
        className
      )}>
      
      {src ?
      <img
        src={src}
        alt="Avatar"
        className="aspect-square h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }} /> :


      <span>{fallback}</span>
      }
    </div>);

};