// https://editor.p5js.org/wearyroad/sketches/pA6yX7bLU

let maze;
let w;
let minimumWidth = 15;
let resetSeconds = 5;
let resetting = false;
let maxCells = 30000;
let paused = false;

let hueShift;
let hueShiftIncrement = 1;
let startHue;
let sortIndex = 0;
let sortFunctions = []
let sortFunc = function () { };

/*
    - [x] Implement Maze Reshuffling
        https://www.youtube.com/watch?v=uctN47p_KVk
        Implement Root Directed Graph
    TODO: Implement Mighty Mouse Regulations
        https://www.youtube.com/watch?app=desktop&v=ZMQbHMgK2rw
        TODO: Prevent Hand-On-Wall Solves:
            Move Goal to center of maze
            Implement Free-standing (unconnected) walls
                Implement "Diagonal" spaces
        TODO: Implement Empty Contiguous, Non-Uniform Rooms
    TODO: Implement Penalty Spaces
        Areas that, through some effect, cost more to travel through than other spaces.

*/

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    colorMode(HSB);
    // frameRate(1);
    sortFunctions = [
        shuffle,
        followMouse,
        followPoint
    ];
    reset();
}

function reset() {
    sortFunc = shuffle;
    resetting = false;
    hueShiftIncrement = 0.3;
    startHue = random(360);
    hueShift = startHue;

    // maxDimension = (width > height) ? width : height;
    // w = floor(sqrt(maxCells / (maxDimension)));
    minDimension = (width < height) ? width : height;
    w = minDimension / 60;
    if (w < minimumWidth) w = minimumWidth;
    cols = floor(width / w);
    rows = floor(height / w);
    background(0);

    grid = [];
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            var cell = new Cell(i, j);
            grid.push(cell);
        }
    }
    let rand = floor(random(0, grid.length - 1));
    maze = new Maze(grid, cols, rows, grid[rand], [], []);
    maze.reset();
    while (!maze.depthFirstSearch()) { }
    // while(!maze.complete){
    // 	maze.iterate();
    // }
}

async function startResetTimer() {
    resetting = true;
    await new Promise((resolve) => {
        setTimeout(() => {
            reset();
        }, resetSeconds * 1000);
    });
}

function draw() {
    background(0);
    maze.show();
    if (!resetting) {
        maze.update();
    }
    hueShift += hueShiftIncrement;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    reset();
}

function index(x, y) {
    return (x < 0 || y < 0 || x > cols - 1 || y > rows - 1)
        ? -1
        : x + y * cols;
}

function keyPressed() {
    if (keyCode = " ") {
        paused = ~paused;
    }
}

function mousePressed() {
    cycleSortFunctions(1);
}

function mouseWheel(event) {
    console.log(event.delta);
    cycleSortFunctions((event.delta > 0) ? 1 : -1);
}

function cycleSortFunctions(val) {
    sortIndex += val;
    sortIndex = sortIndex % sortFunctions.length;
    if (sortIndex < 0) sortIndex = sortFunctions.length + sortIndex;
    switch (sortIndex) {
        case 2:
            sortFunc = followMouse;
            break;
        case 1:
            sortFunc = followPoint;
            break;
        case 0:
        default:
            sortFunc = shuffle;
            break;
    }
}

// function mouseOut() {
// 	sortFunc = shuffle;
// }

let shuffle = function (array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

let followMouse = function (arr, point = { x: mouseX, y: mouseY }) {
    arr.sort((a, b) => {
        let distA = dist(a.x * w, a.y * w, mouseX, mouseY);
        let distB = dist(b.x * w, b.y * w, mouseX, mouseY);
        let ret = distA - distB;
        return ret;
    });
}

let followPoint = function (arr, point = { x: 0, y: 0 }) {
    arr.sort((a, b) => {
        let distA = dist(a.x * w, a.y * w, point.x, point.y);
        let distB = dist(b.x * w, b.y * w, point.x, point.y);
        let ret = distA - distB;
        return ret;
    });
}

//////////////////////////////////////
function Maze(grid, cols, rows, goal, rooms, exits) {
    this.numIterations = 10;
    this.showUnexplored = false;
    this.visitIncrement = 1;
    this.mazeGenerationMethod = "DepthFirstSearch";
    this.stateSwitchMilliseconds = 2000;
    this.prev = goal;
    this.current = goal;
    this.next = goal;
    this.grid = grid;
    this.cols = cols;
    this.rows = rows;
    this.rooms = rooms;
    this.exits = exits;
    this.visitCount = 1;
    this.stack;
    this.unexplored;
    this.currentColor;
    this.unexploredColor;

    this.startTime;
    this.elapsedTime;

    this.reset = function () {
        this.startTime = new Date();
        this.state = "DepthFirstSearch";
        this.visitCount = 1;
        this.stack = [];
        this.unexplored = [];
        this.currentColor = color(0, 0, 255);
        this.unexploredColor = color(39, 255, 127);
        this.prev = this.current;
        this.next = this.current;
        // if(this.numIterations > this.grid.length) {
        // 	this.numIterations = this.grid.length;
        // }
        for (let i = 0; i < this.grid.length; i++) {
            var cell = this.grid[i];
            cell.visited = 0;
        }
    }

    this.depthFirstSearch = function () {
        this.current.visit(this.visitCount, startHue);
        let neighbors = this.current.checkNeighbors(sortFunc);
        if (this.showUnexplored) {
            for (let i = 1; i < neighbors.length; i++) {
                const neighbor = neighbors[i];
                if (this.unexplored.length > 0) {
                    let found = this.unexplored.find((n) => {
                        return n.x == neighbor.x && n.y == neighbor.y;
                    });
                    if (found != undefined) break;
                    console.log('found: ', found);
                }
                this.unexplored.push(neighbor);
            }
        }
        if (neighbors[0]) {
            this.next = neighbors[0];
            this.visitCount += this.visitIncrement;
            this.current.visit(this.visitCount, startHue);
            this.stack.push(this.current);
            // this.current.removeWalls(this.current, this.next);
            this.next.parent = this.current;
            this.prev = this.current;
            this.current = this.next;
            if (this.showUnexplored) {
                // console.log(this.unexplored);
                let unexploredIndex = this.unexplored.findIndex((n) => {
                    return n.x == this.next.x && n.y == this.next.y;
                });
                if (unexploredIndex >= 0) {
                    this.unexplored.splice(unexploredIndex, 1);
                }
            }
            return false;
        }
        if (this.stack.length > 0) {
            this.visitCount -= this.visitIncrement;
            this.prev = this.current;
            this.current = this.stack.pop();
            this.next = this.stack.length > 0 ? this.stack[this.stack.length - 1] : this.current;
            return false;
        }
        hueShiftIncrement = 2;
        return true;
    }

    this.originShift = function () {
        // Create random out-edge on root
        this.current.getConnections();
        let connectionPool = [];
        for (let i = 0; i < this.current.connections.length; i++) {
            const connection = this.current.connections[i];
            if (connection) connectionPool.push(connection);
        }
        sortFunc(connectionPool);
        this.next = connectionPool[0];
        this.current.parent = this.next;
        this.next.parent = undefined;
        this.prev = this.current;
        this.current = this.next;
        this.current.shiftHue(10);
    }

    this.show = function () {
        // this.currentColor = color((this.current.c.h + 180) % 360, this.current.c.s, this.current.c.b);
        // this.prev.highlight({h:100, s:255, b:255, a:127});
        // this.current.highlight(this.currentColor);
        // this.current.highlight({h:50, s:255, b:255, a:127});
        this.next.highlight({ h: 0, s: 255, b: 255, a: 127 });
        for (let i = 0; i < this.unexplored.length && this.showUnexplored; i++) {
            this.unexplored[i].highlight(this.unexploredColor);
        }
        for (let i = 0; i < grid.length; i++) {
            grid[i].show();
        }
        // this.prev.drawBorderWalls(this.next.wallWidth, {h:250, s:255, b:255, a:127});
        // this.current.drawBorderWalls(this.current.wallWidth, {h:0, s:255, b:255, a:127});
        // this.next.drawBorderWalls(this.next.wallWidth, {h:50, s:255, b:255, a:127});
    }

    this.update = function () {
        if (paused) return;
        switch (this.state) {
            case "OriginShift":
                for (let i = 0; i < this.numIterations; i++) {
                    this.originShift();
                }
                break;
            case "DepthFirstSearch":
            default:
                for (let i = 0; i < this.numIterations; i++) {
                    // while (!this.depthFirstSearch()) {} 
                    if (this.depthFirstSearch()) {
                        this.elapsedTime = new Date() - this.startTime;
                        this.elapsedTime = this.elapsedTime > this.stateSwitchMilliseconds ? this.elapsedTime : this.stateSwitchMilliseconds;

                        this.startResetTimer(this.elapsedTime);
                        this.state = "OriginShift";
                        break;
                    }
                }
                break;
        }
    }

    this.startResetTimer = async function (milliseconds = this.stateSwitchMilliseconds) {
        await new Promise((resolve) => {
            setTimeout(() => {
                this.reset();
            }, milliseconds);
        });
    }
}
//////////////////////////////////////
function Cell(x, y) {
    this.x = x;
    this.y = y;
    this.wallWidth = w * 0.1 > 5 ? 5 : w * 0.1;
    this.halfWallWidth = this.wallWidth * 0.5;
    this.connections = [];
    this.parent;
    this.visited = 0;
    // this.c = {r:255, g:0, b:255, a:100};
    this.c = { h: startHue, s: 0, b: 0, a: 100 };

    this.getConnections = function () {
        this.connections[0] = grid[index(this.x, this.y - 1)]; //top
        this.connections[1] = grid[index(this.x - 1, this.y)]; //left
        this.connections[2] = grid[index(this.x, this.y + 1)]; //bottom
        this.connections[3] = grid[index(this.x + 1, this.y)]; //right
    };

    this.checkNeighbors = function (sort = shuffle) {
        var neighbors = [];
        this.getConnections();
        for (let i = 0; i < this.connections.length; i++) {
            const connection = this.connections[i];
            if (connection && !connection.visited) { neighbors.push(connection); }
        }
        sort(neighbors);
        return neighbors;
    }

    this.show = function () {
        this.pointParent(this.wallWidth, { h: 100, s: 0, b: 255, a: 127 });
        if (this.visited) {
            // this.pointParent(this.wallWidth, {h:100, s:255, b:255, a:127});
            // this.shiftHue();
            // strokeWeight(this.wallWidth);
            // stroke((this.c.h + hueShift) % 360, this.c.s, this.c.b, this.c.a);
            // top, left, bottom, right
            // this.drawWalls();
        }
        this.drawBorderWalls();
    };

    // top, left, bottom, right
    this.drawBorderWalls = function (
        sWeight = this.wallWidth,
        sColor = { h: (this.c.h + hueShift) % 360, s: this.c.s, b: this.c.b, a: this.c.a }
    ) {
        let x = this.x * w;
        let y = this.y * w;
        strokeWeight(sWeight);
        // stroke((this.c.h + hueShift) % 360, this.c.s, this.c.b, this.c.a);
        stroke(sColor.h, sColor.s, sColor.b, sColor.a);
        if (!this.connected(this.connections[0])) { line(x + this.halfWallWidth, y + this.halfWallWidth, x + w - this.halfWallWidth, y + this.halfWallWidth); }
        if (!this.connected(this.connections[1])) { line(x + this.halfWallWidth, y + this.halfWallWidth, x + this.halfWallWidth, y + w - this.halfWallWidth); }
        if (!this.connected(this.connections[2])) { line(x + this.halfWallWidth, y + w - this.halfWallWidth, x + w - this.halfWallWidth, y + w - this.halfWallWidth); }
        if (!this.connected(this.connections[3])) { line(x + w - this.halfWallWidth, y + this.halfWallWidth, x + w - this.halfWallWidth, y + w - this.halfWallWidth); }
    }

    // top, left, bottom, right
    this.drawWalls = function (
        sWeight = this.wallWidth,
        sColor = { h: (this.c.h + hueShift) % 360, s: this.c.s, b: this.c.b, a: this.c.a }
    ) {
        let x = this.x * w;
        let y = this.y * w;
        strokeWeight(sWeight);
        // stroke((this.c.h + hueShift) % 360, this.c.s, this.c.b, this.c.a);
        stroke(sColor.h, sColor.s, sColor.b, sColor.a);
        if (!this.connected(this.connections[0])) { line(x, y, x + w, y); }
        if (!this.connected(this.connections[1])) { line(x, y, x, y + w); }
        if (!this.connected(this.connections[2])) { line(x, y + w, x + w, y + w); }
        if (!this.connected(this.connections[3])) { line(x + w, y, x + w, y + w); }
    }

    this.pointParent = function (
        sWeight = this.wallWidth,
        sColor = { h: (this.c.h + hueShift) % 360, s: this.c.s, b: this.c.b, a: this.c.a }
    ) {
        let x = this.x * w;
        let y = this.y * w;
        strokeWeight(sWeight);
        stroke((this.c.h + hueShift + 45) % 360, this.c.s, this.c.b, this.c.a);
        // stroke(sColor.h, sColor.s, sColor.b, sColor.a);
        let halfW = w * 0.5;
        if (this.parent)
            line(x + halfW, y + halfW, (this.parent.x * w) + halfW, (this.parent.y * w) + halfW);
    }

    this.isParent = function (otherCell) {
        if (!otherCell) return false;
        return this.x == otherCell.x && this.y == otherCell.y;
    }

    this.connected = function (otherCell) {
        if (!otherCell) return false;
        return this.isParent(otherCell.parent) || otherCell.isParent(this.parent);
    }

    this.shiftHue = function (val) {
        this.c.h += val;
        if (this.c.h > 359) this.c.h = this.c.h % 360;
        if (this.c.h < 0) this.c.h = 360 - (-this.c.h % 360);
    }

    this.highlight = function (color = this.c) {
        noStroke();
        fill(color.h, color.s, color.b, color.a);
        rect(this.x * w, this.y * w, w, w);
    }

    this.goBlack = function () {
        if (this.c.r > 0) return this.c.r--;
        if (this.c.b > 0) return this.c.b--;
        if (this.c.g > 0) return this.c.g--;
    }

    this.goWhite = function () {
        if (this.c.r < 255) return this.c.r++;
        if (this.c.b < 255) return this.c.b++;
        if (this.c.g < 255) return this.c.g++;
    }

    this.visit = function (visitedIndex, startHue) {
        this.visited = visitedIndex;
        // this.c = {r:255, g:0, b:255, a:100};
        // this.c = {h:0, s:0, b:255, a:255};
        this.c = { h: ((visitedIndex * 0.1) % 360), s: 100, b: 100, a: 100 };
    }
}
