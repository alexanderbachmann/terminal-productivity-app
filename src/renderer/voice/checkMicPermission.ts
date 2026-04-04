export async function checkMicPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  try {
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
    return result.state as 'granted' | 'denied' | 'prompt'
  } catch {
    // Permissions API may not support microphone query in all contexts
    return 'prompt'
  }
}
