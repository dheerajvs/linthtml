const Issue = require("../../issue");

module.exports = {
  name: "doctype-html5",
  on: ["dom"],
  filter: ["directive"],
  desc: "If set, the doctype element must specify html5."
};

module.exports.lint = function(ele/*, opts*/) {
  // NOTE: this does not support legacy strings or obsolete permitted doctypes
  const doctype = /^!DOCTYPE[ \t\n\f]+html[ \t\n\f]*$/i;
  const name = /!doctype/i;

  return name.test(ele.name) && !(ele.data && doctype.test(ele.data))
    ? new Issue("E008", ele.lineCol)
    : [];
};
