import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { formatBrazilianPhone } from "@/utils/phoneMask";

export interface MaskedInputProps
  extends Omit<React.ComponentProps<typeof Input>, "onChange"> {
  mask?: string | string[] | unknown;
  value?: string;
  onAccept?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  unmask?: boolean;
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value = "", onAccept, onChange, className, ...props }, ref) => {
    const isPhoneMask =
      mask === "phone" ||
      mask === "(00) 00000-0000" ||
      mask === "(00) 0000-0000" ||
      (Array.isArray(mask) &&
        mask.some((m) => typeof m === "string" && m.includes("(00)")));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;

      if (isPhoneMask) {
        val = formatBrazilianPhone(val);
        e.target.value = val;
      }

      onAccept?.(val);
      onChange?.(e);
    };

    // Formata o valor exibido caso seja máscara de telefone
    const displayValue = isPhoneMask ? formatBrazilianPhone(value) : value;

    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        className={cn(className)}
      />
    );
  }
);

MaskedInput.displayName = "MaskedInput";
