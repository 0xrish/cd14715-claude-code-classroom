---
description: Security-focused review guidance for identifying common vulnerabilities and insecure practices
---

# Security Analysis

Review code for security vulnerabilities, OWASP Top 10 risks, and secure coding practices.

## Vulnerability Checklist
- **Input Validation Failures**: Missing boundary checks, unvalidated user inputs, unbounded file uploads, path traversal (`../`).
- **Injection Risks**: SQL injection, command injection, NoSQL injection, and LDAP injection. Ensure parameterization and ORM safety.
- **Insecure Authentication/Authorization**: Insecure session management, missing role-based access checks, broken object-level authorization (BOLA/IDOR).
- **Hardcoded Secrets**: Embedded API keys, tokens, passwords, private certificates, or database credentials. Use environment variables and secret stores.
- **Unsafe Deserialization & Parsing**: Unsafe YAML/JSON/eval parsing, prototype pollution in JavaScript/TypeScript objects.
- **Cross-Site Scripting (XSS)**: Unsanitized user inputs rendered into DOM/HTML templates. Ensure proper escaping and Content Security Policy (CSP).
- **Data Exposure & Logging**: Logging sensitive data (PII, credit card info, passwords, tokens) into application logs or client-facing errors.
- **Dependency & Supply Chain Risks**: Insecure third-party packages, vulnerable dependencies.

## Severity Guidelines
- **critical**: Remote code execution, SQL/command injection, authentication bypass, exposed private keys
- **high**: XSS, privilege escalation, hardcoded API secrets, insecure direct object references
- **medium**: Missing CSRF tokens, excessive data exposure in API responses, insecure cryptographic defaults
- **low**: Missing security headers, verbose error messages, weak password policies
- **info**: General security hardening and defensive coding suggestions

## Output:
For each security finding provide:
1. Vulnerability title and CWE/OWASP classification
2. Location (file and line number)
3. Risk explanation (how an attacker could exploit it)
4. Concrete remediation code or configuration
5. Severity level
