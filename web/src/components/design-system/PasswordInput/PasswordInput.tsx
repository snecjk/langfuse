import { useState, type InputHTMLAttributes, type Ref } from "react";
import { Eye, EyeOff } from "@langfuse/icons";
import { InputControl } from "../internal/InputControl/InputControl";

type PasswordInputProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  | "aria-describedby"
  | "aria-invalid"
  | "aria-label"
  | "aria-labelledby"
  | "autoComplete"
  | "autoFocus"
  | "defaultValue"
  | "disabled"
  | "id"
  | "name"
  | "onBlur"
  | "onChange"
  | "onFocus"
  | "placeholder"
  | "readOnly"
  | "required"
  | "tabIndex"
  | "value"
> & {
  allowPasswordManager?: boolean;
  error?: boolean;
  ref?: Ref<HTMLInputElement>;
  /**
   * Accessible name for the show-password toggle. The design system stays
   * context-free: application callers pass the localized label.
   */
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
};

export function PasswordInput({
  allowPasswordManager,
  ref,
  disabled,
  error,
  showPasswordLabel = "Show password",
  hidePasswordLabel = "Hide password",
  ...props
}: PasswordInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const VisibilityIcon = isPasswordVisible ? EyeOff : Eye;

  return (
    <InputControl
      contentLayout="text"
      error={error}
      trailingAction={{
        label: isPasswordVisible ? hidePasswordLabel : showPasswordLabel,
        icon: VisibilityIcon,
        disabled,
        pressed: isPasswordVisible,
        onClick: () => setIsPasswordVisible((visible) => !visible),
      }}
    >
      <input
        {...props}
        {...(!allowPasswordManager && { "data-1p-ignore": true })}
        ref={ref}
        type={isPasswordVisible ? "text" : "password"}
        disabled={disabled}
      />
    </InputControl>
  );
}
