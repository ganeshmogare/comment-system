var postsdbViews = function () {

    var queryMaxId = function (key, values, rereduce) {
        var max = 0;
        for (var i = 0; i < values.length; i++) {
            var id = values[i];
            if (max < id) {
                max = id;
            }
        }

        return max;
    };

    var queryMaxIdWithKey = function (key, values, rereduce) {
        var max = 0;
        for (var i = 0; i < key.length; i++) {
            var id = key[i][0];
            if (max < id) {
                max = id;
            }
        }

        return max;
    };

    this.designDocs = [
    {
        name: 'all_posts_collection',
        version: 3,
        views: [{
            viewName: 'all_posts',
            function: function (doc) {
                var doctype, uidx;
                if (doc._id && (uidx = doc._id.indexOf("_")) > 0) {
                    doctype = doc._id.substring(0, uidx);
                    if (doctype === "p") {
                       emit(doc._id,doc.id)
                    }
                }
            },
            reduceFunction: queryMaxId
        },
        {
            viewName: 'all_active_posts',
            function: function (doc) {
                if(doc.delete){
                    return;
                }
                var doctype, uidx;
                if (doc._id && (uidx = doc._id.indexOf("_")) > 0) {
                    doctype = doc._id.substring(0, uidx);
                    if (doctype === "p") {
                       emit(doc._id,doc.id)
                    }
                }
            }
                }]
    }
    ];

};

module.exports = new postsdbViews();