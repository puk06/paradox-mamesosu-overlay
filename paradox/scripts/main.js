let firstLoadOverlay = true;

let ws = new WebSocket(
    `ws://${hostname}:${port}/tokens?LiveTokens&updatesPerSecond=20`,
);

ws.onopen = () => {
    console.log("Successfully Connected");
    ws.send(JSON.stringify(requestList));
};

ws.onclose = (event) => console.log("Socket Closed Connection: ", event);

ws.onerror = (error) => console.log("Socket Error: ", error);

ws.onmessage = (wsEvent) => {
    try {
        /*receive*/
        Object.assign(tokenValue, JSON.parse(wsEvent.data));

        if (firstLoadOverlay) reloadUserData();

        tokenValue.audio.fullPath = encodeURIComponent(
            `${tokenValue.dir}/${tokenValue.mp3Name}`,
        );
        tokenValue.background.fullPath = encodeURIComponent(
            `${tokenValue.dir}/${tokenValue.backgroundImageFileName}`,
        );

        /*time*/
        cache.time = tokenValue.time;

        Object.assign(tokenValue, JSON.parse(tokenValue.keyOverlay));
        if (saved.enableHpBar === true && tokenValue.rawStatus === 2) {
            document.documentElement.style.setProperty(
                "--playerhp",
                `${(tokenValue.playerHpSmooth ** 2 / 400).toFixed(2) - 1}%`,
            );
        } else {
            document.documentElement.style.setProperty("--playerhp", `0%`);
        }

        /*status*/
        if (cache.rawStatus !== tokenValue.rawStatus) {
            if (tokenValue.rawStatus !== 2) {
                background.classList = dimClass;
                hideElement([
                    visualizer,
                    mods,
                    gameOverlay,
                    grade,
                    pp,
                    document.getElementById("progress"),
                    document.getElementById("uihide"),
                ]);
            }

            if (tokenValue.rawStatus !== 2 && tokenValue.rawStatus !== 7) {
                if (
                    saved.enableHideInterface === true ||
                    tokenValue.rawStatus === 1
                ) {
                    interfaceHide();
                } else {
                    interfaceShow();
                }
                setTimeout(() => {
                    reloadUserData();
                }, 100);
            }

            if (tokenValue.rawStatus === 7) {
                setTimeout(() => {
                    reloadUserData(tokenValue.username);
                    interfaceShow();
                }, 100);
            }

            if (tokenValue.rawStatus === 2) {
                settingHide();
                interfaceShow();
                panelImage.src = currentBG.src;
                profileDetail.style.height = "100px";
                background.classList = "";
                showElement([
                    visualizer,
                    mods,
                    grade,
                    pp,
                    gameOverlay,
                    document.getElementById("progress"),
                    document.getElementById("uihide"),
                ]);
                hideElement([
                    avatar,
                    document.getElementById("paddingleft"),
                    document.getElementById("paddingright"),
                ]);

                if (keyOverlayRunning === false) {
                    drawKeyOverlay();
                }

                if (timingBarRunning === false) {
                    drawTimingBar();
                }

                setTimeout(() => {
                    cache.rawStatus = tokenValue.rawStatus;
                    document.documentElement.style.setProperty(
                        "--scoresize",
                        "0.75rem",
                    );
                    showElement([
                        document.getElementById("paddingleft"),
                        document.getElementById("paddingright"),
                    ]);
                    mods.style.right = box1.scrollWidth + 20 + "px";

                    let unstableRateValue = tokenValue.convertedUnstableRate;
                    const modsApplied = cache.mods.split(",");

                    if (
                        modsApplied.includes("DT") ||
                        modsApplied.includes("NC") ||
                        modsApplied.includes("Double Time") ||
                        modsApplied.includes("Nightcore")
                    ) {
                        unstableRateValue *= 1.5;
                        unstableRateValue = `${unstableRateValue.toFixed(2)} (${tokenValue.convertedUnstableRate.toFixed(2)})`;
                    } else {
                        unstableRateValue = unstableRateValue.toFixed(2);
                    }

                    unstableRate.innerHTML = unstableRate;
                    item1.innerHTML = `<span id="score">${addCommasToNumber(tokenValue.score)}</span>`;
                    item2.innerHTML = "";
                    item3.innerHTML = `<span id="acc">${tokenValue.acc.toFixed(2)}<span class="colored margin">%</span></span>`;
                    item4.innerHTML = `<span id="pp">${addCommasToNumber(Math.round(tokenValue.ppIfMapEndsNow))}<span class="colored margin">pp</span></span>`;
                    box1.innerHTML = `<span class="green">100:&nbsp;&nbsp;</span>${tokenValue.c100}`;
                    box2.innerHTML = `<span class="skyblue">50:&nbsp;&nbsp;</span>${tokenValue.c50}`;
                    box3.innerHTML = `<span class="yellow">SB:&nbsp;&nbsp;</span>${tokenValue.sliderBreaks}`;
                    box4.innerHTML = `<span class="red">miss:&nbsp;&nbsp;</span>${tokenValue.miss}`;
                    adjustFontSize(0.75);
                    isPlaying = true;
                }, 250);
            }
            cache.rawStatus = tokenValue.rawStatus;
        }

        /*pp*/
        if (isPlaying === true) {
            mods.style.right = box1.scrollWidth + 20 + "px";

            let unstableRateValue = tokenValue.convertedUnstableRate;
            const modsApplied = cache.mods.split(",");

            if (
                modsApplied.includes("DT") ||
                modsApplied.includes("NC") ||
                modsApplied.includes("Double Time") ||
                modsApplied.includes("Nightcore")
            ) {
                unstableRateValue *= 1.5;
                unstableRateValue = `${unstableRateValue.toFixed(2)} (${tokenValue.convertedUnstableRate.toFixed(2)})`;
            } else {
                unstableRateValue = unstableRateValue.toFixed(2);
            }

            unstableRate.innerHTML = unstableRateValue;
            item1.innerHTML = `<span id="score">${addCommasToNumber(tokenValue.score)}</span>`;
            item2.innerHTML = "";
            item3.innerHTML = `<span id="acc">${tokenValue.acc.toFixed(2)}<span class="colored hilight margin">%</span></span>`;
            item4.innerHTML = `<span id="pp">${addCommasToNumber(Math.round(tokenValue.ppIfMapEndsNow))}<span class="colored hilight margin">pp</span></span>`;
            box1.innerHTML = `<span class="green">100:&nbsp;&nbsp;</span>${tokenValue.c100}`;
            box2.innerHTML = `<span class="skyblue">50:&nbsp;&nbsp;</span>${tokenValue.c50}`;
            box3.innerHTML = `<span class="yellow">SB:&nbsp;&nbsp;</span>${tokenValue.sliderBreaks}`;
            box4.innerHTML = `<span class="red">miss:&nbsp;&nbsp;</span>${tokenValue.miss}`;
            adjustFontSize(0.75);
            drawClock(clock, ctx_clock);
            if (
                cache.combo !== tokenValue.combo &&
                cache.ingameInterfaceIsEnabled == 0
            ) {
                cache.combo = tokenValue.combo;
                if (tokenValue.combo !== 0) {
                    combo.innerHTML = comboflash.innerHTML =
                        tokenValue.combo +
                        '<span class="colored margin nonwidth">x</span>';
                    combo.style.transition = "all 0s";
                    combo.style.fontSize = "1.5rem";
                    comboflash.style.transition = "all 0s";
                    comboflash.style.opacity = 0.3;
                    comboflash.style.fontSize = "2.2rem";
                    comboflash.style.margin = "0px 0px -5px -5px";
                    setTimeout(() => {
                        combo.style.transition =
                            "all 1s cubic-bezier(0.16, 1, 0.3, 1)";
                        combo.style.fontSize = "1.3rem";
                        comboflash.style.transition =
                            "all 1s cubic-bezier(0.16, 1, 0.3, 1)";
                        comboflash.style.opacity = 0.2;
                        comboflash.style.fontSize = "1.3rem";
                        comboflash.style.margin = "0px";
                    }, 10);
                } else {
                    combo.innerHTML = comboflash.innerHTML = "";
                }
            }

            const liveStarsParts = tokenValue.liveStarRating
                .toFixed(2)
                .split(".");
            const liveStarsInteger = liveStarsParts[0];
            const liveStarsDecimal = liveStarsParts[1];
            SR.innerHTML = `${liveStarsInteger}<span id="dot">.</span><span id="srdecimal">${liveStarsDecimal}</span>`;

            const liveStarsValue = Math.round(
                tokenValue.liveStarRating * 100
            ) / 100;

            for (const { threshold, mdiffcolor, mtextcolor } of SRColors) {
                if (liveStarsValue >= threshold) {
                    document.documentElement.style.setProperty(
                        "--mdiffcolor",
                        mdiffcolor,
                    );
                    document.documentElement.style.setProperty(
                        "--mtextcolor",
                        mtextcolor,
                    );
                    break;
                }
            }
        } else {
            const mStarsParts = tokenValue.mStars.toFixed(2).split(".");
            const mStarsInteger = mStarsParts[0];
            const mStarsDecimal = mStarsParts[1];

            SR.innerHTML = `${mStarsInteger}<span id="dot">.</span><span id="srdecimal">${mStarsDecimal}</span>`;
            const mStarsValue = Math.round(
                tokenValue.mStars * 100
            ) / 100;

            for (const {
                threshold,
                mdiffcolor,
                mtextcolor,
            } of SRColors) {
                if (mStarsValue >= threshold) {
                    document.documentElement.style.setProperty(
                        "--mdiffcolor",
                        mdiffcolor,
                    );
                    document.documentElement.style.setProperty(
                        "--mtextcolor",
                        mtextcolor,
                    );
                    break;
                }
            }
        }

        /*bpm*/
        if (cache.currentBpm !== tokenValue.currentBpm) {
            if (cache.currentBpm > tokenValue.currentBpm) {
                cache.currentBpm = tokenValue.currentBpm;
                Bpm.classList = "slotdown";
                setTimeout(() => {
                    Bpm.innerHTML = Math.round(cache.currentBpm);
                    setTimeout(() => {
                        Bpm.classList = "";
                    }, 250);
                }, 250);
            } else {
                cache.currentBpm = tokenValue.currentBpm;
                Bpm.classList = "slotup";
                setTimeout(() => {
                    Bpm.innerHTML = Math.round(cache.currentBpm);
                    setTimeout(() => {
                        Bpm.classList = "";
                    }, 250);
                }, 250);
            }

            currentBpm.innerHTML = Math.round(cache.currentBpm);

            if (
                tokenValue.currentBpm !== 0 &&
                tokenValue.rawStatus === 2 &&
                saved.enableNotifyBpmChanges
            ) {
                currentBpm.style.transition = "all 0s";
                currentBpm.style.opacity = 0.15;
                setTimeout(() => {
                    currentBpm.style.transition =
                        "all 3s cubic-bezier(0.16, 1, 0.3, 1)";
                    currentBpm.style.opacity = 0;
                }, 10);
            }
        }

        /*grade*/
        if (cache.grade !== tokenValue.grade) {
            if (tokenValue.rawStatus === 2) {
                cache.grade = tokenValue.grade;
                grade.style.opacity = 1;
                grade.src = gradeImgs[tokenValue.grade];
            } else {
                grade.style.opacity = 0;
            }
        }

        if (
            cache.ingameInterfaceIsEnabled !==
            tokenValue.ingameInterfaceIsEnabled
        ) {
            cache.ingameInterfaceIsEnabled =
                tokenValue.ingameInterfaceIsEnabled;
            combo.style.opacity = cache.ingameInterfaceIsEnabled == 0 ? 1 : 0;
        }

        /*artist*/
        if (cache.artistRoman !== tokenValue.artistRoman) {
            cache.artistRoman = tokenValue.artistRoman;
            artistcontainer.style.transition = "all 0.2s";
            artistcontainer.style.opacity = 0;
            setTimeout(() => {
                artist.innerHTML = checkUndefined(cache.artistRoman);
                const artistwidth = artist.getBoundingClientRect().width;
                setTimeout(() => {
                    if (artistwidth > 520) {
                        artist.style.transition = "all 0.5s";
                        artistcontainer.style.opacity = 1;
                        artist.style.paddingLeft = "0px";
                        artist.innerHTML =
                            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="artisticon"></span>&nbsp;&nbsp;' +
                            checkUndefined(cache.artistRoman) +
                            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="artisticon"></span>&nbsp;&nbsp;' +
                            checkUndefined(cache.artistRoman);
                        artist.style.animationDuration = artistwidth / 45 + "s";
                        artist.classList = "scroll";
                        artistcontainer.classList = "fadescroll";
                    } else {
                        artistcontainer.style.transition = "all 0s";
                        artistcontainer.style.transform = "translateX(-100%)";
                        artist.style.paddingLeft = "16px";
                        artist.classList = "";
                        artistcontainer.classList = "";
                        setTimeout(() => {
                            artistcontainer.style.transition =
                                "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)";
                            artistcontainer.style.opacity = 1;
                            artistcontainer.style.transform = "translateX(0%)";
                        }, 10);
                    }
                }, 20);
            }, 200);
        }

        /*title*/
        if (cache.titleRoman !== tokenValue.titleRoman) {
            cache.titleRoman = tokenValue.titleRoman;
            titlecontainer.style.transition = "all 0.2s";
            titlecontainer.style.opacity = 0;
            setTimeout(() => {
                title.innerHTML = checkUndefined(tokenValue.titleRoman);
                const titlewidth = title.getBoundingClientRect().width;
                setTimeout(() => {
                    if (titlewidth > 520) {
                        titlecontainer.style.transition = "all 0.5s";
                        titlecontainer.style.opacity = 1;
                        title.style.paddingLeft = "0px";
                        title.innerHTML =
                            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="titleicon"></span>&nbsp;&nbsp;' +
                            checkUndefined(tokenValue.titleRoman) +
                            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="titleicon"></span>&nbsp;&nbsp;' +
                            checkUndefined(tokenValue.titleRoman);
                        title.style.animationDuration = titlewidth / 45 + "s";
                        title.classList = "scroll";
                        titlecontainer.classList = "fadescroll";
                    } else {
                        titlecontainer.style.transition = "all 0s";
                        titlecontainer.style.transform = "translateX(-100%)";
                        title.style.paddingLeft = "16px";
                        title.classList = "";
                        titlecontainer.classList = "";
                        setTimeout(() => {
                            titlecontainer.style.transition =
                                "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)";
                            titlecontainer.style.opacity = 1;
                            titlecontainer.style.transform = "translateX(0%)";
                        }, 10);
                    }
                }, 20);
            }, 200);
        }

        /*diff*/
        if (
            cache.diffName !== tokenValue.diffName ||
            cache.creator !== tokenValue.creator
        ) {
            cache.diffName = tokenValue.diffName;
            cache.creator = tokenValue.creator;

            const formatTime = {
                minute: Math.floor(tokenValue.totaltime / 60000),
                second: Math.floor((tokenValue.totaltime / 1000) % 60),
            };

            function formatTimeString(time) {
                if (isNaN(time)) return "00";
                return time < 10 ? "0" + time : time;
            }

            diffcontainer.style.transition = "all 0.2s";
            diffcontainer.style.opacity = 0;
            setTimeout(() => {
                difflavel.innerHTML = checkUndefined(tokenValue.diffName);
                totalTime.innerHTML = `(${formatTimeString(formatTime.minute)}:${formatTimeString(formatTime.second)})`;
                mapper.innerHTML = `&nbsp;<div class="mapper"><span class="secondary-font">//</span>&nbsp;${checkUndefined(tokenValue.creator)}`;
                difflavel.style.width = "auto";
                diff.style.width = "auto";
                diffcontainer.style.transition = "all 0s";
                diffcontainer.style.transform = "translateX(-100%)";

                const diffwidth = diff.getBoundingClientRect().width;
                const diffwidthlimit =
                    520 - mapperClass[0].getBoundingClientRect().width - 60;

                if (diffwidth > diffwidthlimit) {
                    const difflavelwidthlimit =
                        diffwidthlimit -
                        30 -
                        totalTime.getBoundingClientRect().width;
                    diff.style.width = diffwidthlimit + "px";
                    difflavel.style.width = difflavelwidthlimit + "px";
                    difflavel.classList = "faderight";
                } else {
                    difflavel.classList = "";
                }

                setTimeout(() => {
                    diffcontainer.style.transition =
                        "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)";
                    diffcontainer.style.opacity = 1;
                    diffcontainer.style.transform = "translateX(0%)";
                }, 30);

                /*ranked*/
                const rankSettings = {
                    7: { icon: "", color: "#ff81c5" },
                    4: { icon: "", color: "#80e6ff" },
                    5: { icon: "", color: "#ff5b15" },
                    6: { icon: "", color: "#c0e71b" },
                };

                const defaultSetting = { icon: "", color: "#929292" };

                const { icon, color } =
                    rankSettings[tokenValue.rankedStatus] || defaultSetting;

                mapRank.innerHTML = icon;
                mapRank.style.color = color;
            }, 200);
        }

        /*detail*/
        if (
            cache.mCS !== tokenValue.mCS ||
            cache.mAR !== tokenValue.mAR ||
            cache.mOD !== tokenValue.mOD ||
            cache.mHP !== tokenValue.mHP ||
            cache.mStars !== tokenValue.mStars ||
            cache.mBpm !== tokenValue.mBpm
        ) {
            cache.mCS = tokenValue.mCS;
            cache.mAR = tokenValue.mAR;
            cache.mOD = tokenValue.mOD;
            cache.mHP = tokenValue.mHP;
            cache.mStars = tokenValue.mStars;
            cache.mBpm = tokenValue.mBpm;
            mapdetail.style.transition = "all 0.2s";
            mapdetail.style.opacity = 0;

            const details = [
                "cs",
                "ar",
                "od",
                "hp",
                "mCS",
                "mAR",
                "mOD",
                "mHP",
            ];

            setTimeout(() => {
                for (let i = 0; i < details.length / 2; i++) {
                    const NomodValue =
                        typeof tokenValue[details[i]] === "string"
                            ? parseInt(
                                  (
                                      tokenValue[details[i]].match(/\d+/g) || []
                                  ).join(""),
                                  10,
                              )
                            : tokenValue[details[i]];
                    const ModedValue =
                        typeof tokenValue[details[i + 5]] === "string"
                            ? parseInt(
                                  (
                                      tokenValue[details[i + 4]].match(
                                          /\d+/g,
                                      ) || []
                                  ).join(""),
                                  10,
                              )
                            : tokenValue[details[i + 4]];

                    if (NomodValue > ModedValue) {
                        const element = document.getElementById(details[i]);
                        element.innerHTML =
                            tokenValue[details[i + 4]] +
                            '&nbsp;<span class="down"></span>';
                    } else if (NomodValue < ModedValue) {
                        const element = document.getElementById(details[i]);
                        element.innerHTML =
                            tokenValue[details[i + 4]] +
                            '&nbsp;<span class="up"></span>';
                    } else {
                        const element = document.getElementById(details[i]);
                        element.innerHTML = tokenValue[details[i + 4]];
                        element.style.color = "#ffffff";
                    }
                }

                mapdetail.style.transition = "all 0s";
                mapdetail.style.transform = "translateY(-100%)";

                setTimeout(() => {
                    mapdetail.style.transition =
                        "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)";
                    mapdetail.style.opacity = 1;
                    mapdetail.style.transform = "translateY(0%)";
                }, 30);
            }, 200);
        }

        /*mods*/
        if (cache.mods !== tokenValue.mods) {
            cache.mods = tokenValue.mods;
            mods.innerHTML = "";
            let modsApplied = cache.mods.split(",");
            cache.modsArray = modsApplied;

            if (!modsApplied[0]) {
                modsApplied.push("NM");
            }

            if (modsApplied.length === 1) {
                if (
                    modsApplied.includes("AU") ||
                    modsApplied.includes("AutoPlay") ||
                    modsApplied.includes("SV2") ||
                    modsApplied.includes("Score V2")
                ) {
                    modsApplied.push("NM");
                }
            }

            modsApplied = modsApplied.filter((name) => name !== "");
            modsApplied.forEach((name) => {
                let modImg = document.createElement("img");
                modImg.setAttribute("src", modsImgs[name]);
                mods.appendChild(modImg);
            });

            const modImages = Array.from(
                document.querySelectorAll("#mods img"),
            );

            for (let i = 0; i < modImages.length; i++) {
                modImages[i].style.zIndex = -i;
            }
        }

        /*avatar*/
        if (cache.banchoId !== tokenValue.banchoId) {
            cache.banchoId = tokenValue.banchoId;
        }

        if (cache.skin !== tokenValue.skin) {
            cache.skin = tokenValue.skin;
            skinBG.src = `http://${hostname}:${port}/Skins/${encodeURIComponent(tokenValue.skin)}/${encodeURIComponent("menu-background.jpg")}`;
        }

        if (cache.osuIsRunning !== tokenValue.osuIsRunning) {
            cache.osuIsRunning = tokenValue.osuIsRunning;
            if (tokenValue.osuIsRunning === 0) {
                interfaceHide();
            }
        }

        /*audio*/
        if (cache.audio.fullPath !== tokenValue.audio.fullPath) {
            audioStopped = false;
            audiostatus.style.opacity = 0;
            playingCount = 0;
            cache.audio.fullPath = tokenValue.audio.fullPath;
            audioElement.src = `http://${hostname}:${port}/Songs/${tokenValue.audio.fullPath}?a=${Math.random(10000)}`;
        }

        /*bg*/
        if (
            cache.background.fullPath !== tokenValue.background.fullPath &&
            backgroundReady === true
        ) {
            backgroundReady = false;
            cache.background.fullPath = tokenValue.background.fullPath;
            currentBG.src = `http://${hostname}:${port}/Songs/${tokenValue.background.fullPath}?a=${Math.random(10000)}`;
        }
    } catch (err) {
        console.log(err);
    }
};

currentBG.onload = () => {
    if (
        loadingBGcount === 1 &&
        currentBG.src ===
            `http://${hostname}:${port}/overlays/paradox/assets/loading.png`
    ) {
        if (skinBG.naturalWidth !== 0) {
            currentBG.src = skinBG.src;
        } else {
            currentBG.src = "./assets/nobg.png";
        }
    } else {
        averageColor = average(currentBG);

        if (saved.enableCustomColor === true) {
            colorFade(saved.customColor, 1000);
        } else {
            colorFade(averageColor, 1000);
        }

        const shadedCanvas = coordinate(
            resizeImage(currentBG, background.width, background.height),
            1 - saved.background.contrast,
        );
        shader.applyShaderToCanvas(
            shadedCanvas,
            saved.background.blur,
            saved.background.blur,
            0,
            true,
        );

        const shadedBannerCanvas = resizeImage(
            currentBG,
            banner.width,
            banner.height,
        );
        shader.applyShaderToCanvas(shadedBannerCanvas, 1, 5);

        fade(background, shadedCanvas, 1000, true);
        fade(banner, shadedBannerCanvas, 1000);
        fade(
            artwork,
            resizeImage(currentBG, artwork.width, artwork.height),
            1000,
        ).then(() => {
            if (
                currentBG.src ===
                    `http://${hostname}:${port}/overlays/paradox/assets/loading.png` &&
                loadingBGcount !== 1
            ) {
                loadingBGcount++;
                cache.background.fullPath = null;
            } else if (firstLoad) {
                firstLoad = false;
                loadingBGcount = 0;
                cache.background.fullPath = null;
            } else {
                loadingBGcount = 0;
            }
            backgroundReady = true;
        });
    }
};

currentBG.onerror = () => {
    currentBG.src = "./assets/loading.png";
};

panelImage.onload = () => {
    fade(avatar, resizeImage(panelImage, avatar.width, avatar.height), 500);
    if (!customImage.src) {
        fade(
            panelBackground,
            resizeImage(
                panelImage,
                panelBackground.width,
                panelBackground.height,
            ),
            500,
        );
    }
};

panelImage.onerror = () => {
    panelImage.src = currentBG.src;
};

customImage.onload = () => {
    fade(
        panelBackground,
        resizeImage(customImage, panelBackground.width, panelBackground.height),
        500,
    );
};

audiostatus.addEventListener("animationend", () => {
    audiostatus.classList = "";
});

audioElement.addEventListener("error", () => {
    audioStopped = true;
    audioError.classList = "popuperror";
    audioError.style.opacity = 1;
});

document.addEventListener("DOMContentLoaded", () => {
    backgroundRefresh();
    hideGameUIRefresh();
    drawTriangles();
});

function drawClock(canvas, ctx) {
    ctx.reset();
    const progress = Math.round((tokenValue.time / tokenValue.totaltime) * 10000) / 100;
    const center = canvas.width / 2;
    const startAngle = -Math.PI / 2;
    const currentTimeAngle = (3.6 * progress * Math.PI) / 180;
    ctx.beginPath();
    ctx.arc(center, center, center, startAngle, startAngle + currentTimeAngle);
    ctx.lineTo(center, center);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
}

const audioControl = setInterval(() => {
    adjustedTime = (cache.time + 0.1).toFixed(2);
    timeDifference = Math.abs(audioElement.currentTime - adjustedTime).toFixed(
        2,
    );

    if (audioStopped === false && saved.enableAudioCapture === true) {
        if (cache.rawStatus === 2) {
            if (
                cache.modsArray.includes("DT") ||
                cache.modsArray.includes("NC") ||
                cache.modsArray.includes("Double Time") ||
                cache.modsArray.includes("Nightcore")
            ) {
                audioElement.playbackRate = 1.5;
                modSpeed = 1.5;
            } else if (
                cache.modsArray.includes("HT") ||
                cache.modsArray.includes("Half Time")
            ) {
                audioElement.playbackRate = 0.75;
                modSpeed = 0.75;
            }
        } else {
            audioElement.playbackRate = 1;
        }

        if (timeDifference >= 0.1 && cache.rawStatus !== 7) {
            audioElement.currentTime = adjustedTime;
        }

        if (prevTime !== null) {
            if (adjustedTime === prevTime) {
                consecutiveCount++;
                playingCount = 0;
            } else {
                playingCount++;
                consecutiveCount = 0;
            }

            if (
                consecutiveCount >= 2 &&
                !audioElement.paused &&
                cache.rawStatus !== 7
            ) {
                try {
                    audioElement.pause();
                } catch (error) {
                    console.log(error);
                }

                consecutiveCount = 0;
                audioError.style.opacity = 0;
                audiostatus.innerHTML = "";
                audiostatus.classList = "popup";
                audiostatus.style.opacity = 1;
                artworkDim.style.opacity = 1;
            }

            if (playingCount >= 2 && audioElement.paused) {
                try {
                    audioElement.play();
                } catch (error) {
                    console.log(error);
                }

                playingCount = 0;
                audioError.style.opacity = 0;
                audiostatus.innerHTML = "";
                audiostatus.classList = "popupfade";
                audiostatus.style.opacity = 0;
                artworkDim.style.opacity = 0;
            }
        }
        prevTime = adjustedTime;
    } else {
        audioElement.pause();
    }
}, 150);

function checkUndefined(value) {
    return value == undefined ? "Unknown" : value;
}
