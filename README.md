# `appinfo.vdf` parser for Node.js
[![npm version](https://badge.fury.io/js/binary-vdf-2.svg)](https://badge.fury.io/js/binary-vdf-2)

Parses Steam's binary VDF format used in `appinfo.vdf` into a JSON object. This version supports versions of `appinfo.vdf` corresponding to the magic header being 27, 28, and 29 (the current version as of `July 2024`). For more details on the format of `appinfo.vdf` see [here](https://github.com/SteamDatabase/SteamAppInfo).

## Usage
```typescript
import {readBinaryVDF} from "binary-vdf-2";
import * as fs from "fs";
const stream = fs.createReadStream("appinfo.vdf");
const appinfo = await readBinaryVDF(stream);
```
