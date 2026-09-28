---
description: TypeScript-specific review guidance for type safety, API design, and maintainability
---

# TypeScript Patterns

Expert review guidance for TypeScript type safety, API design, and maintainability.

## Review Checklist
- **Unsafe any usage**: Avoid `any` type; use `unknown`, generics, or proper type unions
- **Missing return types on exported APIs**: Ensure explicit return types on exported functions and async functions (`Promise<T>`)
- **Weak discriminated unions**: Proper discriminant properties for state modeling and exhaustive checking
- **Nullable access risks**: Enforce strict null checks (handle `null` and `undefined`), avoid unsafe non-null assertions (`!`)
- **Overly broad object types**: Avoid loose object shapes; use structured interfaces, `Record<K, V>`, or utility types
- **Type assertions**: Avoid unsafe type assertions (`as Type`) without runtime validation
- **Immutability**: Use `const` assertions (`as const`) and `readonly` properties where mutation is unexpected

## Advanced Typing Patterns
- Discriminated unions for state modeling and event handlers
- Mapped types and conditional types for reusable abstractions
- Utility types (`Partial`, `Pick`, `Omit`, `Record`, `Extract`, `Exclude`)
- Generic constraints with `extends`
- Template literal types for string pattern matching

## Interfaces vs Type Aliases
- Use `interface` for object shapes that may be extended or merged
- Use `type` for unions, primitives, tuples, and complex mappings
- Maintain consistency within the codebase

## Common Pitfalls & Anti-Patterns
- Unsafe type assertions (`as Type` without runtime check)
- Non-null assertion operator (`!`) without guarantee
- Overly complex generic types that hurt compiler performance and readability
- Function overload signatures without a matching flexible implementation
- Enum gotchas (prefer const objects or string literal unions over numeric enums)

## Async & Promise Typing
- Ensure explicit return types on async functions (`Promise<T>`)
- Handle rejected Promise types appropriately

## Output:
For each issue provide:
1. Description of the type issue or pattern violation
2. Why it is problematic (type safety, maintainability, performance)
3. Fix with concrete TypeScript code example
4. Severity level (critical, high, medium, low, info)
