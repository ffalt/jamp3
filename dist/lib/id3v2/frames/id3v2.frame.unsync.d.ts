export declare function removeUnsync(data: Buffer): Buffer;
export declare function removeUnsyncCounted(data: Buffer, amount: number): {
    data: Buffer;
    rawLength: number;
};
export declare function needsUnsync(data: Buffer): boolean;
export declare function applyUnsync(data: Buffer): Buffer;
