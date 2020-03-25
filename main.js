

let canvas;
let ctx;
let width;
let height;

// let gameType = 0;
// let gameRecord = [
//     { score: 0, combo: 0 }, { score: 0, combo: 0 }, { score: 0, combo: 0 }, { score: 0, combo: 0 }, { score: 0, combo: 0 },
//     { score: 0, combo: 0 }, { score: 0, combo: 0 }, { score: 0, combo: 0 }, { score: 0, combo: 0 }, { score: 0, combo: 0 },
// ];

let bestCombo = 0;
let bestScore = 0;

let mapData = null;
let flipFrames = 15;
let h;
let m;
let timestamp = 0;
let mainQ = [];
let cameraQ = [];
let commandQ = [];
let cameraDelta = {
    x: 0,
    y: 0
};
let combo = 0;
let score = 0;
let bullettimeCD = 0;

const CHANGE_POSITION = 1;
// const UPDATE_MAP = 2;
// const UPDATE_CAMERA = 3;
// const RESET_CAMERA = 4;
const HEX_LANDED = 5;
const SHOW_COMBO = 6;

let getBestScore = function (i) {
    return localStorage.getItem('score' + i) || 0;
}
let getBestCombo = function (i) {
    return localStorage.getItem('combo' + i) || 0;
}
let setBestScore = function (i, data) {
    localStorage.setItem('score' + i, data);
}
let setBestCombo = function (i, data) {
    localStorage.setItem('combo' + i, data);
}

$(document).ready(() => {
    canvas = document.getElementById('scene');
    ctx = canvas.getContext('2d');

    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    let onResize = function () {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    };
    $(window).resize(onResize);
    onResize();

    $(document).on('contextmenu', e => e.preventDefault());
    showMenu();
});

let initGame = function () {
    $('body').unbind();
    flipFrames = 15;
    h = new Hex(canvas.width / 2, canvas.height - 200, 50, flipFrames);
    m = new Map(canvas.width / 2, canvas.height - 200, 50, 60);
    timestamp = 0;
    mainQ = [];
    cameraQ = [];
    commandQ = [];
    cameraDelta = {
        x: 0,
        y: 0
    };
    combo = 0;
    score = 0;
    bestCombo = 0;
    bestScore = 0;
    bullettimeCD = 0;
    if (mapData === null) {
        mapData = [
            [],
            [
                { dir: 1, type: 1 }, { dir: 1, type: 1 }, { dir: 1, type: 1 }
                
            ],
            [
                { dir: 0, type: 1 }, { dir: 0, type: 1 }, { dir: 0, type: 1 }
            ],
            [
                { dir: 1, type: 1 }, { dir: 1, type: 1 }, { dir: 1, type: 1 },
                { dir: 0, type: 1 }, { dir: 0, type: 1 }, { dir: 0, type: 1 }
            ],
            [
                { dir: 1, type: 1 }, { dir: 0, type: 1 }, { dir: 1, type: 1 },
                { dir: 0, type: 1 }, { dir: 1, type: 1 }, { dir: 0, type: 1 }
            ],
            [
                { dir: 1, type: 1 }, { dir: 1, type: 1 }, { dir: 1, type: m.BULLETTIME},{ dir: 0, type: 1 }, { dir: 0, type: 1 }, { dir: 0, type: 1 },
                { dir: 0, type: 1 }, { dir: 1, type: 1 }, { dir: 0, type: 1 }
            ],
            [
                { dir: 1, type: m.NORMAL }, { dir: 1, type: m.NORMAL }, { dir: 0, type: m.NORMAL }, { dir: 1, type: m.BULLETTIME },
                { dir: 1, type: m.NORMAL }, { dir: 0, type: m.NORMAL }, { dir: 1, type: m.NORMAL }, { dir: 0, type: m.NORMAL },
                { dir: 0, type: m.NORMAL }, { dir: 0, type: m.NORMAL }, { dir: 0, type: m.NORMAL }, { dir: 1, type: m.BULLETTIME },
                { dir: 1, type: m.NORMAL }, { dir: 0, type: m.NORMAL }, { dir: 1, type: m.NORMAL }, { dir: 1, type: m.NORMAL },
            ],
            [
                { dir: 1, type: m.NORMAL }, { dir: 0, type: m.NORMAL }, { dir: 0, type: m.NORMAL }, { dir: 1, type: m.BULLETTIME },
                { dir: 1, type: m.NORMAL }, { dir: 0, type: m.NORMAL }, { dir: 1, type: m.NORMAL }, { dir: 1, type: m.NORMAL },
            ],
            [
                { dir: 1, type: m.NORMAL }, { dir: 0, type: m.NORMAL }, { dir: 0, type: m.NORMAL }, { dir: 1, type: m.BULLETTIME },
                { dir: 1, type: m.NORMAL }, { dir: 0, type: m.NORMAL }, { dir: 1, type: m.NORMAL }, { dir: 1, type: m.NORMAL },
            ],
            [
                { dir: 1, type: m.NORMAL }, { dir: 0, type: m.NORMAL }, { dir: 0, type: m.NORMAL }, { dir: 1, type: m.BULLETTIME },
                { dir: 1, type: m.NORMAL }, { dir: 0, type: m.NORMAL }, { dir: 1, type: m.NORMAL }, { dir: 1, type: m.NORMAL },
            ],
        ];
    }

    if (gameType != 0) {
        m.setIsInfinite(false);
        m.setMap(mapData[gameType]);
    }
}

let startGame = function () {

    let makeEvent = function (time, data, type = CHANGE_POSITION) {
        return {
            time: time,
            data: data,
            type: type
        }
    };
    let getQLastTs = function (q) {
        if (q.length == 0) {
            return timestamp - 1;
        }
        else return q[q.length - 1].time;
    }
    let pushFlipEvents = function (dir, t = getQLastTs(mainQ)) {
        let orgLoc = h.getLoc();
        for (let i = 0; i < flipFrames; i++) {
            t++;
            if (dir === 'left') mainQ.push(makeEvent(t, h.changePoints([h.leftFlipDeltas[i]])));
            else mainQ.push(makeEvent(t, h.changePoints([h.rightFlipDeltas[i]])));
        }
        // t++;
        // mainQ.push(makeEvent(t, h.getPoints()));
        t++;
        mainQ.push(makeEvent(t, h.getPoints()));
        mainQ.push(makeEvent(t, 'landed', HEX_LANDED));
        if (dir === 'left') h.swapPoints('left');
        else h.swapPoints('right');
        let dx = (h.getLoc().x - orgLoc.x) / flipFrames;
        let dy = (h.getLoc().y - orgLoc.y) / flipFrames;
        cameraDelta.x += dx * flipFrames;
        cameraDelta.y += dy * flipFrames;

        for (let i = 0; i < flipFrames; i++) {
            mainQ.push(makeEvent(t - flipFrames + i + 1, 1 - Math.min(1.0, Math.abs((i - flipFrames / 2) / (flipFrames / 2))), SHOW_COMBO));
        }
        mainQ.sort((a, b) => a.time - b.time);
        if (cameraDelta.x < -width * 2 / 5 || cameraDelta.y < -height / 2) {

            for (let i = 0; i < flipFrames; i++) {
                let tmp = {
                    x: -(i + 1) * cameraDelta.x / flipFrames,
                    y: -(i + 1) * cameraDelta.y / flipFrames
                }
                cameraQ.push(makeEvent(t - flipFrames + i + 1, tmp));
            }

            h.setPoints(calPointsDelta(h.getPoints(), cameraDelta, -1));
            cameraDelta = {
                x: 0,
                y: 0
            }
        }
        if (m.getIsInfinite()) m.newPart();
        return t;
    };
    let pushLeftFlipEvents = function (t = getQLastTs(mainQ)) {
        pushFlipEvents('left', t);
    };

    let pushRightFlipEvents = function (t = getQLastTs(mainQ)) {
        pushFlipEvents('right', t);
    };

    $('body').keydown(function (event) {
        let kc = event.keyCode ? event.keyCode : event.witch;
        if (parseInt(kc) == 37) commandQ.push('left');
        else if (parseInt(kc) == 39) commandQ.push('right');
    });

    $('body').mousedown(function (event) {
        if (event.which == 3) {
            commandQ.push('right');
        }
        else if (event.which == 1) {
            commandQ.push('left');
        }
    });
    let intervalId = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (cameraQ.length !== 0 && cameraQ[0].time == timestamp) {
            m.drawMap(cameraQ[0].data);
        }
        else {
            m.drawMap({ x: 0, y: 0 });
        }
        if (cameraQ.length === 1) {
            m.cameraUpdate(cameraQ[0].data);
        }

        let pts = null;
        let hasCombo = false;
        let comboColor = 1.0;
        let lose = false;
        let clear = false;
        while (mainQ.length !== 0 && mainQ[0].time == timestamp) {
            let obj = mainQ.shift();
            if (obj.type === CHANGE_POSITION) {
                pts = obj.data;

            }
            else if (obj.type === SHOW_COMBO) {
                hasCombo = true;
                comboColor = obj.data;
            }
            else if (obj.type === HEX_LANDED) {
                if (bullettimeCD > 0) {
                    bullettimeCD--;
                    if (bullettimeCD === 0) {
                        flipFrames = 15;
                        h = new Hex(h.getLoc().x, h.getLoc().y, h.radius, flipFrames);
                    }
                }

                let t = h.isOnMap(m.getLocs());
                if (t === -1) {
                    lose = true;
                }
                else {
                    if (m.getType(t) === m.BULLETTIME) {
                        flipFrames = 40;
                        bullettimeCD = 5;
                        h = new Hex(h.getLoc().x, h.getLoc().y, h.radius, flipFrames);
                    }

                    if (gameType !== 0) {
                        let locs = m.getLocs();
                        if (h.isOnMap([locs[locs.length - 1]]) !== -1) {
                            clear = true;
                        }
                    }
                }



                score += combo;

            }
        }

        if (mainQ.length === 0 && commandQ.length !== 0) {
            let c = commandQ.shift();
            combo++;
            bestCombo = Math.max(combo, bestCombo);
            pts = h.getPoints();
            playSound('flip.wav');
            if (c == 'left') pushLeftFlipEvents(timestamp);
            else if (c == 'right') pushRightFlipEvents(timestamp);
        }

        if (pts === null) {
            combo = 0;
            pts = h.getPoints();
        }
        ctx.fillStyle = 'rgba(225,225,225,0.7)';
        ctx.fillRect(0, 0, width, 130);


        ctx.font = "30px Consolas";
        ctx.fillStyle = "Black";
        if (gameType > 0) ctx.fillText("Stage " + gameType, 10, 40);
        else ctx.fillText('Infinite Mode', 10, 40);

        ctx.font = "30px Consolas";
        let deltaCombo = 1;
        for (let i = 9; i >= 0; i--) {
            if (combo >= i * deltaCombo) {
                ctx.fillStyle = "#FF" + (9 - i) + (9 - i) + (9 - i) + (9 - i);
                break;
            }
        }
        ctx.fillText("Combo " + combo, 10, 70);
        ctx.font = "30px Consolas";
        ctx.fillStyle = "orange";
        ctx.fillText("Score: " + score, 10, 100);

        ctx.font = "30px Consolas";
        ctx.fillStyle = "grey";
        ctx.fillText("Best Score: " + getBestScore(gameType), width - 300, 100);
        ctx.font = "30px Consolas";
        ctx.fillStyle = "grey";
        ctx.fillText("Best Combo: " + getBestCombo(gameType), width - 300, 70);



        if (cameraQ.length !== 0 && cameraQ[0].time == timestamp) {
            let delta = cameraQ.shift().data;
            let npts = calPointsDelta(pts, delta, 1);
            fillContour(npts, 'orange');


            if (hasCombo) {
                let x = 0, y = 0;
                for (let pt of npts) {
                    x += pt.x;
                    y += pt.y;
                }
                let loc = {
                    x: x / 6,
                    y: y / 6
                };

                ctx.font = "30px Consolas";
                let clr = 'rgba(0,0,0,' + comboColor + ')';
                ctx.fillStyle = clr;
                let txt = "+" + combo;
                ctx.fillText(txt, loc.x - 30 / 2 * (txt.length / 2), loc.y + 30 / 2);
            }

        }
        else {
            fillContour(pts, 'orange');
            if (hasCombo) {
                let x = 0, y = 0;
                for (let pt of pts) {
                    x += pt.x;
                    y += pt.y;
                }
                let loc = {
                    x: x / 6,
                    y: y / 6
                };

                ctx.font = "30px Consolas";
                let clr = 'rgba(0,0,0,' + comboColor + ')';
                ctx.fillStyle = clr;
                let txt = "+" + combo;
                ctx.fillText(txt, loc.x - 30 / 2 * (txt.length / 2), loc.y + 30 / 2);
            }
        }

        timestamp++;

        if (lose) {
            loseGame()
            clearInterval(intervalId);
        }

        if (clear) {
            clearStage();
            clearInterval(intervalId);
        }

    }, 15);
};

let showMenu = function () {
    ctx.clearRect(0, 0, width, height);
    ctx.font = "" + width / 10 + "px Consolas";
    ctx.fillStyle = "#FF6A44";
    let msg = "Hexago";
    ctx.fillText(msg, width / 2 - width / 20 * (msg.length / 2 + (msg.length % 2 === 0 ? 0 : 1)), height / 2 - 1 * width / 10);
    showMessage("Press 1~6 to play stage 1~6", '#F38569', -1);
    showMessage("Press I to play infinite mode", 'orange', 0);
    showMessage("Press H for help", '#F7AE9B', 1);
    $('body').keydown(function (event) {
        let kc = event.keyCode ? event.keyCode : event.which;
        if (parseInt(kc) === 73) {
            gameType = 0;
            initGame();
            startGame();
        }
        for (let i = 49; i < 55; i++) {
            if (parseInt(kc) === parseInt(i)) {
                gameType = i - 48;
                initGame();
                startGame();
            }
        }
        if (parseInt(kc) === 72) {
            showHelp();
        }
    })
}

let showHelp = function () {
    $('body').unbind();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    $('body').keydown(function (event) {
        let kc = event.keyCode ? event.keyCode : event.which;
        if(parseInt(kc) === 77) {
            showMenu();
        }
    });
    showMessage('This is a simple fun game called Hexago, in which you control a hex.', 'orange', -3, 60);
    showMessage('Right click your mouse to go right, and left to go left.', 'orange', -2, 60);
    showMessage('Please stay on map, if you make the wrong move, you lose the game.', 'orange', -1, 60);
    showMessage('Consecutive flips increases your combo, and you can gain higher score from each flip.', 'orange', 0, 60);
    showMessage('Touching blue hexes on map will give you bullet time to keep your combo much easier.', 'blue', 1, 60);
    showMessage('Good luck and have fun! Press M to go back to menu.', 'red', 2, 60);



}

let updateRecord = function () {
    setBestCombo(gameType, Math.max(bestCombo, getBestCombo(gameType)));
    setBestScore(gameType, Math.max(score, getBestScore(gameType)));
}

let clearStage = function () {
    $('body').unbind();
    updateRecord();
    playSound('success.wav');
    showShadow();
    showMessage('Congratulations! You cleared stage ' + gameType, 'orange', -1);
    showMessage('Press R to restart, M to return to menu', 'orange', 0);
    if (gameType >= 1 && gameType !== 6) {
        showMessage('Press N to go to stage ' + (gameType + 1), 'orange', 1);
    }
    else {
        showMessage('You\'ve cleared all stages!', 'orange', 1);
        showMessage('Press I to try infinite mode', 'red', 2);
    }
    $('body').keydown(function (event) {
        let kc = event.keyCode ? event.keyCode : event.witch;
        if (parseInt(kc) === 77) {
            initGame();
            showMenu();
        }
        else if (parseInt(kc) === 78) {
            if (gameType < 6 && gameType !== 0) {
                gameType++;
                initGame();
                startGame();
            }
        }
        else if (parseInt(kc) == 73) {
            if (gameType === 6) {
                gameType = 0;
                initGame();
                startGame();
            }
        }
        else if (parseInt(kc) === 82) {
            initGame();
            startGame();
        }

    });
}

let loseGame = function () {
    $('body').unbind();
    updateRecord();
    playSound('lose.wav');
    showShadow();
    showMessage('GG Press R to restart', 'grey', -1);
    showMessage('Press M to return to menu', 'grey', 0);

    $('body').keydown(function (event) {
        let kc = event.keyCode ? event.keyCode : event.witch;
        if (parseInt(kc) === 77) {
            showMenu();
        }
        else if (parseInt(kc) === 82) {
            initGame();
            startGame();
        }
    });
}

let showShadow = function () {
    ctx.fillStyle = 'rgba(225,225,225,0.7)';
    ctx.fillRect(0, 0, width, height);
}

let showMessage = function (msg, color, yoffset, size = 30) {
    ctx.font = "" + width / size + "px Consolas";
    ctx.fillStyle = color;
    ctx.fillText(msg, width / 2 - width / size / 2 * (msg.length / 2 + 1), height / 2 + yoffset * width / size);
}

let rotate = function (x, y, xbase, ybase, a) {
    return {
        x: Math.cos(a) * (x - xbase) - Math.sin(a) * (y - ybase) + xbase,
        y: Math.sin(a) * (x - xbase) + Math.cos(a) * (y - ybase) + ybase
    }
};

let fillContour = function (points, color) {
    if (points.size < 2) return;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(function (point) {
        ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.fill();
};

let calPointsDelta = function (points, delta, flag) {
    let tmp = [];
    for (let pt of points) {
        tmp.push({
            x: pt.x + flag * delta.x,
            y: pt.y + flag * delta.y
        })
    }
    return tmp;
};

let playSound = function (soundfile) {
    // document.getElementById("dummy").innerHTML =
    //     "<embed src='" + soundfile + "' hidden='true' autostart='true' loop='false'/>";
    //$('#flipSound').play();
}

let Hex = function (x, y, radius, flipFrames = 10) {
    let loc = {
        x: x,
        y: y
    }
    let points = [];
    let leftFlipDeltas = [];
    let rightFlipDeltas = [];
    let init = function () {
        let p = {
            x: loc.x - radius / 2,
            y: loc.y - radius * Math.sqrt(3) / 2
        }

        for (let a = 0; a < 6; a++) {
            p = rotate(p.x, p.y, loc.x, loc.y, -Math.PI / 3);
            points.push(p);
        }

        initLeftFlip(flipFrames);
        initRightFlip(flipFrames);
    }
    let getPoints = function () {
        return points;
    }
    let setPoints = function (pts) {
        points = pts;
        calLoc();
        return points;
    }
    let calLoc = function () {
        let pts = getPoints();
        let x = 0, y = 0;
        for (let pt of pts) {
            x += pt.x;
            y += pt.y;
        }
        loc = {
            x: x / 6,
            y: y / 6
        }
    }
    let getLoc = function () {
        return loc;
    }
    let changePoints = function (deltas) {
        let tmp = [];
        for (let delta of deltas) {
            for (let i = 0; i < 6; i++) {
                tmp[i] = {
                    x: points[i].x + delta[i].x,
                    y: points[i].y + delta[i].y,
                };
            }
        }
        points = tmp;
        calLoc();
        return points;
    }
    let swapPoints = function (dir) {
        let leftFlipMap = { 0: 2, 1: 1, 2: 0, 3: 5, 4: 4, 5: 3 };
        let rightFlipMap = { 0: 4, 1: 3, 2: 2, 3: 1, 4: 0, 5: 5 };
        let map = dir == 'left' ? leftFlipMap : rightFlipMap;
        let tmp = [];
        for (let i = 0; i < 6; i++) {
            tmp[map[i]] = points[i];
        }
        points = tmp;
        calLoc();
        return points;
    }


    let initLeftFlip = function (frameCnt) {
        // let timePassed = 0;
        let delta = Math.PI / frameCnt;
        let alpha = 0;
        let dis = [Math.sqrt(3) * radius / 2, Math.sqrt(3) * radius];
        for (let f = 0; f < frameCnt; f++) {
            alpha += delta;
            let tmp = [];
            for (let i = 0; i < 6; i++) {
                if (i == 0 || i == 5) {
                    tmp[i] = {
                        x: 0,
                        y: 0
                    }
                }
                else if (i == 1 || i == 4) {
                    let deltax = dis[0] * (1 - Math.cos(alpha)) * Math.cos(Math.PI / 6);
                    let deltay = dis[0] * (1 - Math.cos(alpha)) * Math.sin(Math.PI / 6);
                    tmp[i] = {
                        x: -deltax,
                        y: -deltay
                    }
                }
                else {
                    let deltax = dis[1] * (1 - Math.cos(alpha)) * Math.cos(Math.PI / 6);
                    let deltay = dis[1] * (1 - Math.cos(alpha)) * Math.sin(Math.PI / 6);
                    tmp[i] = {
                        x: -deltax,
                        y: -deltay
                    }
                }
            }
            leftFlipDeltas.push(tmp);
        }

        for (let i = frameCnt - 1; i >= 1; i--) {
            for (let j = 0; j < 6; j++) {
                leftFlipDeltas[i][j].x -= leftFlipDeltas[i - 1][j].x;
                leftFlipDeltas[i][j].y -= leftFlipDeltas[i - 1][j].y;
            }
        }

    }
    let initRightFlip = function (frameCnt) {
        let delta = Math.PI / frameCnt;
        let alpha = 0;
        let dis = [Math.sqrt(3) * radius / 2, Math.sqrt(3) * radius];
        for (let f = 0; f < frameCnt; f++) {
            alpha += delta;
            let tmp = [];
            for (let i = 0; i < 6; i++) {
                if (i == 3 || i == 4) {
                    tmp[i] = {
                        x: 0,
                        y: 0
                    }
                }
                else if (i == 5 || i == 2) {
                    let deltax = dis[0] * (1 - Math.cos(alpha)) * Math.cos(Math.PI / 6);
                    let deltay = dis[0] * (1 - Math.cos(alpha)) * Math.sin(Math.PI / 6);
                    tmp[i] = {
                        x: +deltax,
                        y: -deltay
                    }
                }
                else {
                    let deltax = dis[1] * (1 - Math.cos(alpha)) * Math.cos(Math.PI / 6);
                    let deltay = dis[1] * (1 - Math.cos(alpha)) * Math.sin(Math.PI / 6);
                    tmp[i] = {
                        x: +deltax,
                        y: -deltay
                    }
                }
            }
            rightFlipDeltas.push(tmp);
        }

        for (let i = frameCnt - 1; i >= 1; i--) {
            for (let j = 0; j < 6; j++) {
                rightFlipDeltas[i][j].x -= rightFlipDeltas[i - 1][j].x;
                rightFlipDeltas[i][j].y -= rightFlipDeltas[i - 1][j].y;
            }
        }

    }
    init();

    let isOnMap = function (m) {
        for (let i = 0; i < m.length; i++) {
            if (Math.abs(m[i].x - loc.x) < 1 && Math.abs(m[i].y - loc.y) < 1) return i;
        }
        return -1;
    }

    return {
        getLoc: getLoc,
        radius: radius,
        getPoints: getPoints,
        leftFlipDeltas: leftFlipDeltas,
        rightFlipDeltas: rightFlipDeltas,
        changePoints: changePoints,
        swapPoints: swapPoints,
        setPoints: setPoints,
        isOnMap: isOnMap
    }
};


let Map = function (x, y, radius, size) {
    let h = new Hex(x, y, radius, 1);
    let parts = [];
    let locs = [];
    let types = [];
    const NORMAL = 1;
    const BULLETTIME = 2;
    let isInfinite = true;
    //const MAP_AIRPLANE = 3;
    let newPart = function () {
        if (Math.random() > 0.5) {
            parts.push(h.changePoints([h.leftFlipDeltas[0]]));
            h.swapPoints('left');
            locs.push(h.getLoc());
        }
        else {
            parts.push(h.changePoints([h.rightFlipDeltas[0]]));
            h.swapPoints('right');
            locs.push(h.getLoc());
        }
        if (Math.random() > 0.95) {
            types.push(BULLETTIME);
        }
        else types.push(NORMAL);

        if (parts.length > size) {
            parts.shift();
            locs.shift();
            types.shift();
        }
    }
    let init = function () {
        for (let i = 0; i < size * 2 / 3; i++) newPart();
    }
    let drawMap = function (delta = { x: 0, y: 0 }) {
        for (let i = 0; i < parts.length; i++) {
            if (types[i] === NORMAL) {
                fillContour(calPointsDelta(parts[i], delta, 1), 'grey');
            }
            else if (types[i] === BULLETTIME) {
                fillContour(calPointsDelta(parts[i], delta, 1), 'blue');
            }
        }
    }

    let cameraUpdate = function (delta) {
        for (let i = 0; i < parts.length; i++) {
            let tmp = calPointsDelta(parts[i], delta, 1);
            parts[i] = tmp;
            let x = 0, y = 0;
            for (let pt of tmp) {
                x += pt.x;
                y += pt.y;
            }
            locs[i] = {
                x: x / 6,
                y: y / 6
            }
        }
        h.setPoints(calPointsDelta(h.getPoints(), delta, 1));
        // locs.push(h.getLoc());
        // if (locs.length > size) locs.shift();
    }

    let getLocs = function () {
        return locs;
    }
    let getType = function (i) {
        return types[i];
    }
    let getIsInfinite = function () {
        return isInfinite;
    }
    let setMap = function (data) {
        h = new Hex(x, y, radius, 1);
        parts = [];
        locs = [];
        types = [];
        for (let d of data) {
            if (d.dir > 0.5) {
                parts.push(h.changePoints([h.leftFlipDeltas[0]]));
                h.swapPoints('left');
                locs.push(h.getLoc());
            }
            else {
                parts.push(h.changePoints([h.rightFlipDeltas[0]]));
                h.swapPoints('right');
                locs.push(h.getLoc());
            }
            if (d.type == BULLETTIME) {
                types.push(BULLETTIME);
            }
            else types.push(NORMAL);
            if (parts.length > size) {
                parts.shift();
                locs.shift();
                types.shift();
            }
        }
    }
    let setIsInfinite = function (v) {
        isInfinite = v;
    }
    init();
    return {
        newPart: newPart,
        drawMap: drawMap,
        cameraUpdate: cameraUpdate,
        getLocs: getLocs,
        getType: getType,
        getIsInfinite: getIsInfinite,
        setIsInfinite: setIsInfinite,
        setMap: setMap,
        NORMAL: NORMAL,
        BULLETTIME: BULLETTIME,
    }
};