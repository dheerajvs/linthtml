/*
 * Some options are used directly by the linter and do not control any
 * rules. Since we still want to process the values for these options
 * and generate documentation for them, we use a dummy rule which is
 * never called to contain them. It will be imported with the other
 * rules.
 */
const { stringOrRegexp } = require("../validate_option");

module.exports = {
  name: "free-options",
  options: [
    {
      name: "maxerr",
      desc: [
        "A nonnegative integer, or `false`. If it is a positive integer, limit",
        "output to at most that many issues."
      ].join("\n"),
      validateConfig(option) {
        if (typeof option !== "number") {
          throw new Error(`Configuration for rule "${this.name}" is invalid: Expected number got ${typeof option}`);
        }
        if (option < 0) {
          throw new Error(`Configuration for rule "${this.name}" is invalid: Only positive numbers are allowed.`);
        }
        return option;
      }
    },
    {
      name: "raw-ignore-regex",
      desc: [
        "A string giving a regular expression, a RegExp object, or `false`. If",
        "set, text matching the given regular expression is removed before any",
        "parsing or linting occurs.",
        "This option cannot be configured in-line, but it can be set to a value",
        "such as `/\\<\\!-- linthtml ignore --\\>[^]*?\\<\\!-- linthtml unignore --\\>/`",
        "to allow some control using comment tags."
      ].join("\n"),
      validateConfig: stringOrRegexp
    }
  ]
};

module.exports.options.forEach(function(option) {
  option.rules = [];
});
