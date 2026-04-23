const RULES = [
  {
    pattern: /\/etc\/shadow|\/etc\/passwd|id_rsa|authorized_keys|wp-config\.php/i,
    severity: "CRITICAL",
    reason: "Sensitive credential or secret file access",
  },
  {
    pattern: /\bnc\b|\bnetcat\b|socat|telnet\s+/i,
    severity: "CRITICAL",
    reason: "Possible reverse shell or remote tunnel activity",
  },
  {
    pattern: /python\s+-c|python3\s+-c|perl\s+-e|php\s+-r|ruby\s+-e/i,
    severity: "CRITICAL",
    reason: "Inline code execution attempt",
  },
  {
    pattern: /\/bin\/bash|\/bin\/sh|bash\s+-i|sh\s+-i/i,
    severity: "CRITICAL",
    reason: "Interactive shell execution attempt",
  },
  {
    pattern: /chmod\s+\+x|curl\s+.*\|\s*sh|wget\s+.*\|\s*sh/i,
    severity: "CRITICAL",
    reason: "Likely payload execution chain",
  },
  {
    pattern: /\bwget\b|\bcurl\b/i,
    severity: "HIGH",
    reason: "Possible external payload download",
  },
  {
    pattern: /\bsudo\s+su\b|\bsu\b|\bsudo\b/i,
    severity: "HIGH",
    reason: "Privilege escalation attempt",
  },
  {
    pattern: /\buseradd\b|\badduser\b|\bpasswd\b/i,
    severity: "HIGH",
    reason: "Account manipulation attempt",
  },
  {
    pattern: /\bchmod\b|\bchown\b|\bmv\b|\bcp\b/i,
    severity: "MEDIUM",
    reason: "System or file modification activity",
  },
  {
    pattern: /\bfind\b|\bcat\b|\bless\b|\bhead\b|\btail\b/i,
    severity: "MEDIUM",
    reason: "File discovery or inspection activity",
  },
  {
    pattern: /\bwhoami\b|\bid\b|\buname\b|\bps\b|\bls\b|\bpwd\b|\bhostname\b/i,
    severity: "LOW",
    reason: "Basic reconnaissance command",
  },
];

export function analyzeCommand(commandText) {
  const command = String(commandText || "").trim();

  if (!command) {
    return {
      severity: "NONE",
      reason: "No command",
      matched: false,
    };
  }

  for (const rule of RULES) {
    if (rule.pattern.test(command)) {
      return {
        severity: rule.severity,
        reason: rule.reason,
        matched: true,
      };
    }
  }

  return {
    severity: "NONE",
    reason: "No known threat pattern matched",
    matched: false,
  };
}

export function getSessionRiskSummary(commands = []) {
  const counts = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    NONE: 0,
  };

  for (const cmd of commands) {
    const result = analyzeCommand(cmd.command);
    counts[result.severity] += 1;
  }

  let overall = "NONE";
  if (counts.CRITICAL > 0) overall = "CRITICAL";
  else if (counts.HIGH > 0) overall = "HIGH";
  else if (counts.MEDIUM > 0) overall = "MEDIUM";
  else if (counts.LOW > 0) overall = "LOW";

  return {
    overall,
    counts,
    total:
      counts.CRITICAL +
      counts.HIGH +
      counts.MEDIUM +
      counts.LOW +
      counts.NONE,
  };
}
