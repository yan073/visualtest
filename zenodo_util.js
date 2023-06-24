async function get_zenodo_file_url(recid, filename){
    var response = await fetch("https://zenodo.org/api/records/" + recid);
    const info = await response.json();
    response = await fetch(info.links.latest, {
        headers: {
            'Accept': 'application/json'
          }
    });
    const latest = await response.json();
    var fobj = latest.files.find(f => f.key == filename);
    if (fobj === undefined) {
        fobj = latest.files.find(f => f.filename == filename);
        return fobj.links.download;
    }
    return fobj.links.self;
}

async function query_zenodo_json_file(recid, filename, callback) {
    const url = await get_zenodo_file_url(recid, filename);
    const response = await fetch(url);
    callback(null, await response.json())
}

async function query_zenodo_text_file(recid, filename, callback){
    const url = await get_zenodo_file_url(recid, filename);
    const response = await fetch(url);
    callback(await response.text());
}