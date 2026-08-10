import { IMaskInput, type IMaskInputProps } from "react-imask";
import { Input } from "./input";
import * as React from "react";
import { cn } from "@/lib/utils";

type IMaskProps = IMaskInputProps<HTMLInputElement>;

interface MaskedInputProps extends React.ComponentProps<typeof Input> {
  mask: IMaskProps["mask"];
  value?: string;
  onAccept?: IMaskProps["onAccept"];
  unmask?: boolean;
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, onAccept, unmask = false, className, ...props }, ref) => {
    return (
      <IMaskInput
        {...props}
        mask={mask}
        unmask={unmask}
        onAccept={onAccept}
        inputRef={ref}
        component={Input}
        className={cn(className)}
      />
    );
  }
);

MaskedInput.displayName = "MaskedInput";
