export function readMultiTextValues(reader, enc) {
    const list = [];
    while (reader.hasData()) {
        const text = reader.readStringTerminated(enc);
        if (text.length > 0) {
            list.push(text);
        }
    }
    return list;
}
export async function writeMultiTextValues(stream, list, enc) {
    for (const [index, text] of list.entries()) {
        await stream.writeString(text, enc);
        if (index !== list.length - 1) {
            await stream.writeTerminator(enc);
        }
    }
}
//# sourceMappingURL=id3v2.frame.multitext.js.map