const container = document.getElementById('grid-container');
const ROWS = 20;
const COLS = 50;
const global_delay = 5
const path_delay = 40
let startPointBool = false;
let endPointBool = false;
let startPoint, endPoint;
let isDragging = false

let grid = []
let queue = []
let path = []

let searching = false;

class Cell {
    constructor(element, row, col) {
        this.element = element;
        this.row = row;
        this.col = col;
        this.start = false;
        this.end = false;
        this.obstacle = false;
        this.queued = false;
        this.visited = false;
        this.neighbours = [];
        this.prior = null;
    }

    set_neighbours() {
        // add neighbour to each adjacent cell (don't if next to barrier of grid)
        // right neighbour
        if (this.row < ROWS - 1) {
            this.neighbours.push(grid[this.row + 1][this.col])
        }
        // lower neighbour
        if (this.col < COLS - 1) {
            this.neighbours.push(grid[this.row][this.col + 1])
        }
        // left neighbour
        if (this.row > 0) {
            this.neighbours.push(grid[this.row - 1][this.col])
        }
        // upper neighbour
        if (this.col > 0) {
            this.neighbours.push(grid[this.row][this.col - 1])
        }
    }

    visit() {
        this.element.classList.add('visited');
    }

    queue() {
        this.element.classList.add('queued');
    }
}

// Create divs and visual grid
for (let i = 0; i < ROWS; i++) {
    // empty array to store the row of cells, which will be appended to the grid
    let arr = []
    for (let j = 0; j < COLS; j++) {
        const cellElement = document.createElement('div');
        const cell = new Cell(cellElement, i, j);
        cell.element.classList.add('grid-item');
        cell.element.id = `cell-${i}-${j}`;

        // add event listeners for the grid to set start and end points
        cell.element.addEventListener('click', function(){
            // set start point if it hasn't been set yet
            if (!startPointBool) {
                cell.element.classList.add('start-point');
                cell.start = true;
                startPoint = {row: i, column: j};
                startPointBool = true;
            }
            // set end point if start point has been set but end point hasn't
            else if (!endPointBool) {
                cell.element.classList.add('end-point');
                cell.end = true;
                endPoint = {row: i, column: j}
                endPointBool = true;
            }
        })

        // add event listener for 'dragging' mouse to toggle obstacles
        cell.element.addEventListener('mousedown', function(e){
            e.preventDefault();
            isDragging = true;
            if (startPointBool && endPointBool && !cell.obstacle && !cell.start && !cell.end ) {
                cell.element.classList.add('obstacle');
                cell.obstacle = true;
            }
        });

        // when dragging is True, and the mouse hovers over a cell, toggle the Obstacle
        cell.element.addEventListener('mouseenter', function() {
            if (isDragging && startPointBool && endPointBool && !cell.obstacle && !cell.start && !cell.end) {
                cell.element.classList.add('obstacle');
                cell.obstacle = true;
            }
        });

        // append the cell element to the container
        container.appendChild(cell.element);
        // append each cell to the row
        arr.push(cell);
    }

    // append the row to the grid
    grid.push(arr);
}

// document event listener to end the dragging for toggling the obstacles
document.addEventListener('mouseup', function() {
    isDragging = false;
});

// Add event listener for the start button, which starts the search
const startButton = document.getElementById('start-btn');
startButton.addEventListener('click', function() {
    if (startPointBool && endPointBool) {
        searching = true;
        let start_cell = grid[startPoint.row][startPoint.column]
        queue.push(start_cell)
        startSearch();
    } else {
        alert('Please set both a start point and end point before starting the algorithm')
    }
});

// Add event listener for the refresh button, to refresh the page/grid
const refreshButton = document.getElementById('refresh-btn');
refreshButton.addEventListener('click', function() {
    window.location.reload();
})

// Add neighbours for each cell in grid
 for (let i=0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
        grid[i][j].set_neighbours();
    }
}

// Async delay function
function delay(ms) {
     return new Promise(resolve => setTimeout(resolve, ms))
}

// Search function - initiate when start button is clicked
async function startSearch() {
    while (searching) {
        // if start and end points are set, we perform the algorithm
        if (startPointBool && endPointBool) {
            let target = grid[endPoint.row][endPoint.column];
            if (queue.length > 0 && searching) {
                let current_box = queue.shift();
                current_box.element.visited = true;
                current_box.visit();

                if (current_box === target) {
                    searching = false;
                    let start_cell = grid[startPoint.row][startPoint.column];
                    // create the path once the route has been found
                    while (current_box.prior !== start_cell) {
                        path.push(current_box.prior);
                        current_box = current_box.prior;
                    }
                    draw_path(path);
                    reset();
                    // reset grid values once the target has been found
                    break;
                } else {
                    for (let i = 0; i < current_box.neighbours.length; i++) {
                        if (!current_box.neighbours[i].queued && !current_box.neighbours[i].obstacle && !current_box.neighbours[i].visited) {
                            current_box.neighbours[i].queued = true;
                            current_box.neighbours[i].queue();
                            current_box.neighbours[i].prior = current_box;
                            queue.push(current_box.neighbours[i]);
                        }
                    }
                }

                await delay(global_delay)

            } else {
                if (searching) {
                    alert('No solution found')
                    searching = false;
                }
            }

        // if start and end points are not set, we alert the user to do so before beginning the algorithm
        } else {
            alert('Please set both a start point and end point before starting the algorithm')
        }
    }
}

 // draw path with delay
async function draw_path(pathList) {
     for (let i=pathList.length-1; i >= 0; i--) {
         pathList[i].element.classList.add('path');
         await delay(path_delay)
     }
}

// reset grid
function reset() {
     for (let i=0; i < grid.length; i++) {
         grid[i].visited = false;
         grid[i].queued = false;
     }
     queue = []
     path = []
}
