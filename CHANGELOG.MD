# Changelog

## v0.2.1

* [FIX] Add missing `await` preventing the display of lint errors

## v0.2.0

* [REMOVED] Support for node@6
* [REMOVED] Removed rule `spec-char-escape`. You cannot escape characters with `\` in HTML text.
* [REMOVED] Stop reporting issues for invalid rule config
* [REMOVED] Stop reporting issues for nonexisting rule

* [IMPROVEMENT] Throw an error for nonexisting rule and stop the cli.
* [IMPROVEMENT] Throw an error for invalid rules config and stop the cli.
* [IMPROVEMENT] Now `indent-style` and `indent-width` catch more errors than before. Checkout [rules](./lib/rules/indent-style/README.md) doc for more information about valid/invalid patterns.
* [IMPROVEMENT] Rule `tag-req-attr`, report an error per missing attributs and list missing attributes in error messages.
* [IMPROVEMENT] Rule `title-no-dup`, report an error per duplicated `<title>` tag.

* [REFACTOR] Move rules's tests inside rule folder
* [REFACTOR] Remove `strict` option for rule `label-req-for` due to the lack of documentations and tests.

* [FIX] Make `+0` option for rule `attr-new-line` behave has explained in the rule's description
* [FIX] Correct `input-req-label` rule and now report errors even when `for` value match inputs's `name` attribute. (`for` should be paired with `id` as specified in [HTML specs](https://www.w3.org/TR/html52/sec-forms.html#element-attrdef-label-for))

## v0.1.8

* [FIX] Correct tarball generation

## v0.1.7

* [BUILD] Security upgrade for dependencies

## v0.1.3

* [FIX] #14 correct doc replace `.htmllintrc` with `.linthtmlrc`
* [FIX] #13 Fix import of `checkInvalidCliOptions`

## v0.1.2

* [FIX] Display an error when the CLI is called with the `--config` option and no path

## v0.1.1

* [FIX] Move "cosmiconfig" from devDependencies to dependencies

## v0.1.0 [First release]

* Integrated command line tool
* 55 [Rules](./docs/rules)
