const readXlsxFile = require('read-excel-file/node');
const moment = require('moment');
const model = require('./model');

// function random premium post
function shuffle(array) {
    var i = array.length,
        j = 0,
        temp;

    while (i--) {
        j = Math.floor(Math.random() * (i + 1));

        // swap randomly chosen element with current element
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}


//Insert post
function insert_Post(file_name) {
    return new Promise(function (resolve, reject) {

        readXlsxFile(file_name, { sheet: 'Sheet1' }).then(async (rows, error, results) => {

            results = []

            let ranNums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
            let pdf = ranNums.slice(0, 5);

            for (let i = 1; i < rows.length; i++) {

                moment.locale('vi');
                let day = moment(rows[i][8], "ddd DD/MM/YYYY - hh:mm").format('YYYY/MM/DD HH:mm:ss');
                let now = moment().format('YYYY/MM/DD HH:mm:ss');
                let ran = Math.floor(Math.random() * (1111 - 11 + 1)) + 11;

                if (pdf.includes(i)) {

                    data = {
                        title: rows[i][1],
                        tiny_des: rows[i][2],
                        full_des: rows[i][3],
                        views: ran,
                        category: rows[i][4],
                        status: 1,
                        premium: 1,
                        pdf: `pdf/${i}.pdf`,
                        avatar: rows[i][5],
                        folder_img: rows[i][6],
                        source: rows[i][7],
                        create_date: now,
                        modifile_date: now,
                        publish_date: day
                    }
                }
                else {
                    data = {
                        title: rows[i][1],
                        tiny_des: rows[i][2],
                        full_des: rows[i][3],
                        views: ran,
                        category: rows[i][4],
                        status: 1,
                        premium: 0,
                        pdf: 'no_pdf',
                        avatar: rows[i][5],
                        folder_img: rows[i][6],
                        source: rows[i][7],
                        create_date: now,
                        modifile_date: now,
                        publish_date: day
                    }
                }

                results.push(data);
                // console.log(data);
                await model.addPost(data);
            }

            if (error) {
                return reject(error);
            }
            resolve(results);

        })
    });
}

//Insert Image caption
function insert_Img_caption(file_name) {
    return new Promise(function (resolve, reject) {
         readXlsxFile(file_name, { sheet: 'Sheet1' }).then(async (rows, error, results) => {

            results = []
            for (let i = 1; i < rows.length; i++) {

                moment.locale('vi');
                let now = moment().format('YYYY/MM/DD HH:mm:ss');

                let data = {
                    name_img: rows[i][1],
                    caption: rows[i][2],
                    folder: rows[i][3],
                    create_date: now,
                    modifile_date: now
                }

                await model.add_img_caption(data);
                // console.log(data);
                results.push(data);

                if (error) {
                    return reject(error);
                }
                resolve(results);
            }
        })

    });
}

//Insert tag
function insert_tag(file_name) {
    return new Promise(function (resolve, reject) {
        readXlsxFile(file_name, { sheet: 'Sheet2' }).then(async (rows, error, results) => {

            results = {}

            for (let i = 1; i < rows.length; i++) {

                moment.locale('vi');
                let now = moment().format('YYYY/MM/DD HH:mm:ss');

                let data = {
                    name: rows[i][1],
                    des: rows[i][1],
                    create_date: now,
                    modifile_date: now
                }

                await model.add_tag(data);

                //add tag and id to dictionary
                results[`${rows[i][1]}`] = i;
            }

            if (error) {
                return reject(error);
            }
            resolve(results);
        })
    });
}


//Insert tag_post
function insert_tag_post(file_name, dict_tag) {
    return new Promise(function (resolve, reject) {

        readXlsxFile(file_name, { sheet: 'Sheet1' }).then(async (rows,error,results) => {

            results=[]
            for (let i = 1; i < rows.length; i++) {

                moment.locale('vi');
                let now = moment().format('YYYY/MM/DD HH:mm:ss');

                let data = {
                    tag: dict_tag[rows[i][1]],
                    post: rows[i][3],
                    create_date: now,
                    modifile_date: now
                }

                await model.add_tag_post(data);
                // console.log(data);

                results.push(data);

                if (error) {
                    return reject(error);
                }
                resolve(results);

            }
        })
    });
}


// FUNCTION Main
async function main(){
    let rs;
    await insert_Post('./All_Post.xlsx');
    await insert_Img_caption('./All_Img_Caption.xlsx'); 
    rs = await insert_tag('./All_Tag.xlsx');
    let rs1 = await insert_tag_post('./All_Tag_Post.xlsx',rs);
    // console.log(rs1);
}

main();
