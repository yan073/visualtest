var todo_cells;
var high_priority_todo;
var adjacent;
var colormap;
var adjacent_colors;
var colored;

let num_color_space = 4;

function set_leaf_color() {
    let cats = ["leafc1", "leafc2", "leafc3", "leafc4","leafcu"];
    cats.forEach(c => set_color_for_cat(c));
}

function set_color_for_cat(cat){
    todo_cells = [];
    high_priority_todo = [];
    colormap = {};
    adjacent_colors = {};
    colored =[];

    let leaves = document.getElementsByClassName(cat);
    adjacent = find_adjacents(leaves);

    set_color_to_cell(0, cat, leaves);
    while( (todo_cells.length >0 || high_priority_todo.length >0)) {
        let next = high_priority_todo.length >0 ? high_priority_todo.shift() : todo_cells.shift(); 
        set_color_to_cell(next, cat, leaves)
    }
}

function set_color_to_cell(current, cat, leaves){
    if (colored.indexOf(current)<0) {
        var level2 = leaves[current].getAttribute('level2');
        if (level2 == null) {
            level2 = leaves[current].getAttribute('transform');
        }
        let new_c = get_diff_color(adjacent_colors[level2]);
        colored.push(current);
        colormap [current] = new_c;
        let colorclass = cat + '_' + new_c;
        leaves[current].classList.add( colorclass );
        let siblings = get_cells_in_same_level2(level2, leaves);
        for(var i=0;i<siblings.length;i++){
            let next = siblings[i];
            if (next != current) {
                colormap[next] = new_c;
                colored.push(next);
                leaves[next].classList.add( colorclass );
            }
        }
        for(var i=0;i<siblings.length;i++){
            process_neighbor_after_coloring(siblings[i], new_c, level2, leaves);
        }
    }
}

function get_cells_in_same_level2(level2, leaves){
    let samel = [];
    if (level2 != null && level2.length >0) {
        for(var i = 0; i< leaves.length; i++) {
            var nl = leaves[i].getAttribute('level2');
            if (nl==null) {
                nl = leaves[i].getAttribute('transform');
            }
            if (level2 == nl) {
                samel.push(i);
            }
        }
    }
    return samel;
}

function process_neighbor_after_coloring(current, color, level2, leaves){
    let adjs = adjacent[current];
    for(var i=0;i<adjs.length;i++) {
        let neighbor = adjs[i];
        let elem = leaves[neighbor];
        var sibl2 = elem.getAttribute('level2');
        if (sibl2 == null) {
            sibl2 = elem.getAttribute('transform');
        }
        if (sibl2 != level2) {
            if (!(sibl2 in adjacent_colors)) {
                adjacent_colors[sibl2] = [];
            }
            if (adjacent_colors[sibl2].indexOf(color) <0) {
                adjacent_colors[sibl2].push(color);
            }
        }
    }

    for(var i=0;i<adjs.length;i++) {
        let neighbor = adjs[i];
        if(colored.indexOf(neighbor) < 0){
            let elem = leaves[neighbor];
            var sibl2 = elem.getAttribute('level2');
            if (sibl2 == null) {
                sibl2 = elem.getAttribute('transform');
            }
            if (adjacent_colors[sibl2].length >= 3) {
                high_priority_todo.unshift(neighbor);
            }
            else if (adjacent_colors[sibl2].length == 2) {
                if(high_priority_todo.indexOf(neighbor) <0) {
                    high_priority_todo.push(neighbor);
                }
            }
            else {
                if (todo_cells.indexOf(neighbor) <0) {
                    todo_cells.push(neighbor);
                }
            }
        }
    }

}

function get_diff_color(adjcolors) {
    if (adjcolors === undefined) {
        return 1;
    } else {
        for(var i=1; i<=num_color_space; i++) {
            if (adjcolors.indexOf(i) <0) {
                return i;
            }
        }
        return Math.floor(Math.random() * Math.floor(num_color_space)) + 1;
    }
}
