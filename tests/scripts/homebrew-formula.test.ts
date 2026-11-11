import { expect, test } from "bun:test";
import { renderFormula } from "../../scripts/homebrew-formula";

const input = {
  version: "1.2.0",
  arm64Sha: "aaaa111",
  x64Sha: "bbbb222",
  repo: "wayne90040/AM",
};

test("帶入版本、網址與 sha256", () => {
  const formula = renderFormula(input);
  expect(formula).toContain('version "1.2.0"');
  expect(formula).toContain("https://github.com/wayne90040/AM/releases/download/v1.2.0/am-macos-arm64.zip");
  expect(formula).toContain('sha256 "aaaa111"');
  expect(formula).toContain("https://github.com/wayne90040/AM/releases/download/v1.2.0/am-macos-x64.zip");
  expect(formula).toContain('sha256 "bbbb222"');
});

test("有 service 區塊，建議改用 brew services", () => {
  const formula = renderFormula(input);
  expect(formula).toContain("service do");
  expect(formula).toContain("brew services start am");
  expect(formula).toContain("brew services stop am");
});

test("caveats 提醒卸載前先執行 am uninstall --keep-config", () => {
  const formula = renderFormula(input);
  expect(formula).toContain("am uninstall --keep-config --yes");
  expect(formula).toContain("brew uninstall am");
});

test("只支援 macOS，限制 arm/intel 兩種架構", () => {
  const formula = renderFormula(input);
  expect(formula).toContain("depends_on :macos");
  expect(formula).toContain("on_arm do");
  expect(formula).toContain("on_intel do");
});
