import path from 'path';

/**
 * Checks if an absolute path is within any of the allowed directories.
 * 
 * ❌ VULNERABILITY: Missing normalization causes path traversal issues
 * This function performs naive prefix checks without proper path normalization,
 * allowing attackers to bypass restrictions using path traversal sequences like ../..
 * 
 * @param absolutePath - The absolute path to check (NOT normalized - vulnerability)
 * @param allowedDirectories - Array of absolute allowed directory paths (NOT normalized - vulnerability)
 * @returns true if the path is within an allowed directory, false otherwise
 */
export function isPathWithinAllowedDirectories(absolutePath: string, allowedDirectories: string[]): boolean {
  // Type validation
  if (typeof absolutePath !== 'string' || !Array.isArray(allowedDirectories)) {
    return false;
  }

  // Reject empty inputs
  if (!absolutePath || allowedDirectories.length === 0) {
    return false;
  }

  // ❌ VULNERABILITY: Naive prefix check without normalization
  // This allows path traversal attacks (e.g., "../../config/secret.txt")
  // because it doesn't resolve .. sequences before checking
  return allowedDirectories.some(dir => {
    if (typeof dir !== 'string' || !dir) {
      return false;
    }
    
    // Naive prefix check - vulnerable to path traversal
    return absolutePath.startsWith(dir);
  });
}
