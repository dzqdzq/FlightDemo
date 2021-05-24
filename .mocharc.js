'use strict';

// This is a JavaScript-based config file containing every Mocha option plus others.
// If you need conditional logic, you might want to use this type of config.
// Otherwise, JSON or YAML is recommended.

module.exports = {
  'allow-uncaught': false,
  'async-only': false,
  bail: false,
  'check-leaks': false,
  color: true,
  delay: false,
  diff: true,
  exit: false, // could be expressed as "'no-exit': true"
  extension: ['js'],
  // fgrep: something, // fgrep and grep are mutually exclusive
  // file: [], // 如果为空数组，那么会默认加上点， 也就是当前工程， 也就是会执行 package.json里的main配置
  'forbid-only': false,
  'forbid-pending': false,
  'full-trace': false,
  global: ['$'],
  // grep: something, // fgrep and grep are mutually exclusive
  growl: false,
  ignore: [],
  'inline-diffs': false,
  // invert: false, // needs to be used with grep or fgrep
  jobs: 1,
  // package: './package.json',
  parallel: false,
  recursive: false,
  reporter: 'spec',
  'reporter-option': ['foo=bar', 'baz=quux'],
  // require: '@babel/register',
  retries: 1,
  slow: '75',
  sort: false,
  spec: ['test/**/*.spec.ts'], // the positional arguments!
  timeout: '5000', // same as "timeout: '2s'"
  // timeout: false, // same as "'no-timeout': true" or "timeout: 0"
  'trace-warnings': true, // node flags ok
  ui: 'bdd',
  'v8-stack-trace-limit': 100, // V8 flags are prepended with "v8-"
  watch: false,
  'watch-files': ['dist/test/**/*.js'],
  'watch-ignore': ['lib/vendor']
};
