/**
 * Function to ask a question and return the user's input
 * parsed as 'string' or 'int'
 * @param {string} query - The question to display to the user
 * @param {'string'|'int'} type - The desired return type
 * @returns {Promise<string|number|null>}
 */
function askQuestion(rl, query, type = "string") {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      let result;
      if (type === "int") {
        const parsed = parseInt(answer, 10);
        result = isNaN(parsed) ? null : parsed;
      } else {
        result = answer;
      }
      resolve(result);
    });
  });
}

export default askQuestion;
