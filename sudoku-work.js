//constants
const canvas = document.querySelector(".canvas");
const sudoku = document.querySelector(".sudoku");
const whole = document.querySelector(".container")
const solve = document.querySelector(".solve-btn");
const restartButton=document.querySelector('.restart-btn');
const number_btn = document.querySelectorAll('.number');
const para=document.querySelector('.heading p');
const speed_options = document.querySelectorAll('.speed-btn');

//variables
let grid=[]; //sudoku grid with integer numbers
let grid_collection = new Array(), active_element_collection = new Array();//collectioin of sudoku iterations & active row and column number
let a =0, b=0, temp = 0;
let curr_active = null;
let tempr = 0, tempc = 0;
let found_empty  = false;
let startrunning = false;

// animation controls
let lasttime = 0;

//10 ---> slow
//25 ---> medium
//50 ---> fast
let speed  = 25;

function main(ctime){
    if(startrunning){
        
        if((ctime-lasttime)/1000>1/speed){
            printSolvedSudoku();
            lasttime = ctime;
        }
        window.requestAnimationFrame(main);
    }
}
/////////////////////////

//start the game
game();
//////////////

//game-functions

function game(){
    //construct empty grid, initializing all elements to -1
    make_grid();

    //set the speed
    speed_options.forEach(option => {
        option.addEventListener('click', function(){
            speed_options.forEach(element => {
                element.classList.remove('active');
            });
            this.classList.add('active');
            val = this.innerText;
            if(val=="Slow"){
                speed = 10;
            }
            else if(val=="Fast"){
                speed = 50;
            }
            else{
                speed = 25;
            }
        })
    });

    //empty the entire grid
    restartButton.addEventListener('click', restart)

    //add numbers in grid using buttons
    
    grid_elements = sudoku.childNodes;
    grid_elements.forEach(element => {
        element.addEventListener('click', ()=>{
            curr_active = element;
        })
    });
    
    number_btn.forEach(number => {
        number.addEventListener('click', function(){
            add_number(number, curr_active);
            take_values();
        }); 
    })

    //take_values from the grid
    sudoku.addEventListener('keyup', take_values);
    solve.addEventListener('click', fill_grid);
      
}

//function for stopping and restarting pointer events
function deletepointerevents(){
    sudoku.style.pointerEvents = "none";
    solve.style.pointerEvents = "none";
    number_btn.forEach(btn => {
        btn.style.pointerEvents = "none";
    });
}

function restartpointerevents(){
    sudoku.style.pointerEvents = "all";
    solve.style.pointerEvents = "all";
    number_btn.forEach(btn => {
        btn.style.pointerEvents = "all";
    });
}
///////////////////////////////////////


//function for constructing the grid

function make_grid(){
    
    for(let i=1;i<=9;i++){
        
        for(let j=1;j<=9;j++){
            let grid_element = document.createElement("div");
            grid_element.classList.add("grid-element");

            if(j%3==0){
                grid_element.style.borderRight = "2px solid black";
            }
            if(j==1){
                grid_element.style.borderLeft = "2px solid black"
            }
            if(i==1){
                grid_element.style.borderTop = "2px solid black"
            }
            if(i%3==0){
                grid_element.style.borderBottom = "2px solid black";
            }

            let fillspace = document.createElement("input");
            fillspace.classList.add("grid-input"); 
            grid_element.appendChild(fillspace);
            sudoku.appendChild(grid_element);
        }
    }

    make_empty_grid()

}

function make_empty_grid(){
    
    for(let i=0;i<9;i++){
        grid[i]  = []
        for(let j=0;j<9;j++ ){
            grid[i][j] = -1;
        }
    }
    sudoku_array = sudoku.childNodes;
    sudoku_array.forEach(grid_element => {
        grid_element.firstChild.value="";
        grid_element.style.background = "#51FFCF";
    });

}
////////////////////////////////////////////////

//function for stroring the iterations in arrays to be displayed after solving is complete
function fill_collection(gridf){
    grid_collection[a] = [];
    for(let i=0;i<9;i++){
        grid_collection[a][i] = [];
        for(let j=0;j<9;j++){
            grid_collection[a][i][j] = gridf[i][j]; 
        }
    }
    a++;
}

function fill_active_element(r, c){
    active_element_collection[b] = [r, c];
    b++;

}
/////////////////////////////////////////////


//functions for adding and deleting the values, restart button controls

function reinitialize(){
    a = 0, b=0;
    temp = 0;
    grid_collection = [];
    active_element_collection = [];
    curr_active = null;
    tempr = 0;
    tempc = 0;
    found_empty  = false;
    startrunning = false;
}

function restart(){
    make_empty_grid();
    reinitialize();
    restartpointerevents();
}

function add_number(number, curr_active){
    if(curr_active!=null){
        if(number.innerText == "del"){
            curr_active.firstChild.value = "";
        }
        else{
            curr_active.firstChild.value = number.innerText;
        }
    }    
}

function take_values(){

    let grid_values = document.querySelectorAll('.grid-element');
    grid_values = Array.from(grid_values);
    for(let i=0;i<9;i++){
        for(let j=0;j<9;j++){
            let val = grid_values[i*9+j].firstChild.value;
            if(val==""||parseInt(val)>9||parseInt(val)<1||isNaN(parseInt(val))){
                grid[i][j]=-1;
                grid_values[i*9+j].firstChild.value = "";
            }
            else{
                grid[i][j] = parseInt(val);
                grid_values[i*9+j].firstChild.value = grid[i][j];
                if(!valid_grid()){
                    grid[i][j] = -1;
                    grid_values[i*9+j].firstChild.value = "";
                }
            }
        }
    }
}


//function for solving the grid and displaying the process

function fill_grid(){
    let mp = {};
    let row = new Array();
    let col = new Array();
    let gridf = [...grid];
    
    reinitialize();

    for(let i=0;i<3;i++){
        for(let j=0;j<3;j++){
            let mpkey = [i,j];
            mp[mpkey] = [];
            for(let k=1;k<=9;k++){
                mp[mpkey][k] = false;  
            }
        }
    }
    for(let i=0;i<9;i++){
        row[i] = []
        col[i] = []
        for(let j=1; j<=9;j++){
            row[i][j] = 0;
            col[i][j] = 0;
        }
    }

    //initialize according to grid
    for(let i=0;i<9;i++){
        for(let j=0;j<9;j++){
            boxr = parseInt(i/3);
            boxc = parseInt(j/3);
            mp[[boxr,boxc]][grid[i][j]] = true;
            row[i][grid[i][j]] = true;
            col[j][grid[i][j]] = true;

        }
    }

    fillSudoku(0, 0, gridf, mp, row, col);
    
}

function printSolvedSudoku(){
    
    //make inserting and solve unclickable for duration of animation
    deletepointerevents();

    if(temp>=grid_collection.length){
        //stop printing and add all clickability
        restartpointerevents();
        startrunning = false;
        return;
    }
    
    printgrid = grid_collection[temp];
    let grid_values = document.querySelectorAll('.grid-element');
    grid_values = Array.from(grid_values);
    
    let cell_r = active_element_collection[temp][0], cell_c = active_element_collection[temp][1];

    for(let i=0;i<9;i++){
        for(let j=0;j<9;j++){
            if(printgrid[i][j]==-1){
                grid_values[i*9+j].firstChild.value = "";
            }
            else{
                grid_values[i*9+j].firstChild.value = printgrid[i][j];
            }
             
        }
    }

    for(let i=0; i< 9; i++){
        for(let j = 0; j<9;j++){
            if(cell_r==9){
                grid_values[i*9+j].style.background = "#51FFCF";  
            }
            else if(i==cell_r||j==cell_c){
                grid_values[i*9+j].style.background = "rgb(7, 177, 120)";
            }
            else{
                grid_values[i*9+j].style.background = "#51FFCF";
            }
        }
    }
    temp = temp+1;
}


function fillSudoku(r, c, gridf, mp, row, col)
{   
    fill_collection(gridf); //for storing all the iterations to be displayed

    if(r == 9)
    {   
        fill_active_element(-1, -1);
        startrunning = true;
        window.requestAnimationFrame(main);
        return false;
    } //if reached the last cell, stop solving and start animation
    
    if(c == 9)
    {
        fill_active_element(-1, -1);
        if(fillSudoku(r+1, 0, gridf, mp, row, col)){
            return true;
        }
        return false;
    } // if reached last cell of the row, move to next row

    if(gridf[r][c] != -1)
    {
        fill_active_element(-1, -1);
        if(fillSudoku(r, c+1, gridf, mp, row, col)){
            return true;
        }
        return false;
    }// if cell is not empty move to the next cell

    if(!found_empty){ //storing the first empty cell for checking solvabillity
        tempr = r;
        tempc = c;
        found_empty = true;
    }

    let i=1;
    for(i=1; i<=9; i++)
    {
        let boxrow = parseInt(r/3); 
        let boxcol = parseInt(c/3);
        
        if(!mp[[boxrow, boxcol]][i] && !row[r][i] && !col[c][i])
        {
            mp[[boxrow, boxcol]][i] = true;
            row[r][i] = true;
            col[c][i] = true;
            gridf[r][c] = i;
            fill_active_element(r, c);

            if(fillSudoku(r, c+1, gridf, mp, row, col)){
                mp[[boxrow, boxcol]][i] = false;
                row[r][i] = false;
                col[c][i] = false;
                gridf[r][c] = -1;
            }
            else{
                return false;
            }
        }
    }

    //if backtraced to the first empty cell and no number can be filled sudoku is unsolvable
    if(r==tempr&&c==tempc&&i==10|| grid_collection.length>=4e10){
        not_solvable();
        return false;
    }

    return true;
}

//functions for checking whether input grid is valid or not
function rowCheck(row)
{   
    let st = new Set();
    for(let i=0; i<9; i++)
    {   
        if(st.has(grid[row][i]))
            return false;
        
        if(grid[row][i] != -1)
            st.add(grid[row][i]);
    }
    return true;
}

function colCheck(col)
{
    let st = new Set();
    for(let i=0; i<9; i++)
    {
        if(st.has(grid[i][col]))
            return false;
        
        if(grid[i][col] != -1)
            st.add(grid[i][col]);
    }
    return true;
}

function boxCheck(stRow, stCol)
{
    let st = new Set();
    for (let row = 0; row < 3; row++) 
    {
        for (let col = 0; col < 3; col++) 
        {
            let curr = grid[row + stRow][col + stCol];
            if (st.has(curr))
                return false;
            
            if (curr != -1)
                st.add(curr);
        }
    }
    return true;
}

function valid_grid()
{   
    for(let i=0; i<9; i++)
    {
        for(let j=0; j<9; j++)
        {
            if(!rowCheck(i) || !colCheck(j) || !boxCheck(i-i%3, j-j%3))
            {   
                alert("Input Invalid - Elements Repeated");
                return false;
            }
        }
    }
    return true;
}

//If the grid is unsolvable, display message and return
function not_solvable(){
    startrunning = false;
    alert("Sudoku not solvable!!!!!!");
}