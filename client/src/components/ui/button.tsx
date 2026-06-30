import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-black uppercase tracking-widest font-display transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-transparent text-[#050505] border border-black/20 backdrop-blur-md hover:bg-[#f8f9fa] hover:text-[#050505] hover:-translate-y-[2px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)]",
        destructive:
          "bg-transparent text-red-500 border border-red-500/20 backdrop-blur-md hover:bg-red-500 hover:text-[#050505] hover:-translate-y-[2px] hover:shadow-[0_10px_30px_rgba(239,68,68,0.1)]",
        outline:
          "bg-transparent text-gray-600 border border-black/10 backdrop-blur-md hover:bg-black/5 hover:text-[#050505] hover:-translate-y-[2px]",
        secondary:
          "bg-black/5 text-[#050505] border border-black/10 backdrop-blur-md hover:bg-black/10 hover:-translate-y-[2px]",
        ghost: "hover:bg-black/5 hover:text-[#050505]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
