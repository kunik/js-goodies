(function(app) {
    app.goodies.registerNs('app.goodies.template');

    app.goodies.template = createTemplate;

    function createTemplate(template) {
        return createWorker(parse(template || ''));
    };

    var _internalKey = '__template__id__';

    function parse(template) {
        var _template = template + '{' + _internalKey + '}';
        var regex = new RegExp('([^\{]*)\{([^\}]+)\}', 'gs');
        var chunks = []
            , keys = {}
            , placeholders = {}
            , positions = {}
            , currentPosition = 1
            , matchedChunks, key;

        while (matchedChunks = regex.exec(_template)) {
            matchedChunks.shift();
            key = matchedChunks[1];

            matchedChunks[1] = "";
            keys[key] = null;
            placeholders[key] = '{' + key + '}';
            positions[currentPosition] = key;

            currentPosition +=2;
            chunks.push(matchedChunks);
        }

        placeholders[_internalKey] = '';

        return {
            source: template,
            chunks: Array.prototype.concat.apply([], chunks),
            keys: keys,
            placeholders: placeholders,
            positions: positions,
            DOMObjects: {}
        };
    }

    function createWorker(templateData) {
        function worker(data) {
            return render(templateData, data, 'keys');
        }

        worker.preload = function(data) {
            applyData(templateData, data);

            return worker;
        };

        worker.prerender = function() {
            return render(templateData, {}, 'placeholders');
        };

        worker.getSource = function() {
            return templateData.source;
        };

        worker.getData = function() {
            var data = {};
            for (var i in templateData.keys) {
                if (templateData.keys.hasOwnProperty(i) && templateData.keys[i] !== null) {
                    data[i] = templateData.keys[i];
                }
            }

            return data;
        };

        worker.extend = function(data) {
            var value, dataSources = [worker];

            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    value = data[key];

                    if (isTemplate(value)) {
                        dataSources.push(value);
                        value = value.getSource();
                    }

                    templateData.keys[key] = value;
                    templateData.placeholders[key] = value;
                }
            }

            var extendedTemplate = createTemplate(worker.prerender());
            for (var i = 0, cnt = dataSources.length; i < cnt; ++i) {
                extendedTemplate.preload(dataSources[i].getData());
            }

            return extendedTemplate;
        };

        return worker;
    }

    function applyData(templateData, data) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                templateData.keys[key] = data[key];
                templateData.placeholders[key] = data[key];
            }
        }

        return templateData;
    }

    function render(templateData, data, source) {
        var value;

        applyData(templateData, data);
        for (var position in templateData.positions) {
            if (templateData.positions.hasOwnProperty(position)) {
                value = templateData[source][templateData.positions[position]];

                if (isFunction(value)) {
                    templateData.chunks[position] = value(templateData, templateData.positions[position]);
                } else {
                    templateData.chunks[position] = value;
                }
            }
        }

        return templateData.chunks.join('');
    }

    function isFunction(object) {
        return typeof object == 'function';
    }

    function isTemplate(object) {
        return isFunction(object) && isFunction(object.getSource) && isFunction(object.getData);
    }

})(app);
