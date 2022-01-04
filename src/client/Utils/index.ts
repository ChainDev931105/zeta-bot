import { URestAPI } from "./URestAPI";
import { UTimer } from "./UTimer";
import { UWebsocket } from "./UWebsocket";
import { UFile } from "./UFile";

export { 
    URestAPI, 
    UTimer, 
    UWebsocket,
    UFile
};

export function DateToStr(dt: Date, sFormat: string): string {
    const mp: Array<Array<string>> = [
        ["yyyy", dt.getFullYear().toString()],
        ["MM", (dt.getMonth() >= 9 ? '' : '0') + (dt.getMonth() + 1)],
        ["dd", (dt.getDate() > 9 ? '' : '0') + dt.getDate()],
        ["HH", (dt.getHours() > 9 ? '' : '0') + dt.getHours()],
        ["mm", (dt.getMinutes() > 9 ? '' : '0') + dt.getMinutes()],
        ["ss", (dt.getSeconds() > 9 ? '' : '0') + dt.getSeconds()],
        ["fff", (dt.getUTCMilliseconds() > 9 ? '' : '0') + (dt.getUTCMilliseconds() > 99 ? '' : '0') + dt.getUTCMilliseconds()]
    ];
    let sRlt: string = sFormat;
    mp.forEach(p => {
        sRlt = sRlt.replace(p[0], p[1]);
    });
    return sRlt;
};
