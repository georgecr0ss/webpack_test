/**
 * Created by veni on 5/12/2015.
 */
var app = {
    //isDay1: false,
    //betsCount: 3,
    //score: {score: 1},
    mockup: function () {
    },

    isTrue: function (bool) {
        return bool === true || bool === "true";
    },
    fontsPath: '//static.streameye.net/html5/templates/horse_racing_resources/fonts/',
    //fontsPath: '//static.streameye.net/fonts/v2/',
    bannerSize: '300x250',
    imagesPath: '//static.streameye.net/html5/templates/flamingball_da/img/',
    assetPath: '//static.streameye.net/html5/templates/chelt16/img/'
    //assetPath: 'img/'
};
// Fitness
(function (app) {
    'use strict';

    function forEach(list, callback) {
        for (var i = 0, length = list.length; i < length; i += 1) {
            if (callback(list[i], i) === false) {
                break;
            }
        }
    }

    function forEachIn(obj, callback) {
        var prop,
            i = 0;

        for (prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (callback(obj[prop], prop, i) === false) {
                    break;
                }
                i += 1;
            }
        }
    }


    var RESIZE_TOMEOUT_MS = 100,
        createElement = function (domEl) {
            var el = {
                options: {
                    fitOnResize: domEl.
                        getAttribute('data-fit-on-resize') || false,
                    verticalAlign: domEl.getAttribute('data-vertical-align') || 'top',
                    horizontalAlign: domEl.getAttribute('data-horizontal-align') || 'left',
                    wrap: domEl.getAttribute('data-nowrap') || false,
                    group: domEl.getAttribute('data-group') || null
                },
                parent: document.createElement('div'),
                dom: document.createElement('div'),
                fontSize: null
            };


            el.parent.setAttribute('style', 'position:relative;width:100%;height:100%');
            el.dom.setAttribute('style', 'position:absolute;top:0;left:0;display:inline-block;text-align:' +
            el.options.horizontalAlign + ';white-space:' + (el.options.wrap === 'true' ? 'nowrap' : 'normal'));

            el.dom.innerHTML = domEl.innerHTML;
            el.parent.appendChild(el.dom);

            return el;
        };


    function Fitness(resizeTimeout) {
        this.elements = [];
        this.onResizeArr = [];
        this.groups = {};
        this.init(resizeTimeout);
    }

    Fitness.prototype.init = function (resizeTimeout) {
        var that = this;
        this.resizeId = 0;

        window.addEventListener('resize', function () {
            clearTimeout(that.resizeId);
            that.resizeId = setTimeout(function () {
                that.fit(that.onResizeArr);
            }, resizeTimeout || 100);
        });
    };
    Fitness.prototype.fit = function (collection) {
        this.fix(collection);
        this.setGroupSize();
        this.setFontSize(collection);
        this.verticalAlign(collection);
    };
    Fitness.prototype.add = function (domEl) {
        var el = createElement(domEl);
        this.elements.push(el);

        domEl.innerHTML = '';
        domEl.appendChild(el.parent);

        if (el.options.fitOnResize === 'true') {
            this.onResizeArr.push(el);
        }

        this.addToGroup(el);
    };
    Fitness.prototype.fix = function (collection) {
        var done = collection.length,

            setWidthAuto = function () {
                forEach(collection, function (item) {
                    item.dom.style.width = 'auto';
                });
            },
            initFitTemp = function () {
                forEach(collection, function (item) {
                    item.fitTemp = {
                        low: 2,
                        high: 600
                    };

                    item.fontSize = null;
                });
            },
            setWidthMax = function () {
                forEach(collection, function (item) {
                    item.dom.style.width = '100%';
                });
            },
            calcSize = function () {
                forEach(collection, function (item) {
                    if (!item.fontSize) {
                        item.fitTemp.size = (item.fitTemp.high + item.fitTemp.low) >> 1;
                    }
                });
            },
            setFontSize = function () {
                forEach(collection, function (item) {
                    if (!item.fontSize) {
                        item.dom.style.fontSize = item.fitTemp.size + 'px';
                    }
                });
            },
            checkDimensions = function () {
                forEach(collection, function (item) {
                    if (!item.fontSize) {
                        item.fitTemp.isIn = (item.dom.offsetHeight <= item.parent.offsetHeight) &&
                        (item.dom.offsetWidth <= item.parent.offsetWidth);
                    }
                });


            },
            evaluate = function () {
                forEach(collection, function (item) {
                    if (!item.fontSize) {
                        if (item.fitTemp.isIn) {
                            item.fitTemp.low = item.fitTemp.size;
                        } else {
                            item.fitTemp.high = item.fitTemp.size;
                        }
                        if ((item.fitTemp.high - item.fitTemp.low) === 1) {
                            item.fontSize = item.fitTemp.low;
                            done -= 1;
                        }
                    }
                });
            };


        setWidthAuto();
        initFitTemp();


        while (done > 0) {
            calcSize();
            setFontSize();
            checkDimensions();
            evaluate();
        }

        setWidthMax();
    };
    Fitness.prototype.setFontSize = function (collection) {
        forEach(collection, function (item) {
            if (item.fontSize) {
                item.dom.style.fontSize = item.fontSize + 'px';
            }
        });
    };
    Fitness.prototype.verticalAlign = function (collection) {
        var getVerticalDiff = function () {
                forEach(collection, function (item) {
                    item.verticalDiff = item.parent.offsetHeight - item.dom.offsetHeight;
                });
            },
            setMargins = function () {
                forEach(collection, function (item) {
                    switch (item.options.verticalAlign) {
                        case 'bottom':
                            item.dom.style.top = 'auto';
                            item.dom.style.bottom = 0;
                            break;

                        case 'middle':
                            item.dom.style.marginTop = (item.verticalDiff >> 1) + 'px';
                            break;

                        default:
                            break;
                    }
                });
            };

        getVerticalDiff();
        setMargins();
    };
    Fitness.prototype.addToGroup = function (el) {
        if (el.options.group) {
            if (!this.groups.hasOwnProperty(el.options.group)) {
                this.groups[el.options.group] = {
                    arr: [],
                    minSize: el.fontSize
                };
            }

            this.groups[el.options.group].arr.push(el);
        }
    };
    Fitness.prototype.setGroupSize = function () {
        var setSmallest = function (group) {
                group.minSize = 99999;

                forEach(group.arr, function (item) {
                    if (item.fontSize < group.minSize) {
                        group.minSize = item.fontSize;
                    }
                });
            },
            setSize = function (group) {
                forEach(group.arr, function (item) {
                    item.fontSize = group.minSize;
                });
            };

        forEachIn(this.groups, function (group) {
            setSmallest(group);
            setSize(group);
        });
    };

    app.Fitness = Fitness;
}(app));
// DPI
(function (app) {
    'use strict';

    function isNotString(obj) {
        return typeof obj !== 'string';
    }

    function DPI() {
        this.modules = [];
        this.DEBUG = false;
    }

    DPI.prototype.getModuleIndex = function (moduleName) {
        var index = -1;
        this.modules.some(function (m, i) {
            if (m.name === moduleName) {
                index = i;
                return true;
            }
            return false;
        });
        return index;
    };
    DPI.prototype.module = function (moduleName, arr) {
        if (isNotString(moduleName)) {
            throw 'The first argument: "moduleName" must be a [String]!';
        } else {
            moduleName = moduleName.trim();
        }

        if (typeof arr === 'function') {
            this.modules.push(new Module(moduleName, [], arr, this));
        } else if (Array.isArray(arr)) {
            this.modules.push(new Module(moduleName, arr, arr.pop(), this));
        } else {
            throw ('The second argument of DPI.module must be an [Array] or a [Function]!');
        }
    };
    DPI.prototype.getModuleArgs = function (module) {
        var that = this,
            result = false,
            args = [];

        module.deps.forEach(function (moduleName) {
            var moduleIndex = that.getModuleIndex(moduleName);
            if (moduleIndex >= 0) {
                if (that.modules[moduleIndex].hasOwnProperty('val')) {
                    args.push(that.modules[moduleIndex].val);
                }
            } else {
                throw 'No such module ' + moduleName + '!';
            }
        });

        if (args.length === module.deps.length) {
            result = args;
        }

        return result;
    };
    DPI.prototype.apply = function () {
        var that = this;
        this.modules.forEach(function (module) {
            if (!module.runned) {
                var args = that.getModuleArgs(module);
                if (args) {
                    module.runned = true;
                    module.run.apply(module, args);
                }
            }
        });
    };
    DPI.prototype.loadScript = function (src, async, callback) {
        var script = document.createElement('script');
        script.src = ('https:' == document.location.protocol ? 'https' : 'http') + ':' + src;
        script.type = 'text/javascript';
        script.async = async || true;
        script.onload = callback;

        var head = document.getElementsByTagName('head')[0];
        head.appendChild(script);
    };

    function Module(name, deps, run, dpi) {
        if (deps.some(isNotString)) {
            throw ('The dependencies of module ' + name + ' must be a [String]!');
        }
        this.name = name;
        this.run = run;
        this.deps = deps;
        this.runned = false;
        this.dpi = dpi;
    }

    Module.prototype.emit = function (obj) {
        if (this.dpi.DEBUG === true) {
            console.log('#DPI> Modue "' + this.name + '" ready.');
        }
        this.val = obj;
        this.dpi.apply();
    };

    app.DPI = DPI;
}(app));

app.dpi = new app.DPI();
app.parseText = function (text, altColor) {
    var repOpen = '<span style="color:' + altColor + '">',
        repClose = '</span>';
    return text.replace(/{/g, repOpen).replace(/}/g, repClose);
};
app.parseOdd = function (text) {
    var repOpen = '<div class="odd">',
        repClose = '</div>';
    text.replace(/{{/g, repOpen).replace(/}}/g, repClose);

    return text.replace(/{{/g, repOpen).replace(/}}/g, repClose);
};
app.dpi.module('documentLoad', [function () {
    var that = this,
        docReadyId = setInterval(function () {
            if ((document.readyState === "interactive" || document.readyState === "complete")) {
                clearInterval(docReadyId);
                that.emit('documentLoad');
            }
        }, 50);
}]);
app.dpi.module('fonts', ['feed', 'documentLoad', function (feed) {
    var that = this,
        css = {
            en: 'bf_fonts_flama_book.css',
            uk: 'bf_fonts_flama_book.css',
            bg: 'bf_fonts_flama_book.css',
            ru: 'bf_fonts_flama_book.css',
            it: 'bf_fonts_flama_book.css',
            dk: 'bf_fonts_flama_book.css',
            da: 'bf_fonts_flama_book.css',
            es: 'bf_fonts_flama_book.css',
            pt: 'bf_fonts_flama_book.css',
            lt: 'bf_fonts_flama_book.css'
        },

        cssFile = css.hasOwnProperty(feed.lang) ? css[feed.lang] : css['en'];

    window.WebFontConfig = {
        custom: {
            families: ['BetFairFlama-Bold', 'BetFairFlama-Medium'],
            urls: [app.fontsPath + cssFile]
        },
        active: function () {
            that.emit('fonts ready');
        }

    };

    app.dpi.loadScript('//ajax.googleapis.com/ajax/libs/webfont/1.5.6/webfont.js', true);
}]);
app.dpi.module('feed', [
    function () {
        var queryParams = getQueryParams(document.location.search),
            ispreview = queryParams.ispreview ? '&ispreview=' + queryParams.ispreview : '',
            feedUrl = '//www.streameye.net/marketdatajsonpfull.aspx?id=' + queryParams.id + ispreview,
            //feedUrl = 'http://chromeye.com/betfair/feeds/Chaltenham2016Feed-route2-test.json?',

            that = this;

        window.jsnopCallback = function (data) {
            that.emit(parseData(data));
        };

        appendScript(feedUrl);

        function appendScript(feedUrl) {
            var script = document.createElement('script');
            script.type = "application/javascript";
            script.async = true;
            script.src = feedUrl + '&callback=jsnopCallback';
            document.getElementsByTagName('head')[0].appendChild(script);
        }

        function parseData(data) {

            var lineHeight = 0;
            switch (data.lang) {
                case 'en':
                    lineHeight = 0.92;
                    break;
                case 'uk':
                    lineHeight = 0.92;
                    break;
                case 'es':
                    lineHeight = 0.92;
                    break;
                case 'bg':
                    lineHeight = 0.92;
                    break;
                case 'it':
                    lineHeight = 0.92;
                    break;
                case  'da' :
                    lineHeight = 0.92;
                    break;
                case   'dk':
                    lineHeight = 0.92;
                    break;
                case 'pt':
                    lineHeight = 0.92;
                    break;
                default:
                    lineHeight = 0.90;
                    break;
            }
//            console.log(lineHeight + " " + data.lang);
            data.queryParams = queryParams;
            //data.queryParams.clickTAG = fixclickTAG(data.queryParams.clickTAG);
            //data.target = data.target || '_blank';
            data.looping = fixLooping(data.looping);
            data.lang = data.lang || 'en';
            data.lineHeight = lineHeight;
            //data.isBoomScreen = app.isTrue(data.isBoomScreen) ? true : false;

            return data;
        }

        //function fixclickTAG(clickTAG) {
        //    return (!clickTAG || clickTAG.indexOf('mpvc') >= 0 || clickTAG.indexOf('//') < 0) ? null : clickTAG;
        //}

        function fixLooping(looping) {
            var l = parseInt(looping);
            if (!l) l = 1;
            return l;
        }

        function getQueryParams(qs) {
            qs = qs.split("+").join(" ");

            var params = {},
                tokens,
                re = /[?&]?([^=]+)=([^&]*)/g;

            while (tokens = re.exec(qs)) {
                params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
            }

            return params;
        }
    }
]);

app.dpi.module('terms', ['feed', 'documentLoad',
    function (feed) {
        var terms = document.createElement('div');
        var temsLang = '';
        terms.id = 'terms';

        switch (feed.lang) {
            case 'en':
                terms.className = 'english';
                temsLang = '<div class="plus18"></div><div> gambleaware.co.uk,<br>T&amp;C&nbsp;Apply</div>';
                break;
            case 'uk':
                terms.className = 'english';
                temsLang = '<div class="plus18"></div><div> gambleaware.co.uk,<br>T&amp;C&nbsp;Apply</div>';
                break;
            case 'es':
                terms.className = 'spanish';
                temsLang = '<div class="plus18"></div><div> Promoción sujeta a T&amp;C.<br> Juega con responsabilidad</div></div>';
                break;
            case 'bg':
                terms.className = 'bulgarian';
                temsLang = '<div class="plus18"></div><div>Моля, играйте разумно.<br >Правила &amp; Условия.</div></div>';
                break;
            case 'it':
                terms.className = 'italian';
                temsLang = '<div>Il gioco può causare dipendenza.<br>Conc. n. 15211</div></div><div class="italian-img"></div>';
                break;
            case 'da' :
                terms.className = 'denmark';
                temsLang = '<div class="plus18"></div>' +
                '<div class="dk-crown"></div>' +
                '<div>Vilkår gælder</div>';
                break;
            case 'dk':
                terms.className = 'denmark';
                temsLang = '<div class="plus18"></div>' +
                '<div class="dk-crown"></div>' +
                '<div>Vilkår gælder</div>';
                break;
            case 'pt':
                terms.className = 'portugal';
                temsLang = '<div class="plus18"></div>';
                break;
            default:
                terms.className = 'other';
                temsLang = '<div></div>';
                break;
        }

        terms.innerHTML = temsLang;

        this.emit(terms);
    }
]);
app.dpi.module('cta', ['feed', 'fonts', 'documentLoad',
    function (feed) {
        //var cta = document.getElementById('cta');
        //cta.innerHTML = feed.text_cta;
        ////arrow
        //var arrow = document.createElement('div');
        //arrow.setAttribute('id', 'arrow');
        //cta.appendChild(arrow);


        var cta = document.getElementById('cta');
        var textCta = feed.text_cta.replace(/\n/g, "<br>");
        cta.innerHTML = textCta;
        cta.style.lineHeight = feed.lineHeight;
        cta.setAttribute('data-vertical-align', 'middle');
        cta.setAttribute('data-horizontal-align', 'center');

        var arrow = document.createElement('div');
        arrow.setAttribute('id', 'arrow');

        applyFontSize.call(this, this.data);
        cta.appendChild(arrow);

        function applyFontSize(data) {
            var fitness = new app.Fitness();
            fitness.add(cta);
            fitness.fit(fitness.elements);
        }

        this.emit();
    }
]);
app.dpi.module('logo', ['feed', 'documentLoad',
    function (feed) {
        var self = this;
        document.getElementById('logo').style.backgroundImage = 'url(' + app.imagesPath + feed.logo + ')';
        var introLogo = document.getElementById('introLogo');
        introLogo.style.backgroundImage = 'url(' + app.imagesPath + feed.logo + ')';
        //document.getElementById('logo')
        //    .style.backgroundImage = 'url(img/'  + feed.logo + ')';

        var img = new Image();
        img.onload = function () {
            self.emit('logo ready');
        }
        img.src = app.imagesPath + feed.logo;
    }
]);
//
//app.dpi.module('BackgroundAsset', ['feed', 'documentLoad',
//    function (feed) {
//        var that = this;
//        var animationAsset = feed.asset_small;
//
//        document.getElementById('flamingBallBg')
//            .style.backgroundImage = 'url(' + animationAsset + ')';
//
//        if (app.isTrue(feed.hasIntroAnimation)) {
//            var img = new Image();
//            img.onload = function () {
//                that.emit('background asset ready');
//            }
//            img.src = feed.asset_small;
//        } else {
//            that.emit('background asset ready');
//        }
//    }
//]);


//app.dpi.module('SvgLinesAnimation', ['feed', 'documentLoad',
//    function (feed) {
//        var is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
//
//        var scaleShow = 0.45;
//        var scaleHide = 0.55;
//
//        var leftLinesShow = 0.5,
//            righLinesShow = 0.6,
//            leftLinesHide = 0.8,
//            righLinesHide = 0.9;
//
//
//        function SvgLinesAnimation() {
//
//            //FirtsLeft-FourthRight
//            var left1Right4 = tweenLeft1Right4();
//
//            function tweenLeft1Right4() {
//
//                var self = this;
//
//                self.tweenLeft1Right4 = new TimelineLite({
//                    paused: true
//                });
//                self.tweenHideLeft1Right4 = new TimelineLite({
//                    paused: true
//                });
//
//                var linesStartTime = 0;
//
//                if (is_firefox) {
//
//                    self.tweenLeft1Right4
//                        .to(".leftPath", 0, {clip: 'rect(0px, 300px, 150px, 250px)'})
//                        .to(".rightPath", 0, {clip: 'rect(0px, 0px, 150px, 0px)'})
//                        .to("#svgLines", 0, {opacity: 1}, linesStartTime)
//
//                        .to("#leftLine11", 0.3, {clip: 'rect(0px, 300px, 250px, 0px)'}, 0)
//                        .to("#rightLine44", 0.6, {clip: 'rect(0px, 300px, 250px, 0px)'}, '-=0.2')
//
//                    self.tweenHideLeft1Right4
//                        .to("#leftLine11", 0.6, {clip: 'rect(0px,  0px, 150px, 0px)'}, 0)
//                        .to("#rightLine44", 0.7, {clip: 'rect(0px, 0px, 250px, 250px)'}, '-=0.3')
//                        .to('#svgLines', 0.5, {opacity: 0}, '-=0.4')
//                    scaleShow = 1.8;
//                    scaleHide = 1.8;
//                } else {
//
//                    self.tweenLeft1Right4
//                        .to("#svgLines", 0, {opacity: 1}, linesStartTime)
//                        .from('#clipShapeLeft11', 0.18, {x: 600}, linesStartTime)
//                        .from('#clipShapeRight44', 0.18, {x: -600}, linesStartTime)
//
//                    self.tweenHideLeft1Right4
//                        .to('#clipShapeLeft11', 0.5, {x: -600}, 0)
//                        .to('#clipShapeRight44', 0.5, {x: 600}, 0)
//                        .to('#svgLines', 0.5, {opacity: 0}, '-=0.1')
//
//                }
//                console.log(scaleHide + " " + scaleShow)
//
//                self.tweenLeft1Right4.timeScale(scaleShow);
//                self.tweenHideLeft1Right4.timeScale(scaleHide);
//
//
//                function restartTween(offset) {
//                    self.tweenLeft1Right4.restart();
//                }
//
//                function tweenHideLines(offset) {
//                    self.tweenHideLeft1Right4.restart();
//                }
//
//                return {
//                    restartTween: restartTween,
//                    tweenHideLines: tweenHideLines,
//                    //linesDuration: self.tweenLeft1Right4.duration() * scaleShow,
//                    //linesHideDuration: self.tweenHideLeft1Right4.duration() * scaleHide
//                };
//
//            }
//
////LeftFourth-RightFirst
//            var left4Right1 = tweenLeft4Right1();
//
//            function tweenLeft4Right1() {
//
//                var self = this;
//                self.tweenLeft4Right1 = new TimelineLite({
//                    paused: true
//                });
//                self.tweenHideLeft4Right1 = new TimelineLite({
//                    paused: true
//                });
//
//                var linesStartTime = 0;
//
//                if (is_firefox) {
//                    self.tweenLeft4Right1
//                        .to(".leftPath", 0, {clip: 'rect(0px, 300px, 150px, 250px)'})
//                        .to(".rightPath", 0, {clip: 'rect(0px, 0px, 150px, 0px)'})
//                        .to("#svgLines", 0, {opacity: 1}, linesStartTime)
//
//                        .to("#leftLine44", 0.4, {clip: 'rect(0px, 300px, 250px, 0px)'}, 0)
//                        .to("#rightLine11", 0.6, {clip: 'rect(0px, 300px, 250px, 0px)'}, '-=0.2')
//
//                    self.tweenHideLeft4Right1
//                        .to("#leftLine44", 0.6, {clip: 'rect(0px,  0px, 450px, 0px)'}, 0)
//                        .to("#rightLine11", 0.6, {clip: 'rect(0px, 0px, 250px, 250px)'}, '-=0.3')
//                        .to('#svgLines', 0.5, {opacity: 0}, '-=0.3')
//
//                    scaleShow = 2;
//                    scaleHide = 1.8;
//
//                } else {
//
//                    self.tweenLeft4Right1
//                        .to("#svgLines", 0, {opacity: 1}, linesStartTime)
//                        .from('#clipShapeLeft44', 0.18, {x: 600}, linesStartTime)
//                        .from('#clipShapeRight11', 0.18, {x: -600}, linesStartTime)
//
//                    self.tweenHideLeft4Right1
//                        .to('#clipShapeLeft44', 0.5, {x: -600}, 0)
//                        .to('#clipShapeRight11', 0.5, {x: 600}, 0)
//                        .to('#svgLines', 0.5, {opacity: 0}, '-=0.3')
//                }
//
//
//                console.log(scaleHide + " " + scaleShow)
//
//                self.tweenLeft4Right1.timeScale(scaleShow);
//                self.tweenHideLeft4Right1.timeScale(scaleHide);
//
//                function restartTween(offset) {
//                    self.tweenLeft4Right1.restart();
//                }
//
//                function tweenHideLines(offset) {
//                    self.tweenHideLeft4Right1.restart();
//                }
//
//
//                return {
//                    restartTween: restartTween,
//                    tweenHideLines: tweenHideLines,
//                    //linesDuration: self.tweenLeft1Right4.duration() * scaleShow,
//                    //linesHideDuration: self.tweenHideLeft1Right4.duration() * scaleHide
//                };
//
//            }
//
//            //All Lines
//
//
//            function allLines() {
//
//                var self = this;
//                self.tween = new TimelineLite({
//                    paused: true
//                    //timeScale:0.1
//                });
//                self.tweenHide = new TimelineLite({
//                    paused: true
//                });
//
//                var linesStartTime = 0;
//
//                if (is_firefox) {
//
//                    self.tween
//                        .to(".leftPath", 0, {clip: 'rect(0px, 300px, 150px, 250px)'}, 0)
//                        .to(".rightPath", 0, {clip: 'rect(0px, 0px, 150px, 0px)'}, 0)
//                        .to("#svgLines", 0, {opacity: 1}, linesStartTime)
//
//
//                        .to("#rightLine1", 0.5, {clip: 'rect(0px, 300px, 250px, 0px)'}, 0)
//                        .to("#rightLine2", 0.5, {clip: 'rect(0px, 300px, 250px, 0px)'}, 0)
//                        .to("#rightLine3", 0.5, {clip: 'rect(0px, 300px, 250px, 0px)'}, 0)
//                        .to("#rightLine4", 0.5, {clip: 'rect(0px, 300px, 250px, 0px)'}, 0)
//
//                        .to("#leftLine1", 0.08, {clip: 'rect(0px, 300px, 250px, 0px)'}, 0)
//                        .to("#leftLine2", 0.08, {clip: 'rect(0px, 300px, 250px, 0px)'}, 0)
//                        .to("#leftLine4", 0.08, {clip: 'rect(0px, 300px, 250px, 0px)'}, 0)
//                        .to("#leftLine3", 0.08, {clip: 'rect(0px, 300px, 250px, 0px)'}, 0)
//
//
//                    self.tweenHide
//                        .to("#rightLine4", 0.5, {clip: 'rect(0px, 0px, 250px, 250px)'}, 0)
//                        .to("#rightLine3", 0.5, {clip: 'rect(0px, 0px, 250px, 250px)'}, 0)
//                        .to("#rightLine1", 0.5, {clip: 'rect(0px, 0px, 250px, 250px)'}, 0)
//                        .to("#rightLine2", 0.5, {clip: 'rect(0px, 0px, 250px, 250px)'}, 0)
//
//                        .to("#leftLine1", 0.08, {clip: 'rect(0px,  0px, 150px, 0px)'}, 0)
//                        .to("#leftLine2", 0.08, {clip: 'rect(0px,  0px, 150px, 0px)'}, 0)
//                        .to("#leftLine4", 0.08, {clip: 'rect(0px,  0px, 150px, 0px)'}, 0)
//                        .to("#leftLine3", 0.08, {clip: 'rect(0px,  0px, 150px, 0px)'}, 0)
//
//                        .to('#svgLines', 0.5, {opacity: 0}, '-=0.4')
//                    //
////
//                    scaleShow = 1;
//                    scaleHide = 0.6;
//
//                } else {
//
//                    self.tween
//                        .to("#svgLines", 0, {opacity: 1}, linesStartTime)
//                        //.to(['#clipShapeRight1', '#clipShapeRight2', '#clipShapeRight3', '#clipShapeRight4'], 0, {x: 150}, 0)
//                        //.to(['#clipShapeLeft1', '#clipShapeLeft2', '#clipShapeLeft3', '#clipShapeLeft4'], 0, {x: -150}, 0)
//                        .from('#clipShapeRight1', 0.3, {x: -300}, 0)
//                        .from('#clipShapeRight2', 0.3, {x: -300}, 0)
//                        .from('#clipShapeRight3', 0.3, {x: -300}, 0)
//                        .from('#clipShapeRight4', 0.3, {x: -300}, 0)
//
//                        .from('#clipShapeLeft1', 0.3, {x: 300}, 0)
//                        .from("#clipShapeLeft2", 0.3, {x: 300}, 0)
//                        .from('#clipShapeLeft3', 0.3, {x: 300}, 0)
//                        .from("#clipShapeLeft4", 0.3, {x: 300}, 0)
//                    //
//
//                    self.tweenHide
//                        .to('#clipShapeRight4', 0.5, {x: 150}, 0)
//                        .to('#clipShapeRight3', 0.5, {x: 150}, 0)
//                        .to('#clipShapeRight1', 0.5, {x: 150}, 0)
//                        .to('#clipShapeRight2', 0.5, {x: 150}, 0)
//
//                        .to('#clipShapeLeft1', 0.5, {x: -150}, 0)
//                        .to('#clipShapeLeft2', 0.5, {x: -150}, 0)
//                        .to('#clipShapeLeft3', 0.5, {x: -150}, 0)
//                        .to('#clipShapeLeft4', 0.5, {x: -150}, 0)
//
//
//                        .to('#svgLines', 0.5, {opacity: 0}, '-=0.4')
//                    scaleShow = 1;
//                    scaleHide = 0.8;
//                    //                self.tweenHide2
//
//
//                }
//
//                console.log(scaleHide + " " + scaleShow);
//                self.tween.timeScale(scaleShow);
//                self.tweenHide.timeScale(scaleHide);
//
//                //console.log("show svg " + self.tween.duration()*scaleShow);
//                //console.log("hide svg " + self.tweenHide.duration()*scaleHide);
//
//                function restartTween() {
//                    self.tween.restart();
//                }
//
//                function tweenHideLines() {
//                    self.tweenHide.restart();
//                }
//
//                var objArr = {
//                    restartTween: restartTween,
//                    tweenHideLines: tweenHideLines
//                    //linesDuration: self.tween.duration() * scaleShow,
//                    //linesHideDuration: self.tweenHide.duration() * scaleHide
//                };
//                return objArr;
//            }
//
//            var lines = allLines();
//            console.log(lines);
//            return {
//                Left1Right4: left1Right4,
//                Left4Right1: left4Right1,
//                allLines: lines
//            };
//
//        }
//
////        var tweenLeft1Right4 = tweenLeft1Right4();
////        var left4Right1 = left4Right1();
////        var allLines = allLines();
//
//        this.emit(SvgLinesAnimation);
//
//
////        this.emit(left4Right1);
////        this.emit(tweenLeft1Right4);
//    }
//]);


app.dpi.module('IntroHorse', ['feed', 'terms', 'documentLoad', 'fonts',
    function (feed, terms) {
        var i, len, that = this;
        var screens = feed.screens;
        var screenAvailable = false;

        for (i = 0, len = screens.length; i < len; i += 1) {
            if (screens[i].scrName === 'IntroHorse') {
                screenAvailable = true;
                break;
            }
        }

        function IntroHorse(data, onComplete, isFinalScreen, checkLoop) {
            var self = this;
            //ToDo: load asset
            var asset = data.asset;
            this.banner = document.getElementById('banner');

            var txt1 = data.txt1.trim();
            var txt2 = data.txt2.trim();
            this.hasText = ((txt1 !== '' && typeof txt1 !== 'undefined' && txt1 !== null) ||
            (txt2 !== '' && typeof txt2 !== 'undefined' && txt2 !== null) );

            this.assetContainer = document.getElementById('assetContainer');

            this.onComplete = onComplete;
            this.isFinalScreen = isFinalScreen;
            this.tapBoom = document.createElement('div');
            this.tapBoom.id = 'tapBoom';

            this.header = document.createElement('div');

            this.topLine = document.createElement('div');
            this.botLine = document.createElement('div');
            this.topLine.id = 'topLine';
            this.botLine.id = 'bottomLine';

            this.longContainer = document.getElementById('longContainer');
            this.boxMsg = document.createElement('div');

            this.asset = document.createElement('div');
            this.rail = document.createElement('div');
            this.rail.id = 'rail';
            this.leftDirt = document.createElement('div');
            this.rightDirt = document.createElement('div');
            this.leftDirt.id = 'leftDirt';
            this.rightDirt.id = 'rightDirt';


            this.header.id = 'header';
            this.header.className = 'text boxMsg';
            this.header.setAttribute('data-vertical-align', 'middle');
            this.header.setAttribute('data-horizontal-align', 'center');
            //this.boxMsg.style.lineHeight = feed.lineHeight;
            this.header.style.lineHeight = 1;
            //this.boxMsg.style.fontStyle = 'italic';
            var text = feed.boxMsg.replace(/\n/g, "<br>");
            if (feed.day1 !== '' && typeof feed.day1 !== 'undefined' && feed.day1 !== null) {
                text += '<span style="color:#FFB80C"><br>' + feed.day1 + '</span>';
            }
            this.header.innerHTML = app.parseText(text, feed.boxAltClr);
            this.header.style.color = feed.boxClr;


            this.boxMsg.id = 'boxMsg';
            //Long Black Box text
            this.boxMsg.className = 'text boxMsg';
            this.boxMsg.setAttribute('data-vertical-align', 'middle');
            this.boxMsg.setAttribute('data-horizontal-align', 'center');
            //this.boxMsg.style.lineHeight = feed.lineHeight;
            this.boxMsg.style.lineHeight = 1;
            //this.boxMsg.style.fontStyle = 'italic';
            var text = feed.boxMsg.replace(/\n/g, "<br>");
            this.boxMsg.innerHTML = app.parseText(text, '#000000');
            this.boxMsg.style.color = '#000000';

            if (this.hasText) {
                this.topText = document.createElement('div');
                this.botText = document.createElement('div');
                //top  text
                this.topText.className = 'text topText';
                this.topText.setAttribute('data-vertical-align', 'bottom');
                this.topText.setAttribute('data-horizontal-align', 'center');
                this.topText.style.lineHeight = feed.lineHeight;
                var text = data.txt1.trim().replace(/\n/g, "<br>");

                this.topText.innerHTML = app.parseText(text, data.altColor);
                this.topText.style.color = data.color;

                //bottom  text
                this.botText.className = 'text botText';
                this.botText.setAttribute('data-vertical-align', 'top');
                this.botText.setAttribute('data-horizontal-align', 'center');
                this.botText.style.lineHeight = feed.lineHeight;
                var text = data.txt2.trim().replace(/\n/g, "<br>");

                this.botText.innerHTML = app.parseText(text, data.altColor);
                this.botText.style.color = data.color;

                this.banner.appendChild(this.topText);
                this.banner.appendChild(this.botText);
            }

            //Asset
            //var assetUrl = app.imagesPath + asset;
            this.asset.id = 'horse';
            var assetUrl = app.assetPath + 'horse.png';
            //this.asset.style.backgroundImage = 'url(' + assetUrl + ')';
            var img = new Image();
            var self = this;
            img.onload = function () {
                self.asset.style.backgroundImage = 'url(' + assetUrl + ')';
            }
            img.src = assetUrl;

            //DIRT Images
            var dirt1Name = 'dirt1.png'
            var dirt1Url = app.assetPath + dirt1Name;
            //this.asset.style.backgroundImage = 'url(' + assetUrl + ')';
            var img = new Image();
            img.onload = function () {
                self.leftDirt.style.backgroundImage = 'url(' + dirt1Url + ')';
            }
            img.src = dirt1Url;

            var dirt2Name = 'dirt2.png'
            var dirt2Url = app.assetPath + dirt2Name;
            //this.asset.style.backgroundImage = 'url(' + assetUrl + ')';
            var img = new Image();
            img.onload = function () {
                self.rightDirt.style.backgroundImage = 'url(' + dirt2Url + ')';
            }
            img.src = dirt2Url;

            //Rail Image load
            var rail = 'rail.svg'
            var railUrl = app.assetPath + rail;
            //this.asset.style.backgroundImage = 'url(' + assetUrl + ')';
            var img = new Image();
            img.onload = function () {
                self.rail.style.backgroundImage = 'url(' + railUrl + ')';
            }
            img.src = railUrl;


            var tapBoomImg = 'ttb-tall.svg'
            var boomUrl = app.assetPath + tapBoomImg;
            // this.tapBoom.style.backgroundImage = 'url(' + boomUrl + ')';
            var img = new Image();
            img.onload = function () {
                self.tapBoom.style.backgroundImage = 'url(' + boomUrl + ')';
            }
            img.src = boomUrl;

            if (navigator.userAgent.indexOf('Mac OS X') != -1) {
                this.header.style.paddingTop = '1px';
                this.boxMsg.style.paddingTop = '1px';
            }


            this.banner.appendChild(this.header);

            this.assetContainer.appendChild(this.asset);
            this.banner.appendChild(this.rail);
            this.assetContainer.appendChild(this.leftDirt);
            this.assetContainer.appendChild(this.rightDirt);

            this.banner.appendChild(this.tapBoom);
            this.longContainer.appendChild(this.topLine);
            this.longContainer.appendChild(this.boxMsg);
            this.longContainer.appendChild(this.botLine);

            this.init(data, checkLoop);
        }

        IntroHorse.prototype.init = function (data, checkLoop) {
            var
                self = this,
            //topTxtHeight = this.topText.getBoundingClientRect().height,
            //botTxtHeight = this.botText.getBoundingClientRect().height,
                self = this,
                arrow = document.getElementById("arrow"),
                terms = document.getElementById("terms"),
                cta = document.getElementById("cta"),
                logo = document.getElementById("logo"),
                svg = document.getElementById('simpleSvg');

            var arrowTween = new TimelineLite({
                paused: true
            });
            arrowTween
                .to(arrow, 0.1, {right: 0, ease: Back.easeIn.config(1)}, '+=0')
                .to(arrow, 0.2, {right: 5, ease: Back.easeIn.config(1)}, '+=0')
                .to(arrow, 0.1, {right: 0, ease: Back.easeIn.config(1)})
                .to(arrow, 0.2, {right: 5, ease: Back.easeIn.config(1)})

            function startArrow() {
                arrowTween.restart();
            }

            var shakeTween = new TimelineMax({repeat: -1, repeatDelay: 0, paused: true});
            shakeTween.
                fromTo(self.asset, 0.9, {y: '-=0.3'}, {
                    y: '+=0.3',
                    ease: RoughEase.ease.config({
                        template: Linear.easeNone,
                        strength: 9,
                        points: 20,
                        taper: "none",
                        randomize: false,
                        clamp: false
                    })
                })

            var shakeIt = function shakeIt() {
                shakeTween.restart();
            }
            var stopShake = function stopShake() {
                shakeTween.pause(0);
            }
            self.stopTheShake = stopShake;


            this.tween = new TimelineMax({
                paused: true,
                onComplete: this.onComplete
            });

            this.tween
                .set([self.leftDirt, self.asset, self.rail], {autoAlpha: 1})
                .set('#introLogo', {transformOrigin: "50% 50%", top: 255})
                .from('#introLogo', 0.9, {
                    scale: 0.3,
                    autoAlpha: 0,
                    force3D: true,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    transformPerspective: 1000,
                    ease: Back.easeOut.config(1)
                }, '+=0.3')
                .from(self.tapBoom, 0.3, {
                    scale: 0,
                    force3D: true,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    transformPerspective: 1000,
                    ease: Back.easeOut.config(1)
                }, '-=.9')
                .to('#introLogo', 0.5, {y: '-=65px', ease: Sine.easeIn}, '+=0.5')


                .to(self.longContainer, 0.5, {clip: "rect(0px, 120px, 55px, 0px)", ease: Power0.easeNone}, '-=0.5')
                .to(self.tapBoom, 0.35, {
                    scale: 0,
                    force3D: true,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    transformPerspective: 1000,
                    ease: Back.easeIn.config(1)
                }, '-=0.5')
                //.to(self.tapBoom, 0.5, {y: '-=55px', ease: Sine.easeIn}, '-=0.5')
                .from('#footer', 0.5, {bottom: -80, ease: Sine.easeOut}, '-=.4')
                .from('#cta', 0.5, {bottom: -25, ease: Sine.easeOut}, '-=0')

                .to(self.topLine, 0.4, {clip: "rect(0px, 120px, 1px, 0px)", ease: Sine.easeOut}, '-=0.5')
                .to(self.botLine, 0.4, {clip: "rect(0px, 120px, 1px, 0px)", ease: Sine.easeOut}, '-=.4')

                .to(self.topLine, 0.25, {clip: "rect(0px, 300px, 1px, 300px)", ease: Sine.easeIn}, '+=1.5')
                .to(self.botLine, 0.25, {clip: "rect(0px, 0px, 1px, 0px)", ease: Sine.easeIn}, '-=.25')
                .to(self.boxMsg, 0.25, {autoAlpha: 0, ease: Sine.easeIn}, '-=.25')
                //.to(self.tapBoom, 0.25, {
                //    scale: 0,
                //    force3D: true,
                //    z: 0.1, /* add this for the jitter bug */
                //    rotationZ: "0.01deg", /* add this for the jitter bug */
                //    transformPerspective: 1000,
                //    ease: Back.easeIn.config(1)
                //}, '-=0.25')

                .to('#introLogo', 0.5, {y: '-=185px', ease: Sine.easeOut})
                .to('#header', 0.2, {clip: "rect(0px, 120px, 55px, 0px)", ease: Power0.easeNone}, '-=0.25')

                //HORSE
                .to(self.rail, 0.4, {bottom: 65, ease: Sine.easeOut}, '-=0')
                .to(self.rail, 2.5, {
                    x: '-=100px', scale: 1,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    force3D: false, ease: Power0.easeNone
                }, '-=0')

                .to(self.assetContainer, 3.5, {
                    x: '+=430px',
                    force3D: false,
                    ease: SlowMo.ease.config(0.2, 0.9, false),
                    onComplete: stopShake
                }, '-=2.5')
                .to(self.asset, 0.7, {
                    y: '-=50px',
                    scale: 0.8,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    force3D: false,
                    ease: Sine.easeOut,
                    onStart: shakeIt
                }, '-=3.5')
                .to(self.asset, 0.6, {
                    scale: 1.1,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    force3D: false,
                    ease: Sine.easeIn
                }, '-=0.5')

                .to(self.leftDirt, 3.2, {y: '-=40px', x: '+=20', force3D: false, ease: SteppedEase.config(40)}, '-=3.7')
                .to(self.rightDirt, 3.2, {
                    y: '-=20px',
                    x: '+=20',
                    force3D: false,
                    ease: SteppedEase.config(40)
                }, '-=3')
                //.set(self.rail, {autoAlpha: 0, ease: Sine.easeOut}, '-=0.8')
                .to([self.leftDirt, self.asset, self.rail], 0.3, {autoAlpha: 0, ease: Sine.easeOut}, '-=0.5')

            //text screen
            //.from(this.topText, 0.5, {y: '40px', autoAlpha: 0, ease: Elastic.easeOut.config(1, 0.3)}, '-=2.8')
            //.to(this.topText, 0.5, {y: '-' + (topTxtHeight + 2 ), ease: Elastic.easeOut.config(1, 0.3)}, '-=1.8')
            //.from(this.botText, 0.5, {y: '40px', autoAlpha: 0, ease: Elastic.easeOut.config(1, 0.3)}, '-=1.8')
            if (this.hasText) {
                this.tween
                    .to(this.topText, 0.35, {clip: " rect(0px, 120px, 90px, 0px)", ease: Sine.easeOut}, '-=3.5')
                    .to(this.botText, 0.35, {clip: " rect(0px, 120px, 90px, 0px)", ease: Sine.easeOut}, '-=3.5')
            }


            if (this.isFinalScreen) {
                this.tween
                    .to(arrow, 0.6, {onStart: startArrow, onComplete: checkLoop}, '-=2')
            }

            //.to(this.botText, 0.15, {y: "+=25px", autoAlpha: 0, ease: Sine.easeOut}, '+=0.3')
            //.to(this.topText, 0.15, {y: "+=25px", autoAlpha: 0, ease: Sine.easeOut}, '-=.05')
            if (this.hasText) {
                this.tween
                    .to(this.topText, 0.3, {clip: " rect(0px, 0px, 90px, 0px)", ease: Sine.easeOut}, '+=0.1')
                    .to(this.botText, 0.3, {clip: " rect(0px, 120px, 90px, 120px)", ease: Sine.easeOut}, '-=0.3')
            }

            if (this.isFinalScreen) {
                this.tween
                    .to('#header', 0.5, {clip: "rect(25px 60px 25px 60px)", ease: Sine.easeOut}, '-=.25')
                    .to('#introLogo', 0.5, {top: -60, ease: Sine.easeOut}, '-=.5')
                    .to('#cta', 0.5, {bottom: -25, ease: Sine.easeOut}, '-=.5')
                    .to('#footer', 0.5, {bottom: '-50px', ease: Sine.easeOut}, '-=.5')
            }

            applyFontSize.call(this);
        }

        function applyFontSize() {
            var fitness = new app.Fitness();
            if (this.hasText) {
                fitness.add(this.topText);
                fitness.add(this.botText);
            }

            fitness.add(this.boxMsg);
            fitness.add(this.header);

            fitness.fit(fitness.elements);
        }

        if (screenAvailable) {
            this.emit(IntroHorse);
        } else {
            this.emit("No IntroHorse");
        }
    }
]);

app.dpi.module('FinalScr', ['feed', 'terms', 'documentLoad', 'fonts',
    function (feed, terms) {
        var self = this;
        var i, len;
        var screens = feed.screens;
        var screenAvailable = false;

        for (i = 0, len = screens.length; i < len; i += 1) {
            if (screens[i].scrName === 'FinalScr') {
                screenAvailable = true;
                break;
            }
        }

        function FinalScr(data, onComplete, isFinalScreen, checkLoop) {
            var self = this;
            this.textTop = document.createElement('div');
            this.textMid = document.createElement('div');
            this.textBot = document.createElement('div');

            this.onComplete = onComplete;
            this.isFinalScreen = isFinalScreen;

            //this.logoFin = document.createElement('div');
            //this.logoFin.id = 'logoFin';
            //this.logoFin.style.backgroundImage = 'url(' + app.imagesPath + feed.logo + ')';

            this.boxCropFin = document.createElement('div');
            this.boxCropFin.id = 'boxCropFin';

            this.boxMsg = document.createElement('div');
            this.boxMsg.id = 'boxMsgFin';
            //Long Black Box text
            this.boxMsg.className = 'text boxMsg';
            this.boxMsg.setAttribute('data-vertical-align', 'middle');
            this.boxMsg.setAttribute('data-horizontal-align', 'left');
            //this.boxMsg.style.lineHeight = feed.lineHeight;
            this.boxMsg.style.lineHeight = 1;
            this.boxMsg.style.fontStyle = 'italic';
            var text = feed.boxMsg.replace(/\n/g, "<br>");
            this.boxMsg.innerHTML = app.parseText(text, feed.boxAltClr);
            this.boxMsg.style.color = feed.boxClr;

            //to check isDay1!
            //var testIsDay1 = app.parseOdd(data.txt1 + data.txt2 + data.txt3);
            this.textTop.className = 'text finalTextTop';
            this.textBot.className = 'text finalTextBot';

            this.hasDay1 = (data.txt2 !== '' && typeof data.txt2 !== 'undefined' && data.txt2 !== null);
            if (this.hasDay1) {
                this.textMid = document.createElement('div');
                this.textMid.className = 'betsCount';

                this.bets = data.txt2 - 0 - 1;
                this.textMid.textContent = 1;

                this.textMid.setAttribute('data-vertical-align', 'middle');
                this.textMid.setAttribute('data-horizontal-align', 'center');
                this.textMid.style.lineHeight = feed.lineHeight;
                this.textMid.innerHTML = app.parseText('1', data.altColor);
                this.textMid.style.color = data.color;

                //ToDo In Streameye MUST BE \\n !!!!!!!!!!
                var oddParsedText = app.parseOdd(data.txt1);
                var text01 = oddParsedText.replace(/\n/g, "<br>");
                this.textTop.innerHTML = app.parseText(text01, data.altColor);

                var oddParsedText = app.parseOdd(data.txt3);
                var text02 = oddParsedText.replace(/\n/g, "<br>");
                this.textBot.innerHTML = app.parseText(text02, data.altColor);

                this.textTop.setAttribute('data-vertical-align', 'bottom');
                this.textTop.setAttribute('data-horizontal-align', 'center');
                this.textTop.style.lineHeight = feed.lineHeight;
                this.textTop.style.color = data.color;

                this.textBot.setAttribute('data-vertical-align', 'top');
                this.textBot.setAttribute('data-horizontal-align', 'center');
                this.textBot.style.lineHeight = feed.lineHeight;
                this.textBot.style.color = data.color;
                //this.textBot.style.height = "45px";
                //this.textBot.style.top = "165px";

                if (navigator.userAgent.indexOf('Mac OS X') != -1) {
                    this.textMid.style.padding = '0px';
                }

                document.getElementById('banner').appendChild(this.textMid);

            } else {
                //No Middle text layout
                this.textTop.className = 'text finalTextTopLayout2';
                this.textBot.className = 'text finalTextBotLayout2';
                //ToDo In Streameye MUST BE \\n !!!!!!!!!!
                var oddParsedText = app.parseOdd(data.txt1);
                var text01 = oddParsedText.replace(/\n/g, "<br>");
                this.textTop.innerHTML = app.parseText(text01, data.altColor);


                var oddParsedText = app.parseOdd(data.txt3);
                var text03 = oddParsedText.replace(/\n/g, "<br>");
                this.textBot.innerHTML = app.parseText(text03, data.altColor);

                this.textTop.setAttribute('data-vertical-align', 'bottom');
                this.textTop.setAttribute('data-horizontal-align', 'center');
                this.textTop.style.lineHeight = feed.lineHeight;
                this.textTop.style.color = data.color;

                this.textBot.setAttribute('data-vertical-align', 'top');
                this.textBot.setAttribute('data-horizontal-align', 'center');
                this.textBot.style.lineHeight = feed.lineHeight;
                this.textBot.style.color = data.color;
            }


            this.banner = document.getElementById('banner');
            this.banner.appendChild(this.textTop);
            this.banner.appendChild(this.textBot);
            //this.banner.appendChild(this.logoFin);
            //this.boxCropFin.appendChild(this.boxMsg);
            //this.banner.appendChild(this.boxCropFin);

            this.init(checkLoop);
        }

        FinalScr.prototype.init = function (checkLoop) {
            var self = this;
            var cta = document.getElementById('cta');
            var terms = document.getElementById('terms');
            var arrow = document.getElementById("arrow");

            var arrowTween = new TimelineMax({
                paused: true
            });
            arrowTween
                .to(arrow, 0.1, {right: 0, ease: Back.easeIn.config(1)}, '+=0')
                .to(arrow, 0.2, {right: 5, ease: Back.easeIn.config(1)}, '+=0')
                .to(arrow, 0.1, {right: 0, ease: Back.easeIn.config(1)})
                .to(arrow, 0.2, {right: 5, ease: Back.easeIn.config(1)})

            function startArrow() {
                arrowTween.restart();
            }


            this.tween = new TimelineMax({
                paused: true,
                onComplete: this.onComplete
            });


            if (self.hasDay1) {
                //var bets = {score: 1},
                var bets = {score: 1},
                    points = (self.bets - 0);

                //console.log("points " + bets.score);

                self.textMid.innerHTML = 1;
                var fitness = new app.Fitness();
                fitness.add(self.textMid);
                fitness.fit(fitness.elements);

                function updateHandler() {
                    if (self.hasDay1) {
                        self.textMid.innerHTML = bets.score.toFixed(0);

                        var fitness = new app.Fitness();
                        fitness.add(self.textMid);
                        fitness.fit(fitness.elements);

                    }
                }

                function addPoints() {
                    //bets.score=1;
                    if (self.hasDay1) {
                        TweenLite.to(bets, 0.6, {
                            score: "+=" + points,
                            onUpdate: updateHandler,
                            ease: SteppedEase.config(10)
                        }, '+=0.1')
                    }
                }
            } else {
                var pulseTween = new TimelineMax({
                    paused: true,
                    //yoyo: true,
                    repeat: 1,
                    repeatDelay: 0.5
                });

                pulseTween
                    .to(self.textBot, 0.1, {scale: 0.9, ease: Sine.easeOut})
                    .to(self.textBot, 0.1, {scale: 1, ease: Sine.easeIn})
                    .to(self.textBot, 0.1, {scale: 0.9, ease: Sine.easeOut})
                    .to(self.textBot, 0.1, {scale: 1, ease: Sine.easeIn})
                    .to(self.textBot, 0.1, {scale: 0.9, ease: Sine.easeOut})
                    .to(self.textBot, 0.1, {scale: 1, ease: Sine.easeIn})


                var startPulse = function startPulse() {
                    pulseTween.restart();
                }

                var stopPulse = function stopPulse() {
                    pulseTween.pause();
                }
            }

            var rotateTween = new TimelineMax({
                paused: true,
                //yoyo: true,
                repeat: 5,
                onStart: addPoints
            });

            rotateTween
                .to(self.textMid, 0.1, {
                    rotationX: '-=360_cw',
                    transformPerspective: 1000,
                    force3D: true,
                    ease: Power0.easeNone
                })

            var startRotation = function startRotation() {
                TweenLite.delayedCall(0.5, function () {
                    rotateTween.restart();
                });
            }

            var setBetsCountToOne = function setBetsCountToOne() {
                if (self.hasDay1) {
                    self.textMid.innerHTML = '1';
                    bets.score = 1;

                    var fitness = new app.Fitness();
                    fitness.add(self.textMid);
                    fitness.fit(fitness.elements);
                }
            }

            this.tween
                .set([this.textTop, this.textBot], {transformOrigin: "50% 50%"})
                .to(this.textTop, 0.5, {autoAlpha: 1, ease: Sine.easeIn})
            if (self.hasDay1) {
                this.tween
                    .to(self.textMid, 0.5, {
                        autoAlpha: 1, y: '-=10px', ease: Elastic.easeOut.config(1, 0.2),
                        onStart: startRotation
                    }, '-=0.2')
            }
            this.tween
                .to(this.textBot, 0.7, {
                    autoAlpha: 1, y: '-=20px', ease: Elastic.easeOut.config(1, 0.2),
                    onComplete: function () {
                        if (!self.hasDay1) {
                            startPulse();
                        }
                    }
                }, '-=0.3')

            if (this.isFinalScreen) {
                this.tween
                    .to(arrow, 0.6, {onStart: startArrow, onComplete: checkLoop}, '+=0')

            }
            this.tween
                .to(this.textTop, 0.4, {
                    autoAlpha: 0,
                    y: '+=5px',
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    transformPerspective: 1000,
                    ease: Sine.easeOut
                }, '+=3')
            if (self.hasDay1) {
                this.tween
                    .to(self.textMid, 0.4, {
                        autoAlpha: 0,
                        y: '+=5px',
                        ease: Sine.easeOut
                    }, '-=.2')
            }
            this.tween
                .to(this.textBot, 0.4, {
                    autoAlpha: 0,
                    y: '+=5px',
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    transformPerspective: 1000,
                    ease: Sine.easeOut,
                    onStart: stopPulse,
                    onComplete: setBetsCountToOne
                }, '-=.2')

            if (this.isFinalScreen) {
                this.tween
                    .to('#header', 0.5, {clip: "rect(25px 60px 25px 60px)", ease: Sine.easeOut}, '-=.25')
                    .to('#introLogo', 0.5, {top: -60, ease: Sine.easeOut}, '-=.5')
                    .to('#cta', 0.5, {bottom: -25, ease: Sine.easeOut}, '-=.5')
                    .to('#footer', 0.5, {bottom: '-50px', ease: Sine.easeOut}, '-=.5')
            }


            applyFontSize.call(this);
        }

        function applyFontSize() {
            var fitness = new app.Fitness();
            fitness.add(this.textTop);
            fitness.add(this.textBot);
            fitness.add(this.boxMsg);
            //if (self.hasDay1) {
            //    fitness.add(self.textMid);
            //}

            fitness.fit(fitness.elements);
        }

        if (screenAvailable) {
            this.emit(FinalScr);
        } else {
            this.emit("No FinalScr");
        }
    }
]);

app.dpi.module('FinalScrOffer2', ['feed', 'terms', 'documentLoad', 'fonts',
    function (feed, terms) {
        var i, len;
        var screens = feed.screens;
        var screenAvailable = false;

        for (i = 0, len = screens.length; i < len; i += 1) {
            if (screens[i].scrName === 'FinalScrOffer2') {
                screenAvailable = true;
                break;
            }
        }

        function FinalScrOffer2(data, onComplete, isFinalScreen, checkLoop) {
            this.textTop = document.createElement('div');
            //this.textMid = document.createElement('div');
            this.textBot = document.createElement('div');

            //app.betsCount = data

            //this.logoFin = document.createElement('div');
            //this.logoFin.id = 'logoFin';
            //this.logoFin.style.backgroundImage = 'url(' + app.imagesPath + feed.logo + ')';

            this.boxMsg = document.createElement('div');
            this.boxMsg.id = 'boxMsgFin';
            //Long Black Box text
            this.boxMsg.className = 'text boxMsg';
            this.boxMsg.setAttribute('data-vertical-align', 'middle');
            this.boxMsg.setAttribute('data-horizontal-align', 'left');
            //this.boxMsg.style.lineHeight = feed.lineHeight;
            this.boxMsg.style.lineHeight = 1;
            this.boxMsg.style.fontStyle = 'italic';
            var text = feed.boxMsg.replace(/\n/g, "<br>");
            this.boxMsg.innerHTML = app.parseText(text, feed.boxAltClr);
            this.boxMsg.style.color = feed.boxClr;

            this.textTop.className = 'text finalTextOffer2Top';
            //this.textMid.className = 'text finalTextMid';
            this.textBot.className = 'text finalTextOffer2Bot';

            this.onComplete = onComplete;
            this.isFinalScreen = isFinalScreen;

            ////ToDo In Streameye MUST BE \\n !!!!!!!!!!
            var oddParsedText = app.parseOdd(data.txt1);
            //console.log(oddParsedText);
            var text01 = oddParsedText.replace(/\n/g, "<br>");
            this.textTop.innerHTML = app.parseText(text01, data.altColor);

            var oddParsedText = app.parseOdd(data.txt2);
            var text02 = oddParsedText.replace(/\n/g, "<br>");
            this.textBot.innerHTML = app.parseText(text02, data.altColor);


            this.textTop.setAttribute('data-vertical-align', 'bottom');
            this.textTop.setAttribute('data-horizontal-align', 'center');
            this.textTop.style.lineHeight = feed.lineHeight;
            this.textTop.style.color = data.color;


            this.textBot.setAttribute('data-vertical-align', 'top');
            this.textBot.setAttribute('data-horizontal-align', 'center');
            this.textBot.style.lineHeight = feed.lineHeight;
            this.textBot.style.color = data.color;


            this.banner = document.getElementById('banner');
            this.banner.appendChild(this.textTop);
            //this.banner.appendChild(this.textMid);
            this.banner.appendChild(this.textBot);
            //this.banner.appendChild(this.logoFin);


            this.init(checkLoop);
        }


        FinalScrOffer2.prototype.init = function (checkLoop) {
            var cta = document.getElementById('cta');
            var terms = document.getElementById('terms');
            var arrow = document.getElementById("arrow");

            var arrowTween = new TimelineMax({
                paused: true
            });
            arrowTween
                .to(arrow, 0.1, {right: 0, ease: Back.easeIn.config(1)}, '+=0')
                .to(arrow, 0.2, {right: 5, ease: Back.easeIn.config(1)}, '+=0')
                .to(arrow, 0.1, {right: 0, ease: Back.easeIn.config(1)})
                .to(arrow, 0.2, {right: 5, ease: Back.easeIn.config(1)})

            function startArrow() {
                arrowTween.restart();
            }

            this.tween = new TimelineMax({
                paused: true,
                onComplete: this.onComplete
            });

            this.tween
                //.to('#header', 0.3, {clip: "rect(0px, 140px, 90px, 0px);", ease: Sine.easeOut})
                .set([this.textTop, this.textMid, this.textBot], {transformOrigin: "50% 50%"})
                .from(this.textTop, 0.5, {autoAlpha: 0}, '+=0.2')
                .from(this.textBot, 0.5, {top: 450, autoAlpha: 0, ease: Elastic.easeOut.config(0.3, 0.2)}, '-=0.1')

            if (this.isFinalScreen) {
                this.tween
                    .to(arrow, 0.6, {onStart: startArrow, onComplete: checkLoop}, '+=0')
            }
            this.tween
                .to(this.textTop, 0.3, {
                    autoAlpha: 0,
                    // x: '-=10px',
                    y: '-=0px',
                    // scale: 0.6,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    transformPerspective: 1000,
                    ease: Sine.easeOut
                }, '+=3')
                .to(this.textBot, 0.3, {
                    autoAlpha: 0,
                    // x: '+=10px',
                    y: '-=0px',
                    // scale: 0.6,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    transformPerspective: 1000,
                    ease: Sine.easeOut
                }, '-=.1')

            if (this.isFinalScreen) {
                this.tween
                    .to('#header', 0.5, {clip: "rect(25px 60px 25px 60px)", ease: Sine.easeOut}, '-=.25')
                    .to('#introLogo', 0.5, {top: -60, ease: Sine.easeOut}, '-=.5')
                    .to('#cta', 0.5, {bottom: -25, ease: Sine.easeOut}, '-=.5')
                    .to('#footer', 0.5, {bottom: '-50px', ease: Sine.easeOut}, '-=.5')
            }


            applyFontSize.call(this);
        }

        function applyFontSize() {
            var fitness = new app.Fitness();
            fitness.add(this.textTop);
            // fitness.add(this.textMid);
            fitness.add(this.textBot);
            fitness.add(this.boxMsg);
            fitness.fit(fitness.elements);
        }

        if (screenAvailable) {
            this.emit(FinalScrOffer2);
        } else {
            this.emit("No FinalScrOffer2");
        }
    }
]);
app.dpi.module('FinalScrOffer3', ['feed', 'terms', 'documentLoad', 'fonts',
    function (feed, terms) {
        var i, len;
        var screens = feed.screens;
        var screenAvailable = false;

        for (i = 0, len = screens.length; i < len; i += 1) {
            if (screens[i].scrName === 'FinalScrOffer3') {
                screenAvailable = true;
                break;
            }
        }

        function FinalScrOffer3(data, onComplete, isFinalScreen, checkLoop) {
            this.textTop = document.createElement('div');
            this.textMid = document.createElement('div');
            this.textBot = document.createElement('div');

            app.betsCount = data

            //this.logoFin = document.createElement('div');
            //this.logoFin.id = 'logoFin';
            //this.logoFin.style.backgroundImage = 'url(' + app.imagesPath + feed.logo + ')';

            this.boxMsg = document.createElement('div');
            this.boxMsg.id = 'boxMsgFin';
            //Long Black Box text
            this.boxMsg.className = 'text boxMsg';
            this.boxMsg.setAttribute('data-vertical-align', 'middle');
            this.boxMsg.setAttribute('data-horizontal-align', 'left');
            //this.boxMsg.style.lineHeight = feed.lineHeight;
            this.boxMsg.style.lineHeight = 1;
            this.boxMsg.style.fontStyle = 'italic';
            var text = feed.boxMsg.replace(/\n/g, "<br>");
            this.boxMsg.innerHTML = app.parseText(text, feed.boxAltClr);
            this.boxMsg.style.color = feed.boxClr;

            this.textTop.className = 'text finalTextOffer3Odd';
            this.textMid.className = 'text finalTextOffer3Horse';
            this.textBot.className = 'text finalTextOffer3Tip';

            this.onComplete = onComplete;
            this.isFinalScreen = isFinalScreen;

            ////ToDo In Streameye MUST BE \\n !!!!!!!!!!


            var oddParsedText = app.parseOdd(data.txt1);
            var text01 = oddParsedText.replace(/\n/g, "<br>");
            this.textTop.innerHTML = app.parseText(text01, data.altColor);

            var oddParsedText = app.parseOdd(data.txt2);
            var text02 = oddParsedText.replace(/\n/g, "<br>");
            this.textMid.innerHTML = app.parseText(text02, data.altColor);

            var oddParsedText = app.parseOdd(data.txt3);
            var text03 = oddParsedText.replace(/\n/g, "<br>");
            this.textBot.innerHTML = app.parseText(text03, data.altColor);


            this.textTop.setAttribute('data-vertical-align', 'bottom');
            this.textTop.setAttribute('data-horizontal-align', 'center');
            this.textTop.style.lineHeight = feed.lineHeight;
            this.textTop.style.color = data.color;

            this.textMid.setAttribute('data-vertical-align', 'top');
            this.textMid.setAttribute('data-horizontal-align', 'center');
            this.textMid.style.lineHeight = feed.lineHeight;
            this.textMid.style.color = data.color;

            this.textBot.setAttribute('data-vertical-align', 'top');
            this.textBot.setAttribute('data-horizontal-align', 'center');
            this.textBot.style.lineHeight = feed.lineHeight;
            this.textBot.style.color = data.color;


            this.banner = document.getElementById('banner');
            this.banner.appendChild(this.textTop);
            this.banner.appendChild(this.textMid);
            this.banner.appendChild(this.textBot);
            //this.banner.appendChild(this.logoFin);


            this.init(checkLoop);
        }

        FinalScrOffer3.prototype.init = function (checkLoop) {
            var cta = document.getElementById('cta');
            var terms = document.getElementById('terms');
            var arrow = document.getElementById("arrow");

            var arrowTween = new TimelineMax({
                paused: true
            });
            arrowTween
                .to(arrow, 0.1, {right: 0, ease: Back.easeIn.config(1)}, '+=0')
                .to(arrow, 0.2, {right: 5, ease: Back.easeIn.config(1)}, '+=0')
                .to(arrow, 0.1, {right: 0, ease: Back.easeIn.config(1)})
                .to(arrow, 0.2, {right: 5, ease: Back.easeIn.config(1)})

            function startArrow() {
                arrowTween.restart();
            }

            var pulseTween = new TimelineMax({
                paused: true,
                //yoyo: true,
                repeat: 1,
                repeatDelay: 0.5
            });

            pulseTween
                .to(this.textTop, 0.1, {scale: 0.9, ease: Sine.easeOut})
                .to(this.textTop, 0.1, {scale: 1, ease: Sine.easeIn})
                .to(this.textTop, 0.1, {scale: 0.9, ease: Sine.easeOut})
                .to(this.textTop, 0.1, {scale: 1, ease: Sine.easeIn})
                .to(this.textTop, 0.1, {scale: 0.9, ease: Sine.easeOut})
                .to(this.textTop, 0.1, {scale: 1, ease: Sine.easeIn})


            var startPulse = function startPulse() {
                pulseTween.restart();
            }

            var stopPulse = function stopPulse() {
                pulseTween.pause();
            }

            this.tween = new TimelineMax({
                paused: true,
                onComplete: this.onComplete
            });

            this.tween
                //.to('#header', 0.3, {clip: "rect(0px, 140px, 90px, 0px);", ease: Sine.easeOut})
                .set([this.textTop, this.textMid, this.textBot], {transformOrigin: "50% 50%"})
                .from(this.textTop, 0.5, {autoAlpha: 0, ease: Sine.easeOut}, '+=0.2')
                .from(this.textMid, 0.4, {autoAlpha: 0, ease: Sine.easeOut}, '-=0.2')
                .from(this.textBot, 0.5, {
                    autoAlpha: 0, top: 450, ease: Elastic.easeOut.config(0.2, 0.2),
                    onComplete: startPulse
                }, '-=0.1')


            if (this.isFinalScreen) {
                this.tween
                    .to(arrow, 0.6, {onStart: startArrow, onComplete: checkLoop}, '+=0')

            }
            this.tween
                .to(this.textTop, 0.3, {
                    autoAlpha: 0,
                    // x: '-=10px',
                    y: '-=0px',
                    // scale: 0.6,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    transformPerspective: 1000,
                    ease: Sine.easeOut
                }, '+=3')
                .to(this.textMid, 0.3, {
                    autoAlpha: 0,
                    y: '-=0px',
                    z: 0.1,
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    transformPerspective: 1000,
                    ease: Sine.easeOut
                }, '-=.1')
                .to(this.textBot, 0.3, {
                    autoAlpha: 0,
                    // x: '+=10px',
                    y: '-=0px',
                    // scale: 0.6,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    transformPerspective: 1000,
                    ease: Sine.easeOut,
                    onStart: stopPulse
                }, '-=.1')
            if (this.isFinalScreen) {
                this.tween
                    .to('#header', 0.5, {clip: "rect(25px 60px 25px 60px)", ease: Sine.easeOut}, '-=.25')
                    .to('#introLogo', 0.5, {top: -60, ease: Sine.easeOut}, '-=.5')
                    .to('#cta', 0.5, {bottom: -25, ease: Sine.easeOut}, '-=.5')
                    .to('#footer', 0.5, {bottom: '-50px', ease: Sine.easeOut}, '-=.5')
            }
            applyFontSize.call(this);
        }

        function applyFontSize() {
            var fitness = new app.Fitness();
            fitness.add(this.textTop);
            fitness.add(this.textMid);
            fitness.add(this.textBot);
            fitness.add(this.boxMsg);
            fitness.fit(fitness.elements);
        }

        if (screenAvailable) {
            this.emit(FinalScrOffer3);
        } else {
            this.emit("No FinalScrOffer3");
        }
    }
]);

app.dpi.module('animations', ['feed', 'terms', 'IntroHorse', 'FinalScr', 'FinalScrOffer2', 'FinalScrOffer3', 'documentLoad', 'fonts', 'cta',
    function (feed, terms, IntroHorse, FinalScr, FinalScrOffer2, FinalScrOffer3) {
        var banner = document.getElementById('banner');
        banner.style.opacity = 1;
        document.getElementById('footer').appendChild(terms);
        var loops = feed.looping;

        var screensLength = feed.screens.length;
        var screens = [],
            screenIndex = -1;


        if (feed.screens && Object.prototype.toString.call(feed.screens) === '[object Array]') {
            addScreens();
        }

        playFirstScreen();

        function addScreens() {
            var screenCounter = 1;
            var isFinal = false;

            feed.screens.forEach(function (screen) {
                screen.lineHeight = feed.lineHeight;

                if (isFinalScreen(screenCounter)) {
                    isFinal = true;

                    if (screen.scrName === 'IntroHorse') {
                        screens.push(new IntroHorse(screen, playFirstScreen, isFinal, checkLoop));
                    } else if (screen.scrName === 'FinalScr') {
                        screens.push(new FinalScr(screen, playFirstScreen, isFinal, checkLoop));
                    } else if (screen.scrName === 'FinalScrOffer2') {
                        screens.push(new FinalScrOffer2(screen, playFirstScreen, isFinal, checkLoop));
                    } else if (screen.scrName === 'FinalScrOffer3') {
                        screens.push(new FinalScrOffer3(screen, playFirstScreen, isFinal, checkLoop));
                    }

                } else {
                    if (screen.scrName === 'IntroHorse') {
                        screens.push(new IntroHorse(screen, playNextScreen, isFinal));
                    } else if (screen.scrName === 'FinalScr') {
                        screens.push(new FinalScr(screen, playNextScreen, isFinal));
                    } else if (screen.scrName === 'FinalScrOffer2') {
                        screens.push(new FinalScrOffer2(screen, playNextScreen, isFinal));
                    } else if (screen.scrName === 'FinalScrOffer3') {
                        screens.push(new FinalScrOffer3(screen, playNextScreen, isFinal));
                    }
                }

                screenCounter += 1;
            });
        }

        function isFinalScreen(screenCounter) {
            return screenCounter === screensLength;
        }

        function playNextScreen() {
            screenIndex += 1;

            setTimeout(function () {
                screens[screenIndex].tween.restart();
            }, 20);
        }

        function playFirstScreen() {
            screenIndex = 0;

            if (loops > feed.looping) {
                //if (screens[screenIndex].hasText) {
                screens[screenIndex].tween.restart();
                screens[screenIndex].tween.play(2.4);
                TweenLite.delayedCall(2.8, function () {
                    screens[screenIndex].tween.restart();
                    screens[screenIndex].tween.play(screens[screenIndex].tween.totalDuration());
                });

            } else {
                screens[screenIndex].tween.restart();
            }
        }

        function checkLoop() {
            if (feed.looping === 1) {
                if (feed.screens[screensLength - 1].scrName === 'IntroHorse') {
                    screens[screens.length - 1].tween.pause(-2);
                    screens[screens.length - 1].stopTheShake();

                } else {
                    screens[screens.length - 1].tween.pause();
                }
            }

            if (feed.looping > 1) {
                feed.looping -= 1;
            }
            return feed.looping;
        }
    }
]);

app.dpi.apply();