import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-accent text-accent-foreground',
        secondary: 'border-transparent bg-surface-2 text-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground border-border',
        success: 'border-transparent bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        warning: 'border-transparent bg-amber-500/10 text-amber-400 border-amber-500/20',
        info: 'border-transparent bg-blue-500/10 text-blue-400 border-blue-500/20',
        glow: 'border-accent/30 bg-accent/10 text-accent shadow-sm shadow-accent/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
