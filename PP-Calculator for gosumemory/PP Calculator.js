const { Beatmap, Calculator } = require("./node_modules/mamestagram-pp-js");
const path = require("node:path");
const WebSocket = require("./node_modules/ws");
const server = new WebSocket.Server({ port: 3000 });
const ws = new WebSocket(`ws://127.0.0.1:24050/ws`);

let dataobjectForJson;
let gosumemoryData = {};
let currentMode;
let isZeroToOneHundred = true;
let isplaying = false;
let istesting = false;
let isediting = false;

function Main() {
    return new Promise(async (resolve) => {
        try {
            let responsedata = gosumemoryData;
            let dataobject = {
                Hiterror: responsedata.gameplay.hits.hitErrorArray,
                UR: responsedata.gameplay.hits.unstableRate,
                beatmappath: path.join(
                    responsedata.settings.folders.songs,
                    responsedata.menu.bm.path.folder,
                    responsedata.menu.bm.path.file,
                ),
                mods: responsedata.menu.mods.num,
                modsarray: responsedata.menu.mods.str.match(/.{2}/g),
                playingMode: responsedata.gameplay.gameMode,
                menuMode: responsedata.menu.gameMode,
                folder: responsedata.settings.folders.songs,
                score: responsedata.gameplay.score,
                good: responsedata.gameplay.hits["300"],
                ok: responsedata.gameplay.hits["100"],
                bad: responsedata.gameplay.hits["50"],
                geki: responsedata.gameplay.hits.geki,
                katu: responsedata.gameplay.hits.katu,
                miss: responsedata.gameplay.hits["0"],
                combo: responsedata.gameplay.combo.max,

                status: responsedata.menu.state,
                resultGood: responsedata.resultsScreen["300"],
                resultOk: responsedata.resultsScreen["100"],
                resultBad: responsedata.resultsScreen["50"],
                resultGeki: responsedata.resultsScreen.geki,
                resultKatu: responsedata.resultsScreen.katu,
                resultMiss: responsedata.resultsScreen["0"],
                resultCombo: responsedata.resultsScreen.maxCombo,
                resultMods: responsedata.resultsScreen.mods.num,
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

            /**
                ステータスコードの一覧(※は使う物を示す)
                NotRunning = -1,
                ※ MainMenu = 0,
                ※ EditingMap = 1,
                ※ Playing = 2,
                GameShutdownAnimation = 3,
                ※ SongSelectEdit = 4,
                ※ SongSelect = 5,
                WIP_NoIdeaWhatThisIs = 6,
                ※ ResultsScreen = 7,
                GameStartupAnimation = 10,
                ※ MultiplayerRooms = 11,
                ※ MultiplayerRoom = 12,
                ※ MultiplayerSongSelect = 13,
                ※ MultiplayerResultsscreen = 14,
                OsuDirect = 15,
                RankingTagCoop = 17,
                RankingTeam = 18,
                ProcessingBeatmaps = 19,
                Tourney = 22
            */

            if (dataobject.status == 1 || dataobject.status == 4) {
                // マップ編集画面 = 1, 編集マップ選択画面 = 4 (テストプレイはelse内で処理)

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
                        sr: sr,
                        sspp: sspp,
                    };
                })();

                // 送信用データの作成
                dataobjectForJson = {
                    audio: {
                        fullPath: "",
                    },
                    background: {
                        fullPath: "",
                    },
                    keyOverlay: {
                        Enabled: true,
                        K1Pressed: responsedata.gameplay.keyOverlay.k1.isPressed,
                        K1Count: responsedata.gameplay.keyOverlay.k1.count,
                        K2Pressed: responsedata.gameplay.keyOverlay.k2.isPressed,
                        K2Count: responsedata.gameplay.keyOverlay.k2.count,
                        M1Pressed: responsedata.gameplay.keyOverlay.m1.isPressed,
                        M1Count: responsedata.gameplay.keyOverlay.m1.count,
                        M2Pressed: responsedata.gameplay.keyOverlay.m2.isPressed,
                        M2Count: responsedata.gameplay.keyOverlay.m2.count,
                    },
                    modsArray: responsedata.menu.mods.str.match(/.{2}/g),
                    username: "Unknown",
                    artistRoman: responsedata.menu.bm.metadata.artist,
                    artistUnicode: responsedata.menu.bm.metadata.artistOriginal,
                    titleRoman: responsedata.menu.bm.metadata.title,
                    titleUnicode: responsedata.menu.bm.metadata.titleOriginal,
                    c100: responsedata.gameplay.hits[100],
                    c50: responsedata.gameplay.hits[50],
                    miss: responsedata.gameplay.hits[0],
                    sliderBreaks: responsedata.gameplay.hits.sliderBreaks,
                    score: responsedata.gameplay.score,
                    acc: responsedata.gameplay.accuracy,
                    combo: responsedata.gameplay.combo.current,
                    ingameInterfaceIsEnabled:
                        responsedata.settings.showInterface,
                    convertedUnstableRate:
                        responsedata.gameplay.hits.unstableRate,
                    dir: responsedata.menu.bm.path.folder,
                    backgroundImageFileName: responsedata.menu.bm.path.bg,
                    skin: responsedata.settings.folders.skin,
                    currentBpm: responsedata.menu.bm.stats.BPM.max,
                    banchoId: 1,
                    grade: responsedata.gameplay.hits.grade.current,
                    playerHpSmooth: responsedata.gameplay.hp.smooth,
                    ppIfMapEndsNow: Math.round(Number(PP.sspp) * 100) / 100,
                    hitErrors: responsedata.gameplay.hits.hitErrorArray,
                    time: responsedata.menu.bm.time.current,
                    creator: responsedata.menu.bm.metadata.mapper,
                    diffName: responsedata.menu.bm.metadata.difficulty,
                    mode: responsedata.menu.gameMode,
                    starsNomod: responsedata.menu.bm.stats.fullSR,
                    totaltime: responsedata.menu.bm.time.full,
                    bpm: responsedata.menu.bm.stats.BPM.max,
                    cs: responsedata.menu.bm.stats.CS,
                    ar: responsedata.menu.bm.stats.AR,
                    od: responsedata.menu.bm.stats.OD,
                    hp: responsedata.menu.bm.stats.HP,
                    mBpm: responsedata.menu.bm.stats.BPM.max,
                    mCS: responsedata.menu.bm.stats.CS,
                    mAR: responsedata.menu.bm.stats.AR,
                    mOD: responsedata.menu.bm.stats.OD,
                    mHP: responsedata.menu.bm.stats.HP,
                    mods: responsedata.menu.mods.str,
                    mp3Name: responsedata.menu.bm.path.audio,
                    mStars: Math.round(Number(PP.sr) * 100) / 100,
                    liveStarRating: Math.round(Number(PP.sr) * 100) / 100,
                    rankedStatus: responsedata.menu.bm.rankedStatus,
                    rawStatus: responsedata.menu.state,
                    totalAudioTime: responsedata.menu.bm.time.full,
                    osuIsRunning: 1,
                };

                // メモリ解放
                PP = null;
                dataobject = null;
            } else if (dataobject.status == 7 && !isplaying) {
                // リザルト画面 = 7、プレイ直後のリザルトではなく、他人のリザルトを見ているときにフラグが立つ(isplayingは自分がプレイ中かどうかのフラグ)

                // PP、SRを計算し、PP変数に代入(即時関数を使用)
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
                        sr: sr,
                        pp: pp,
                    };
                })();

                // 送信用データの作成
                // 送信用データの作成
                dataobjectForJson = {
                    audio: {
                        fullPath: "",
                    },
                    background: {
                        fullPath: "",
                    },
                    keyOverlay: {
                        Enabled: true,
                        K1Pressed: responsedata.gameplay.keyOverlay.k1.isPressed,
                        K1Count: responsedata.gameplay.keyOverlay.k1.count,
                        K2Pressed: responsedata.gameplay.keyOverlay.k2.isPressed,
                        K2Count: responsedata.gameplay.keyOverlay.k2.count,
                        M1Pressed: responsedata.gameplay.keyOverlay.m1.isPressed,
                        M1Count: responsedata.gameplay.keyOverlay.m1.count,
                        M2Pressed: responsedata.ameplay.keyOverlay.m2.isPressed,
                        M2Count: responsedata.gameplay.keyOverlay.m2.count,
                    },
                    modsArray: responsedata.menu.mods.str.match(/.{2}/g),
                    username: "Unknown",
                    artistRoman: responsedata.menu.bm.metadata.artist,
                    artistUnicode: responsedata.menu.bm.metadata.artistOriginal,
                    titleRoman: responsedata.menu.bm.metadata.title,
                    titleUnicode: responsedata.menu.bm.metadata.titleOriginal,
                    c100: responsedata.gameplay.hits[100],
                    c50: responsedata.gameplay.hits[50],
                    miss: responsedata.gameplay.hits[0],
                    sliderBreaks: responsedata.gameplay.hits.sliderBreaks,
                    score: responsedata.gameplay.score,
                    acc: responsedata.gameplay.accuracy,
                    combo: responsedata.gameplay.combo.current,
                    ingameInterfaceIsEnabled:
                        responsedata.settings.showInterface,
                    convertedUnstableRate:
                        responsedata.gameplay.hits.unstableRate,
                    dir: responsedata.menu.bm.path.folder,
                    backgroundImageFileName: responsedata.menu.bm.path.bg,
                    skin: responsedata.settings.folders.skin,
                    currentBpm: responsedata.menu.bm.stats.BPM.max,
                    banchoId: 1,
                    grade: responsedata.gameplay.hits.grade.current,
                    playerHpSmooth: responsedata.gameplay.hp.smooth,
                    ppIfMapEndsNow: Math.round(Number(PP.pp) * 100) / 100,
                    hitErrors: responsedata.gameplay.hits.hitErrorArray,
                    time: responsedata.menu.bm.time.current,
                    creator: responsedata.menu.bm.metadata.mapper,
                    diffName: responsedata.menu.bm.metadata.difficulty,
                    mode: responsedata.menu.gameMode,
                    starsNomod: responsedata.menu.bm.stats.fullSR,
                    totaltime: responsedata.menu.bm.time.full,
                    bpm: responsedata.menu.bm.stats.BPM.max,
                    cs: responsedata.menu.bm.stats.CS,
                    ar: responsedata.menu.bm.stats.AR,
                    od: responsedata.menu.bm.stats.OD,
                    hp: responsedata.menu.bm.stats.HP,
                    mBpm: responsedata.menu.bm.stats.BPM.max,
                    mCS: responsedata.menu.bm.stats.CS,
                    mAR: responsedata.menu.bm.stats.AR,
                    mOD: responsedata.menu.bm.stats.OD,
                    mHP: responsedata.menu.bm.stats.HP,
                    mods: responsedata.menu.mods.str,
                    mp3Name: responsedata.menu.bm.path.audio,
                    mStars: Math.round(Number(PP.sr) * 100) / 100,
                    liveStarRating: Math.round(Number(PP.sr) * 100) / 100,
                    rankedStatus: responsedata.menu.bm.rankedStatus,
                    rawStatus: responsedata.menu.state,
                    totalAudioTime: responsedata.menu.bm.time.full,
                    osuIsRunning: 1,
                };

                // メモリ解放
                PP = null;
                dataobject = null;
            } else {
                // 上記以外の場合(プレイ中、プレイ直後のリザルト、マルチプレイなどが当てはまる。)

                // PP、SRを計算し、PP変数に代入(即時関数を使用)
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
                        case 0:
                            passedObjects =
                                dataobject.good +
                                dataobject.ok +
                                dataobject.bad +
                                dataobject.miss;
                            break;

                        case 1:
                            passedObjects =
                                dataobject.good +
                                dataobject.ok +
                                dataobject.miss;
                            break;

                        case 2:
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

                        default:
                            passedObjects =
                                dataobject.good +
                                dataobject.ok +
                                dataobject.bad +
                                dataobject.miss;
                            break;
                    }

                    const calc = new Calculator(score);
                    const calcforsspp = new Calculator(scoreforsspp);

                    let fullSR = calcforsspp.performance(map).difficulty.stars;
                    if (isNaN(fullSR)) fullSR = 0;

                    let sspp = calcforsspp.performance(map).pp;
                    if (isNaN(sspp)) sspp = 0;

                    let pp;
                    if (isZeroToOneHundred) {
                        pp =
                            dataobject.status == 0 ||
                            dataobject.status == 5 ||
                            dataobject.status == 11 ||
                            dataobject.status == 12 ||
                            dataobject.status == 13 ||
                            dataobject.status == 14
                                ? sspp
                                : calc
                                      .passedObjects(passedObjects)
                                      .performance(map).pp;
                    } else {
                        pp =
                            dataobject.status == 0 ||
                            dataobject.status == 5 ||
                            dataobject.status == 11 ||
                            dataobject.status == 12 ||
                            dataobject.status == 13 ||
                            dataobject.status == 14
                                ? sspp
                                : calc.performance(map).pp;
                    }
                    if (isNaN(pp)) pp = 0;

                    let sr =
                        dataobject.status == 0 ||
                        dataobject.status == 5 ||
                        dataobject.status == 11 ||
                        dataobject.status == 12 ||
                        dataobject.status == 13 ||
                        dataobject.status == 14 ||
                        istesting
                            ? fullSR
                            : calc.passedObjects(passedObjects).performance(map)
                                  .difficulty.stars;
                    if (
                        isNaN(sr) ||
                        (dataobject.status == 2 &&
                            passedObjects == 0 &&
                            !istesting)
                    )
                        sr = 0;

                    return {
                        fullSR: fullSR,
                        sr: sr,
                        sspp: sspp,
                        pp: pp,
                    };
                })();

                // 送信用データの作成
                dataobjectForJson = {
                    audio: {
                        fullPath: "",
                    },
                    background: {
                        fullPath: "",
                    },
                    keyOverlay: {
                        Enabled: true,
                        K1Pressed: responsedata.gameplay.keyOverlay.k1.isPressed,
                        K1Count: responsedata.gameplay.keyOverlay.k1.count,
                        K2Pressed: responsedata.gameplay.keyOverlay.k2.isPressed,
                        K2Count: responsedata.gameplay.keyOverlay.k2.count,
                        M1Pressed: responsedata.gameplay.keyOverlay.m1.isPressed,
                        M1Count: responsedata.gameplay.keyOverlay.m1.count,
                        M2Pressed: responsedata.gameplay.keyOverlay.m2.isPressed,
                        M2Count: responsedata.gameplay.keyOverlay.m2.count,
                    },
                    modsArray: responsedata.menu.mods.str.match(/.{2}/g),
                    username: "Unknown",
                    artistRoman: responsedata.menu.bm.metadata.artist,
                    artistUnicode: responsedata.menu.bm.metadata.artistOriginal,
                    titleRoman: responsedata.menu.bm.metadata.title,
                    titleUnicode: responsedata.menu.bm.metadata.titleOriginal,
                    c100: responsedata.gameplay.hits[100],
                    c50: responsedata.gameplay.hits[50],
                    miss: responsedata.gameplay.hits[0],
                    sliderBreaks: responsedata.gameplay.hits.sliderBreaks,
                    score: responsedata.gameplay.score,
                    acc: responsedata.gameplay.accuracy,
                    combo: responsedata.gameplay.combo.current,
                    ingameInterfaceIsEnabled:
                        responsedata.settings.showInterface,
                    convertedUnstableRate:
                        responsedata.gameplay.hits.unstableRate,
                    dir: responsedata.menu.bm.path.folder,
                    backgroundImageFileName: responsedata.menu.bm.path.bg,
                    skin: responsedata.settings.folders.skin,
                    currentBpm: responsedata.menu.bm.stats.BPM.max,
                    banchoId: 1,
                    grade: responsedata.gameplay.hits.grade.current,
                    playerHpSmooth: responsedata.gameplay.hp.smooth,
                    ppIfMapEndsNow: Math.round(Number(PP.pp) * 100) / 100,
                    hitErrors: responsedata.gameplay.hits.hitErrorArray,
                    time: responsedata.menu.bm.time.current,
                    creator: responsedata.menu.bm.metadata.mapper,
                    diffName: responsedata.menu.bm.metadata.difficulty,
                    mode: responsedata.menu.gameMode,
                    starsNomod: responsedata.menu.bm.stats.fullSR,
                    totaltime: responsedata.menu.bm.time.full,
                    bpm: responsedata.menu.bm.stats.BPM.max,
                    cs: responsedata.menu.bm.stats.CS,
                    ar: responsedata.menu.bm.stats.AR,
                    od: responsedata.menu.bm.stats.OD,
                    hp: responsedata.menu.bm.stats.HP,
                    mBpm: responsedata.menu.bm.stats.BPM.max,
                    mCS: responsedata.menu.bm.stats.CS,
                    mAR: responsedata.menu.bm.stats.AR,
                    mOD: responsedata.menu.bm.stats.OD,
                    mHP: responsedata.menu.bm.stats.HP,
                    mods: responsedata.menu.mods.str,
                    mp3Name: responsedata.menu.bm.path.audio,
                    mStars: Math.round(Number(PP.fullSR) * 100) / 100,
                    liveStarRating: Math.round(Number(PP.sr) * 100) / 100,
                    rankedStatus: responsedata.menu.bm.rankedStatus,
                    rawStatus: responsedata.menu.state,
                    totalAudioTime: responsedata.menu.bm.time.full,
                    osuIsRunning: 1,
                };

                // メモリ解放
                PP = null;
                dataobject = null;
                responsedata = null;
            }

            // 解決
            resolve();
        } catch (error) {
            // エラー時の処理。主にgosumemoryにアクセスできない(起動してない)時に発生する。

            // エラー時の送信用データの作成
            dataobjectForJson = {
                Error: {
                    Error: error.toString(),
                },
            };

            // 解決
            resolve();
        }
    });
}

(() => {
    setInterval(async () => {
        await Main();
    }, 50);
})();


server.on("connection", (socket) => {
    console.log("Client Connected");
    socket.on("message", () => {
        setInterval(async () => {
            socket.send(JSON.stringify(dataobjectForJson));
        }, 50);
    });
});

ws.onopen = () => console.log("Gosumemory Websocket Successfully Connected");
ws.onclose = (event) => console.log("Gosumemory Websocket Socket Closed Connection: ", event);
ws.onerror = (error) => console.log("Gosumemory WebsocketS Socket Error: ", error);
ws.onmessage = (wsEvent) => {
    try {
        Object.assign(gosumemoryData, JSON.parse(wsEvent.data));
    } catch (err) {
        console.log(err);
    }
};
