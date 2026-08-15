const OTP_DISABLED_VALUES = new Set(["disabled", "false", "no-otp", "none", "off"]);

export function isOtpLoginEnabled() {
  const mode = (process.env.NEXT_PUBLIC_OTP_LOGIN_MODE || process.env.OTP_LOGIN_MODE || "otp").toLowerCase().trim();
  return !OTP_DISABLED_VALUES.has(mode);
}
