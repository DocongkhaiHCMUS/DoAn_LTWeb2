const db = require('./db');

const TBL_Post = 'post';
const TBL_Img_caption = 'image_caption';
const TBL_Tag = 'tag';
const TBL_Tag_Post = 'tag_post';

module.exports = {
    addPost : function(entiy){
        return db.add(TBL_Post,entiy);
    },
    add_img_caption: function(entiy){
        return db.add(TBL_Img_caption,entiy);
    },
    add_tag: function(entiy){
        return db.add(TBL_Tag,entiy);
    },
    add_tag_post: function(entiy){
        return db.add(TBL_Tag_Post,entiy);
    }
};
