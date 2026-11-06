type OS = "windows" | "macos" | "linux" | "unknown";

export function detectOS(): OS {
  const platform = (navigator as any).userAgentData?.platform || navigator.platform;

  if (/Win/i.test(platform)) {
    return "windows";
  }

  if (/Mac/i.test(platform)) {
    return "macos";
  }

  if (/Linux/i.test(platform)) {
    return "linux";
  }

  return "unknown";
}
