export default class CustomTitleReporter {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.total = 0;
    this.runCnt = 0;
  }

  onTestCaseResult(testCase) {
    this.total++;
    const result = testCase.result();
    if (result.state === "passed") {
      this.passed++;
    } else if (result.state === "failed") {
      this.failed++;
    }
    this.updateTerminalTitle();
  }

  onTestRunStart() {
    this.runCnt++;
    this.passed = this.failed = this.total = 0;
  }

  onTestRunEnd() {
    this.updateTerminalTitle();
  }

  updateTerminalTitle() {
    setTimeout(() => {
      const title = `Tests (${this.runCnt} runs): ${this.passed}/${this.total} (Failed: ${this.failed})`;
      process.stdout.write(`\x1b]0;${title}\x07`);
    }, 100);
  }
}
