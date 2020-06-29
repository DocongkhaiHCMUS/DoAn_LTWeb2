const fs = require('fs');

const path = './db/db.json';

module.exports = {
    getData: () => {
        var list = JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }));
        return list;
    },
    setData: (obj) => {
        let data = JSON.stringify(obj,null,2);
        fs.writeFileSync(path, data);
    }
};