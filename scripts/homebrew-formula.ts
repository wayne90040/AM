// 產生 Homebrew tap（wayne90040/homebrew-am）用的 Formula/am.rb 內容
// 用法：bun run scripts/homebrew-formula.ts <version> <arm64 sha256> <x64 sha256> > Formula/am.rb

export type FormulaInput = {
  version: string;
  arm64Sha: string;
  x64Sha: string;
  repo: string;
};

export function renderFormula({ version, arm64Sha, x64Sha, repo }: FormulaInput): string {
  const base = `https://github.com/${repo}/releases/download/v${version}`;
  return `class Am < Formula
  desc "終端機選單與本機網站，管理 Claude Code 的服務商與模型設定"
  homepage "https://github.com/${repo}"
  version "${version}"

  on_macos do
    on_arm do
      url "${base}/am-macos-arm64.zip"
      sha256 "${arm64Sha}"
    end
    on_intel do
      url "${base}/am-macos-x64.zip"
      sha256 "${x64Sha}"
    end
  end

  depends_on :macos

  def install
    bin.install "am"
  end

  service do
    run [opt_bin/"am", "server"]
    keep_alive true
    log_path var/"log/am/server.log"
    error_log_path var/"log/am/server.log"
  end

  def caveats
    <<~EOS
      開機自動執行管理網站（建議 Homebrew 使用者改用這個，不要再用 \`am autostart\`，避免兩份開機設定互相衝突）：
        brew services start am
        brew services stop am

      移除前建議先執行（停止管理網站與開機自動執行；設定會保留在 ~/.am）：
        am uninstall --keep-config --yes
      再執行：
        brew uninstall am
    EOS
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/am --version")
  end
end
`;
}

if (import.meta.main) {
  const [version, arm64Sha, x64Sha, repo = "wayne90040/AM"] = process.argv.slice(2);
  if (!version || !arm64Sha || !x64Sha) {
    console.error("用法：bun run scripts/homebrew-formula.ts <version> <arm64 sha256> <x64 sha256> [repo]");
    process.exit(1);
  }
  process.stdout.write(renderFormula({ version, arm64Sha, x64Sha, repo }));
}
