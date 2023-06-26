var todo_cells;
var high_priority_todo;
var adjacent;
var colormap;
var adjacent_colors;
var colored;
var cath_dict={};
const leaf_tooltip_map = new WeakMap();
let num_color_space = 4;

function set_leaf_color() {
    let cats = ["leafc1", "leafc2", "leafc3", "leafc4","leafcu"];
    cats.forEach(c => set_color_for_cat(c));
    let cats3 = [   "leafc1_1", "leafc1_2", "leafc1_3", "leafc1_4",
                    "leafc2_1", "leafc2_2", "leafc2_3", "leafc2_4",  
                    "leafc3_1", "leafc3_2", "leafc3_3", "leafc3_4",  
                    "leafc4_1", "leafc4_2", "leafc4_3", "leafc4_4"  
                ];
    cats3.forEach(c => set_color_for_cat_level3(c));
}

async function generate_leaf_tooltip(instance) {
    const leaf = instance.reference;
    if( leaf_tooltip_map.get(leaf) == null ) {
        let leaf_colour = get_leaf_colour(leaf.classList);
        var content = `<p><strong><a href="https://aquaria.app/Human/${leaf.dataset.name}" target="_blank">${leaf.dataset.name}</a></strong></p>`;
        const trial_ids = JSON.parse(leaf.dataset.trials);
        const trial_links = `<p><strong>Trials that mention \'${leaf.dataset.name}\'</strong>: ` + get_trial_search(trial_ids) + `</p>`;
        if (leaf_colour == 'c1' || leaf_colour == 'c2' || leaf_colour == 'c3' || leaf_colour == 'c4') {
            var leaf_hue = get_leaf_hue(leaf.classList, leaf_colour);
            var cath_info = []
            const cath_code = leaf.dataset.cath;
            let names = cath_dict[cath_code]; 
            let index = cath_code.indexOf('.');
            cath_info.push(cath_code.substring(0, index));
            index = cath_code.indexOf('.', index +1 );
            cath_info.push(cath_code.substring(0, index));
            index = cath_code.indexOf('.', index +1 );
            cath_info.push(cath_code.substring(0, index));
            cath_info.push(cath_code);
            if ( names == null) { 
                const infoprms = cath_info.map(async (c, index) => query_cath_info(c, index + 1));
                const infoobj = await Promise.all(infoprms);
                names = infoobj.map( o=> o.name);
                if (names.length == 4) {
                    if (names[3] === undefined || names[3] === null || names[3].length ==0) {
                        names[3] = cath_code; 
                    }
                    cath_dict[cath_code] = names;
                }
            }
            if (names.length == 4) {
                content = get_tooltip_domain(leaf.dataset.name, cath_code, names[3])
                content += get_tooltip_class(cath_info[0], names[0], leaf_colour)
                + get_tooltip_architecture(cath_info[1], names[1], leaf_hue)
                + get_tooltip_topo(cath_info[2], names[2]);
                cath_dict[cath_code] = names;
            }
        }  
        content += trial_links; 
        leaf_tooltip_map.set(leaf, content);
        instance.setContent(content);  
    }
}

function get_tooltip_domain(leafname, cath_id, name) {
    let content = `<p><strong><a href="https://aquaria.app/Human/${leafname}" target="_blank">${leafname}</a>`;
    return content +  ` domain <a href="http://www.cathdb.info/browse/sunburst?from_cath_id=${cath_id}"  target="_blank">\'${name}\'</a></strong></p>`;
}

function get_tooltip_class(cath_id, name, leaf_colour) {
    return `<div><svg width ="10" height="10" class="svglegend tc${leaf_colour}"`
            + `><rect width = "10" height="10"/></svg>`
            + `<p><strong>Class: </strong> <a href="http://www.cathdb.info/browse/sunburst?from_cath_id=${cath_id}"  target="_blank">${name}</a></p></div>`;
}

function get_tooltip_architecture(cath_id, name, leaf_hue) {
    return `<div><svg width ="10" height="10" class="svglegend ${leaf_hue}"` 
            + ` ><rect width = "10" height="10" /></svg>`
            + `<p><strong>Architecture: </strong><a href="http://www.cathdb.info/browse/sunburst?from_cath_id=${cath_id}"  target="_blank">${name}</a></p></div>`;
}

function get_tooltip_topo(cath_id, name) {
    return `<p><strong>Topology of this domain: </strong><a href="http://www.cathdb.info/browse/sunburst?from_cath_id=${cath_id}"  target="_blank">${name}</a></p>`;
}

function get_leaf_tooltip(leaf_element) {
    const content = leaf_tooltip_map.get(leaf_element);
    if(content == null) {
        return 'Loading...';
    }
}

async function query_cath_info(cath_id, depth){
    const url = `https://www.cathdb.info/version/v4_3_0/api/rest/cathtree/from_cath_id_to_depth/${cath_id}/${depth}?content-type=application/json`;
    const response = await fetch(url);
    return response.json();
}

function get_trial_search(trial_ids){
    const page_size = 50;
    let total_len = trial_ids.length;
    let pages = [];
    let content = ' (';
    for (let i = 0; i < Math.ceil(total_len/page_size); i++) {
        let start = i*page_size;
        pages.push([start, Math.min(start + page_size, total_len)])
    } 
    content = ' (';
    pages.forEach(function(p){
        if(p[0] > 0){
            content += ', ';
        }
        let tips = trial_ids.slice(p[0], p[1]);
        content += '<a href="https://clinicaltrials.gov/ct2/results?show_xprt=Y&xprt=' + tips.join('+OR+')
                + `" target="_blank">${p[0]+1}-${p[1]}</a>`;
    });
    return content + ')';
}

function get_leaf_hue(clist, colour) {
    const prefix = 'leaf' + colour + '_';
    const iterator = clist.values();
    for(let c of iterator) {
        if (c.startsWith(prefix))
            return c;
    }
    return null;
}

function get_leaf_colour(clist){
    if (clist.contains('leafcu')) return 'cu';
    if (clist.contains('leafc1')) return 'c1';
    if (clist.contains('leafc2')) return 'c2';
    if (clist.contains('leafc3')) return 'c3';
    if (clist.contains('leafc4')) return 'c4';
    return null;
}

function set_color_for_cat_level3(c2) { //"leafc1_1"
    todo_cells = [];
    high_priority_todo = [];
    colormap = {};
    adjacent_colors = {};
    colored =[];
    let leaves = document.getElementsByClassName(c2);
    if (leaves.length >0) {
        adjacent = find_adjacents(leaves);

        set_l3_color_to_cell(0, c2, leaves);
        while( (todo_cells.length >0 || high_priority_todo.length >0)) {
            let next = high_priority_todo.length >0 ? high_priority_todo.shift() : todo_cells.shift(); 
            set_l3_color_to_cell(next, c2, leaves)
        }
    }
}

function get_l3_code(node) {
    let cath_code = node.getAttribute('data-cath'); // "1.10.720.30"
    return cath_code.substring(0,cath_code.lastIndexOf(".")); // "1.10.720"
}

function get_cells_in_same_level3(cath_l3, leaves){
    let samel = [];
    if (cath_l3 != null && cath_l3.length >0) {
        for(var i = 0; i< leaves.length; i++) {
            var nl = get_l3_code(leaves[i]);
            if (cath_l3 == nl) {
                samel.push(i);
            }
        }
    }
    return samel;
}

function process_neighbor_after_coloring_l3(current, color, cath_l3, leaves){
    let adjs = adjacent[current];
    for(var i=0;i<adjs.length;i++) {
        let neighbor = adjs[i];
        let elem = leaves[neighbor];
        var sibl3 = get_l3_code(elem);
        if (sibl3 != cath_l3) {
            if (!(sibl3 in adjacent_colors)) {
                adjacent_colors[sibl3] = [];
            }
            if (adjacent_colors[sibl3].indexOf(color) <0) {
                adjacent_colors[sibl3].push(color);
            }
        }
    }

    for(var i=0;i<adjs.length;i++) {
        let neighbor = adjs[i];
        if(colored.indexOf(neighbor) < 0){
            let elem = leaves[neighbor];

            var sibl3 = get_l3_code(elem);
            if (adjacent_colors[sibl3].length >= 3) {
                high_priority_todo.unshift(neighbor);
            }
            else if (adjacent_colors[sibl3].length == 2) {
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

function set_l3_color_to_cell(current, cat, leaves){ // 0, 'leafc1_1'
    if (colored.indexOf(current)<0) {
        var cath_l3 = get_l3_code(leaves[current])
        let new_c = get_diff_color(adjacent_colors[cath_l3]);
        colored.push(current);
        colormap [current] = new_c;
        let colorclass = cat + '_' + new_c; // 'leafc1_1_2'
        leaves[current].classList.add( colorclass );
        let siblings = get_cells_in_same_level3(cath_l3, leaves);
        for(var i=0;i<siblings.length;i++){
            let next = siblings[i];
            if (next != current) {
                colormap[next] = new_c;
                colored.push(next);
                leaves[next].classList.add( colorclass );
            }
        }
        for(var i=0;i<siblings.length;i++){
            process_neighbor_after_coloring_l3(siblings[i], new_c, cath_l3, leaves);
        }
    }
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
