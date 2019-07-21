'use strict';
var couchView = function() {
    function getDesignDocStr(item, rev) {
        var ddoc = {
            _id: '_design/' + item.name,
            version: item.version,
            views: {}
        };
        if (rev) {
            ddoc._rev = rev;
        }
        ddoc.views[item.name] = {
            map: item.function.toString()
        };

        if (item.filters) {
            ddoc.filters = {};
            for (var i = 0; i < item.filters.length; i++) {
                ddoc.filters[item.filters[i].name] = item.filters[i].function;
            }
        }

        if (item.sort) {
            ddoc.lists = {
                sort: item.sort
            };
        }
        return ddoc;
    }

    function getDesignDocStr2(item, rev) {
        var ddoc = {
            _id: '_design/' + item.name,
            version: item.version,
            views: {},
            filters: {}
        };
        if (rev) {
            ddoc._rev = rev;
        }

        for (var i = 0; i < item.views.length; i++) {
            ddoc.views[item.views[i].viewName] = {
                map: item.views[i].function.toString()
            };

            var reduceFunction = item.views[i].reduceFunction;
            if (reduceFunction) {
                ddoc.views[item.views[i].viewName].reduce = reduceFunction.toString();
            }
        }

        if (item.filters) {
            for (var i = 0; i < item.filters.length; i++) {
                ddoc.filters[item.filters[i].name] = item.filters[i].function;
            }
        }

        return ddoc;
    }


   
    this.generateView = function(viewDocType, viewBody) {
        return 'function(doc) {' +
            'var doctype,' +
            'uidx;' +
            'if (doc._id && (uidx = doc._id.indexOf("_")) > 0) {' +
            'doctype = doc._id.substring(0, uidx);' +
            'if(doctype === "' + viewDocType + '") {' +
            viewBody +
            '}' +
            '}' +
            '}';
    };

    function updateDesignDoc(item, db, rev) {
        console.log('Creating design doc: ', item.name);
        return new Promise(function(resolve, reject) {
            var designDoc = {};
            if ('views' in item) {
                designDoc = getDesignDocStr2(item, rev);
            } else {
                designDoc = getDesignDocStr(item, rev);
            }

            db.insert(designDoc).then(function(resp) {
                resolve(resp);
            }).catch(function(reason) {
                console.log('ERR updateDesignDoc:', reason);
                reject(reason);
            });

        });
    }


    function createDesignDoc(item, db) {
        return new Promise(function(resolve, reject) {
            db.get('_design/' + item.name).then(function(doc) {
                doc = doc[0];
                if (doc.version !== item.version) {
                    updateDesignDoc(item, db, doc._rev).then(function(response) {
                        resolve(response);
                    }).catch(function(reason) {
                        reject(reason);
                    });
                } else {
                    console.log('View Exists with Same Version(Skip Update)');
                    resolve();
                }

            }).catch(function(reason) {
                updateDesignDoc(item, db).then(function(response) {
                    resolve(response);
                }).catch(function(reason) {
                    reject(reason);
                });
            });
        });
    }

    async function oldCreateViews(db, designDocs) {

        var createViewsPromiseArray = [];
        if (designDocs && designDocs.length) {
            designDocs.forEach(function(item) {
                createViewsPromiseArray.push(createDesignDoc(item, db));
            });
        }


        return Promise.all(createViewsPromiseArray).then(function(response) {
            return response;
        }).catch(function(reason) {
            return Promise.reject(reason);
        });
    }

    this.createViews = async function(db, designDocs, newDDocs) {
        if (designDocs) {
            await oldCreateViews(db, designDocs);
        }
    };


}

module.exports = new couchView();