#!/usr/bin/env node

const {readAppInfo} = require('.')

readAppInfo(process.stdin)
  .then(entries => console.log(JSON.stringify(entries, null, 2)))
  .catch(err => console.error(err))
