import { describe, expect, test } from "vitest";
import { groupKey, secretFromOtpauth } from "./otpauth";

describe("secretFromOtpauth", () => {
  test("pulls the plain key out of the link", () => {
    const url =
      "otpauth://totp/LibraryHub:reader%40test.pk?secret=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP&issuer=LibraryHub";
    expect(secretFromOtpauth(url)).toBe("JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP");
  });

  test.each([undefined, "", "not a url", "otpauth://totp/x?issuer=LibraryHub"])(
    "no usable key in %p gives null",
    (url) => {
      expect(secretFromOtpauth(url)).toBeNull();
    },
  );
});

describe("groupKey", () => {
  test("groups in fours for reading", () => {
    expect(groupKey("JBSWY3DPEHPK3PXP")).toBe("JBSW Y3DP EHPK 3PXP");
  });

  test("a short last group gets no trailing space", () => {
    expect(groupKey("ABCDEF")).toBe("ABCD EF");
  });

  test("nothing in, nothing out", () => {
    expect(groupKey(null)).toBe("");
  });
});
