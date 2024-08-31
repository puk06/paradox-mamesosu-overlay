const { Beatmap, Calculator } = require("./node_modules/mamestagram-pp-js");
const path = require("node:path");
const WebSocket = require("./node_modules/ws");
const server = new WebSocket.Server({ port: 3000 });
const ws = new WebSocket(`ws://127.0.0.1:24050/ws`);

const rawgosumemoryData = {
    audio: {
        fullPath: "",
    },
    background: {
        fullPath: "",
    },
    keyOverlay: {
        Enabled: true,
        K1Pressed: false,
        K1Count: 0,
        K2Pressed: false,
        K2Count: 0,
        M1Pressed: false,
        M1Count: 0,
        M2Pressed: false,
        M2Count: 0,
    },
    modsArray: [],
    username: "Unknown",
    artistRoman: "",
    artistUnicode: "",
    titleRoman: "",
    titleUnicode: "",
    c100: 0,
    c50: 0,
    miss: 0,
    sliderBreaks: 0,
    score: 0,
    acc: 0,
    combo: 0,
    ingameInterfaceIsEnabled: false,
    convertedUnstableRate: 0,
    dir: "",
    backgroundImageFileName: "",
    skin: "",
    currentBpm: 0,
    grade: "",
    playerHpSmooth: 0,
    hitErrors: [],
    time: 0,
    creator: "",
    diffName: "",
    mode: 0,
    starsNomod: 0,
    totaltime: 0,
    bpm: 0,
    cs: 0,
    ar: 0,
    od: 0,
    hp: 0,
    mBpm: 0,
    mCS: 0,
    mAR: 0,
    mOD: 0,
    mHP: 0,
    mods: "",
    mp3Name: 0,
    rankedStatus: 0,
    rawStatus: 0,
    totalAudioTime: 0,
    osuIsRunning: 1
};
const PPData = {
    mStars: 0,
    liveStarRating: 0,
    ppIfMapEndsNow: 0
};

let currentMode;
let isplaying = false;
let istesting = false;
let isediting = false;

function Main() {
    return new Promise(async (resolve) => {
        try {
            let dataobject = {
                beatmappath: path.join(
                    rawgosumemoryData.settings.folders.songs,
                    rawgosumemoryData.menu.bm.path.folder,
                    rawgosumemoryData.menu.bm.path.file,
                ),
                mods: rawgosumemoryData.menu.mods.num,
                playingMode: rawgosumemoryData.gameplay.gameMode,
                menuMode: rawgosumemoryData.menu.gameMode,
                score: rawgosumemoryData.gameplay.score,
                good: rawgosumemoryData.gameplay.hits["300"],
                ok: rawgosumemoryData.gameplay.hits["100"],
                bad: rawgosumemoryData.gameplay.hits["50"],
                geki: rawgosumemoryData.gameplay.hits.geki,
                katu: rawgosumemoryData.gameplay.hits.katu,
                miss: rawgosumemoryData.gameplay.hits["0"],
                combo: rawgosumemoryData.gameplay.combo.max,
                status: rawgosumemoryData.menu.state,
                resultGood: rawgosumemoryData.resultsScreen["300"],
                resultOk: rawgosumemoryData.resultsScreen["100"],
                resultBad: rawgosumemoryData.resultsScreen["50"],
                resultGeki: rawgosumemoryData.resultsScreen.geki,
                resultKatu: rawgosumemoryData.resultsScreen.katu,
                resultMiss: rawgosumemoryData.resultsScreen["0"],
                resultCombo: rawgosumemoryData.resultsScreen.maxCombo,
                resultMods: rawgosumemoryData.resultsScreen.mods.num,
            };

            switch (dataobject.status) {
                case 0:
                case 5:
                case 11:
                case 12:
                case 13:
                    currentMode = dataobject.menuMode;
                    isplaying = false;
                    istesting = false;
                    break;

                case 1:
                    isplaying = false;
                    isediting = true;
                    istesting = false;
                    break;

                case 2:
                    currentMode = dataobject.playingMode;
                    isplaying = true;
                    istesting = isediting;
                    break;

                case 4:
                    isplaying = false;
                    isediting = false;
                    istesting = false;
                    break;

                case 7:
                    isediting = false;
                    istesting = false;
                    break;

                case 14:
                    currentMode = dataobject.playingMode;
                    isplaying = false;
                    isediting = false;
                    istesting = false;
                    break;
            }

            if (dataobject.status == 1 || dataobject.status == 4) {
                let PP = (() => {
                    const map = new Beatmap({
                        path: dataobject.beatmappath,
                    });

                    const score = {
                        mode: mode,
                    };

                    const calc = new Calculator(score);
                    let sr = calc.performance(map).difficulty.stars;
                    if (isNaN(sr)) sr = 0;

                    let sspp = calc.performance(map).pp;
                    if (isNaN(sspp)) sspp = 0;

                    return {
                        fullsr: sr,
                        sr: sr,
                        sspp: sspp,
                    };
                })();

                Object.assign(PPData, {
                    mStars: PP.fullsr,
                    liveStarRating: PP.sr,
                    ppIfMapEndsNow: PP.sspp,
                });

                PP = null;
                dataobject = null;
            } else if (dataobject.status == 7 && !isplaying) {
                let PP = (() => {
                    const map = new Beatmap({
                        path: dataobject.beatmappath,
                    });

                    const score = {
                        mode: mode,
                        mods: dataobject.resultMods,
                        n300: dataobject.resultGood,
                        n100: dataobject.resultOk,
                        n50: dataobject.resultBad,
                        nMisses: dataobject.resultMiss,
                        nKatu: dataobject.resultKatu,
                        nGeki: dataobject.resultGeki,
                        combo: dataobject.resultCombo,
                    };

                    const calc = new Calculator(score);

                    let sr = calc.performance(map).difficulty.stars;
                    if (isNaN(sr)) sr = 0;

                    let pp = calc.performance(map).pp;
                    if (isNaN(pp)) pp = 0;

                    return {
                        fullsr: sr,
                        sr: sr,
                        pp: pp,
                    };
                })();

                Object.assign(PPData, {
                    mStars: PP.sr,
                    liveStarRating: PP.sr,
                    ppIfMapEndsNow: PP.pp,
                });

                PP = null;
                dataobject = null;
            } else {
                let PP = (() => {
                    const map = new Beatmap({
                        path: dataobject.beatmappath,
                    });

                    const score = {
                        mode: currentMode,
                        mods: dataobject.mods,
                        n300: dataobject.good,
                        n100: dataobject.ok,
                        n50: dataobject.bad,
                        nMisses: dataobject.miss,
                        nKatu: dataobject.katu,
                        nGeki: dataobject.geki,
                        combo: dataobject.combo,
                    };

                    const scoreforsspp = {
                        mode: currentMode,
                        mods: dataobject.mods,
                    };

                    let passedObjects;
                    switch (currentMode) {
                        case 1:
                            passedObjects =
                                dataobject.good +
                                dataobject.ok +
                                dataobject.miss;
                            break;

                        case 3:
                            passedObjects =
                                dataobject.geki +
                                dataobject.good +
                                dataobject.katu +
                                dataobject.ok +
                                dataobject.bad +
                                dataobject.miss;
                            break;

                        case 0:
                        case 2:
                        default:
                            passedObjects =
                                dataobject.good +
                                dataobject.ok +
                                dataobject.bad +
                                dataobject.miss;
                            break;
                    }

                    const calc = new Calculator(score).passedObjects(passedObjects).performance(map);
                    const calcss = new Calculator(scoreforsspp).performance(map).difficulty;

                    let pp = calc.pp;
                    if (isNaN(pp)) pp = 0;

                    let sr = calc.difficulty.stars;
                    if (isNaN(sr) ||(dataobject.status == 2 &&passedObjects == 0 &&!istesting)) sr = 0;
                        
                    let fullsr = calcss.stars;
                    if (isNaN(fullsr)) fullsr = 0;

                    return {
                        fullsr: fullsr,
                        sr: sr,
                        pp: pp,
                    };
                })();

                Object.assign(PPData, {
                    mStars: PP.fullsr,
                    liveStarRating: PP.sr,
                    ppIfMapEndsNow: PP.pp,
                });

                PP = null;
                dataobject = null;
            }

            resolve();
        } catch (error) {
            resolve();
        }
    });
}

(() => {
    setInterval(async () => {
        await Main();
    }, 20);
})();


server.on("connection", (socket) => {
    console.log("Client Connected");
    socket.on("message", () => {
        setInterval(() => {
            const Data = convertGosumemoryDataForm(rawgosumemoryData);
            const gosumemoryData = Object.assign(Data, PPData);
            
            if (gosumemoryData.grade == "") {
                if (gosumemoryData.modsArray.includes("HD") || gosumemoryData.modsArray.includes("FL")) {
                    gosumemoryData.grade = "SSH";
                } else {
                    gosumemoryData.grade = "SS";
                }
            }

            if (gosumemoryData.modsArray.includes("DT") || gosumemoryData.modsArray.includes("NC")) {
                gosumemoryData.bpm *= 1.5;
                gosumemoryData.mBpm *= 1.5;
            }
            
            socket.send(JSON.stringify(gosumemoryData));
        }, 10);
    });
});

ws.onopen = () => console.log("Gosumemory Websocket Successfully Connected");
ws.onclose = (event) => console.log("Gosumemory Websocket Socket Closed Connection: ", event);
ws.onerror = (error) => console.log("Gosumemory WebsocketS Socket Error: ", error);
ws.onmessage = (wsEvent) => {
    try {
        const data = JSON.parse(wsEvent.data);
        Object.assign(rawgosumemoryData, data);
    } catch (err) {
        console.log(err);
    }
};

function convertGosumemoryDataForm(data) {
    return {
        audio: {
            fullPath: "",
        },
        background: {
            fullPath: "",
        },
        keyOverlay: {
            Enabled: true,
            K1Pressed: data.gameplay.keyOverlay.k1.isPressed,
            K1Count: data.gameplay.keyOverlay.k1.count,
            K2Pressed: data.gameplay.keyOverlay.k2.isPressed,
            K2Count: data.gameplay.keyOverlay.k2.count,
            M1Pressed: data.gameplay.keyOverlay.m1.isPressed,
            M1Count: data.gameplay.keyOverlay.m1.count,
            M2Pressed: data.gameplay.keyOverlay.m2.isPressed,
            M2Count: data.gameplay.keyOverlay.m2.count,
        },
        modsArray: data.menu.mods.str.match(/.{2}/g),
        username: "Unknown",
        artistRoman: data.menu.bm.metadata.artist,
        artistUnicode: data.menu.bm.metadata.artistOriginal,
        titleRoman: data.menu.bm.metadata.title,
        titleUnicode: data.menu.bm.metadata.titleOriginal,
        c100: data.gameplay.hits[100],
        c50: data.gameplay.hits[50],
        miss: data.gameplay.hits[0],
        sliderBreaks: data.gameplay.hits.sliderBreaks,
        score: data.gameplay.score,
        acc: data.gameplay.accuracy,
        combo: data.gameplay.combo.current,
        ingameInterfaceIsEnabled: data.settings.showInterface,
        convertedUnstableRate: data.gameplay.hits.unstableRate,
        dir: data.menu.bm.path.folder,
        backgroundImageFileName: data.menu.bm.path.bg,
        skin: data.settings.folders.skin,
        currentBpm: data.menu.bm.stats.BPM.max,
        banchoId: 1,
        grade: data.gameplay.hits.grade.current,
        playerHpSmooth: data.gameplay.hp.smooth,
        hitErrors: data.gameplay.hits.hitErrorArray,
        time: data.menu.bm.time.current,
        creator: data.menu.bm.metadata.mapper,
        diffName: data.menu.bm.metadata.difficulty,
        mode: data.menu.gameMode,
        starsNomod: data.menu.bm.stats.fullSR,
        totaltime: data.menu.bm.time.mp3,
        bpm: data.menu.bm.stats.BPM.max,
        cs: data.menu.bm.stats.CS,
        ar: data.menu.bm.stats.AR,
        od: data.menu.bm.stats.OD,
        hp: data.menu.bm.stats.HP,
        mBpm: data.menu.bm.stats.BPM.max,
        mCS: data.menu.bm.stats.CS,
        mAR: data.menu.bm.stats.AR,
        mOD: data.menu.bm.stats.OD,
        mHP: data.menu.bm.stats.HP,
        mods: data.menu.mods.str,
        mp3Name: data.menu.bm.path.audio,
        rankedStatus: data.menu.bm.rankedStatus,
        rawStatus: data.menu.state,
        totalAudioTime: data.menu.bm.time.mp3,
        osuIsRunning: 1,
    };
}
