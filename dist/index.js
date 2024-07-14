"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readBinaryVDF = void 0;
const binutils64_1 = require("binutils64");
const magic27 = 0x07564427;
const magic28 = 0x07564428;
const magic29 = 0x07564429;
// Pretty print number in hexadecimal
const hexify = (n, d = 8) => {
    return "0x" + ("0".repeat(d) + n.toString(16).toUpperCase()).slice(-d);
};
// Read entire stream into a buffer
const readIntoBuf = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => {
            chunks.push(Buffer.from(chunk));
        });
        stream.on("error", (err) => {
            reject(err);
        });
        stream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
    });
};
// Read a null terminated string in utf8
const readNullTerminatedString = (binaryReader) => {
    const bufferArray = [];
    while (true) {
        let b = binaryReader.ReadBytes(1);
        if (b.readUInt8() == 0) {
            break;
        }
        bufferArray.push(b);
    }
    return Buffer.concat(bufferArray).toString('utf8');
};
// Deserialize a single data entry
const readEntry = (binaryReader, stringPool, type, magic) => {
    let key;
    if ([magic27, magic28].includes(magic)) {
        key = readNullTerminatedString(binaryReader);
    }
    else {
        const index = binaryReader.ReadUInt32();
        key = stringPool[index];
    }
    switch (type) {
        case 0x00: // nested entry
            return [key, deserialize(binaryReader, stringPool, magic)];
        case 0x01: // string
            return [key, readNullTerminatedString(binaryReader)];
        case 0x02: // number
            return [key, binaryReader.ReadUInt32()];
        default:
            throw new Error(`Unknown entry type: ${hexify(type)}`);
    }
};
// Deserialize all data entries
const deserialize = (binaryReader, stringPool, magic) => {
    const entries = {};
    while (true) {
        const type = binaryReader.ReadUInt8();
        if (type == 0x08) { // entries list terminator
            break;
        }
        let [key, val] = readEntry(binaryReader, stringPool, type, magic);
        entries[key] = val;
    }
    return entries;
};
// Read BVDF format into a json object
const readBinaryVDF = async (stream) => {
    const originalBuffer = await readIntoBuf(stream);
    const binaryReader = new binutils64_1.BinaryReader(originalBuffer, "little");
    const magic = binaryReader.ReadUInt32();
    if (![magic27, magic28, magic29].includes(magic)) {
        throw new Error(`Unknown magic header: ${hexify(magic)}`);
    }
    const universe = binaryReader.ReadUInt32();
    const stringPool = [];
    if (magic == magic29) {
        const stringTableOffset = binaryReader.ReadInt64();
        const oldPos = binaryReader.Position;
        const oldBuffer = Buffer.from(binaryReader.ByteBuffer);
        binaryReader.Position = stringTableOffset;
        binaryReader.ByteBuffer = originalBuffer.subarray(stringTableOffset);
        const stringCount = binaryReader.ReadUInt32();
        for (let i = 0; i < stringCount; i++) {
            stringPool.push(readNullTerminatedString(binaryReader));
        }
        binaryReader.Position = oldPos;
        binaryReader.ByteBuffer = oldBuffer;
    }
    const appinfos = [];
    while (true) {
        const appid = binaryReader.ReadUInt32();
        if (appid == 0) {
            break;
        }
        const size = binaryReader.ReadUInt32();
        const end = binaryReader.Position + size;
        let app = {
            appid: appid,
            infoState: binaryReader.ReadUInt32(),
            lastUpdated: new Date(binaryReader.ReadUInt32()),
            token: binaryReader.ReadUInt64(),
            hash: binaryReader.ReadBytes(20),
            changeNumber: binaryReader.ReadUInt32()
        };
        if ([magic28, magic29].includes(magic)) {
            app.binaryDataHash = binaryReader.ReadBytes(20);
        }
        appinfos.push(deserialize(binaryReader, stringPool, magic));
        if (binaryReader.Position !== end) {
            throw new Error(`Expected ${hexify(end)} byte offset, but got ${hexify(binaryReader.Position)}`);
        }
    }
    return appinfos;
};
exports.readBinaryVDF = readBinaryVDF;
