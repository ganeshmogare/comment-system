var commentsdbViews = function () {

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

    this.designDocs = [
    {
        name: 'all_comments_collection',
        version: 3,
        views: [{
            viewName: 'all_comments',
            function: function (doc) {
                var doctype, uidx;
                if (doc._id && (uidx = doc._id.indexOf("_")) > 0) {
                    doctype = doc._id.substring(0, uidx);
                    // if (doctype === "C") {
                       emit(doc._id,doc.id)
                    // }
                }
            },
            reduceFunction: queryMaxId
        },
        {
            viewName: 'all_active_comments',
            function: function (doc) {
                if(doc.delete){
                    return;
                }
                var doctype, uidx;
                if (doc._id && (uidx = doc._id.indexOf("_")) > 0) {
                    doctype = doc._id.substring(0, uidx);
                    // if (doctype === "C") {
                       emit(doc.parentId,doc.id);
                    // }
                }
            },
            reduceFunction: queryMaxId
        }]
    }
    ];

};

module.exports = new commentsdbViews();