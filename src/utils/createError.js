function createError(functionName, message, originalError = null) {
  const error = new Error(`❌ [${functionName}] ${message}`);
  if (originalError) {
    error.stack += `\nCaused by: ${originalError.stack}`;
  }
  return error;
}

export default createError;
