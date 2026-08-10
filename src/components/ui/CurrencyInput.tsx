import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Input } from "./input";
import * as React from "react";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<NumericFormatProps, "customInput" | "onChange"> {
  value?: string | number | null;
  onValueChange?: (value: number | null, formattedValue: string) => void;
  className?: string;
  error?: boolean;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, className, error, ...props }, ref) => {
    return (
      <NumericFormat
        {...props}
        value={value ?? ""}
        onValueChange={(values) => {
          if (onValueChange) {
            onValueChange(values.floatValue ?? null, values.formattedValue);
          }
        }}
        customInput={Input}
        getInputRef={ref}
        thousandSeparator="."
        decimalSeparator=","
        prefix="R$ "
        decimalScale={2}
        fixedDecimalScale
        allowNegative={false}
        className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
