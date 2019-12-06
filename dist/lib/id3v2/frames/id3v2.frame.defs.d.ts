import { IID3V2 } from '../id3v2.types';
import { IFrameImpl } from './id3v2.frame';
export interface IFrameDef {
    title: string;
    impl: IFrameImpl;
    versions: Array<number>;
    upgrade?: string;
    upgradeValue?: (value: any) => IID3V2.FrameValue.Base | undefined;
}
export declare const FrameDefs: {
    [id: string]: IFrameDef;
};
