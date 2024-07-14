# `appinfo.vdf` Parser for Node.js

Parses Steam's `appinfo.vdf` file for your pleasure. Either use `dump.js` to
dump stdin as a formatted JSON string or use the `readAppInfo` function from
`index.js` to read it programmatically. It takes a `Readable` (which it will
read into a Buffer) and produces a Promise which should resolve to a nice list
of app entries along with their respective key-values.

This version has been updated to support Steam's new format (as of July 2024) for appinfo.vdf. It still supports the old format as well, thanks to the "magic header" determining whether the file is in the new format or the old format. For more details on the format of `appinfo.vdf` see [here](https://github.com/SteamDatabase/SteamAppInfo).
