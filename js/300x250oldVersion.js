/**
 * Created by Venelin on 2/8/2016.
 */
/**
 * Created by veni on 5/12/2015.
 */
var app = {
    isDay1: false,
    betsCount: 3,
    score: {score: 1},
    finText2: '',

    mockup: function () {
    },
    isTrue: function (bool) {
        return bool === true || bool === "true";
    },
    fontsPath: '//static.streameye.net/html5/templates/horse_racing_resources/fonts/',
    bannerSize: '300x250',
    imagesPath: '//static.streameye.net/html5/templates/flamingball_da/img/'
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
    //var repOpen = '<div id="betsCount">',
    //    repClose = '</div>';
    //text.replace(/{{/g, repOpen).replace(/}}/g, repClose);
    var newText = text;


    var hasDay1 = text.indexOf('{{');
    if (hasDay1 !== -1) {
        app.isDay1 = true;

        var betsDom = document.createElement('div');

        betsDom.className = 'betsCount';

        var bets = text.match(/\{{([^)]+)\}}/)[1];
        app.betsCount = bets - 1;
        betsDom.textContent = 1;
        //console.log(bets);
        var strToFind = '{{' + bets + '}}';
        var startIndex = text.indexOf(strToFind);
        newText = text.substring((startIndex + strToFind.length ), text.length)

        document.getElementById('banner').appendChild(betsDom);


    }
//return text.replace(/{{/g, repOpen).replace(/}}/g, repClose);
    console.log(newText);
    return newText;

}
;
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
        //feedUrl = '//www.streameye.net/marketdatajsonpfull.aspx?id=' + queryParams.id + ispreview,
            feedUrl = 'http://chromeye.com/betfair/feeds/Chaltenham2016Feed-route2.json?',

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
            this.assetContainer = document.getElementById('assetContainer');

            this.onComplete = onComplete;
            this.isFinalScreen = isFinalScreen;

            this.header = document.createElement('div');
            this.topText = document.createElement('div');
            this.botText = document.createElement('div');

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
                text += '<span style="color:#FFB80C"> ' + feed.day1 + '</span>';
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


            //Asset
            //var assetUrl = app.imagesPath + asset;
            this.asset.id = 'horse';
            var assetUrl = 'img/' + asset;
            //this.asset.style.backgroundImage = 'url(' + assetUrl + ')';
            var img = new Image();
            var self = this;
            img.onload = function () {
                self.asset.style.backgroundImage = 'url(' + assetUrl + ')';
            }
            img.src = assetUrl;

            //DIRT Images
            var dirt1Name = 'dirt1.png'
            var dirt1Url = 'img/' + dirt1Name;
            //this.asset.style.backgroundImage = 'url(' + assetUrl + ')';
            var img = new Image();
            img.onload = function () {
                self.leftDirt.style.backgroundImage = 'url(' + dirt1Url + ')';
            }
            img.src = dirt1Url;

            var dirt2Name = 'dirt2.png'
            var dirt2Url = 'img/' + dirt2Name;
            //this.asset.style.backgroundImage = 'url(' + assetUrl + ')';
            var img = new Image();
            img.onload = function () {
                self.rightDirt.style.backgroundImage = 'url(' + dirt2Url + ')';
            }
            img.src = dirt2Url;

            //Rail Image load
            var rail = 'rail.png'
            var railUrl = 'img/' + rail;
            //this.asset.style.backgroundImage = 'url(' + assetUrl + ')';
            var img = new Image();
            img.onload = function () {
                self.rail.style.backgroundImage = 'url(' + railUrl + ')';
            }
            img.src = railUrl;


            this.banner = document.getElementById('banner');
            this.banner.appendChild(this.header);
            this.banner.appendChild(this.topText);
            this.banner.appendChild(this.botText);
            this.assetContainer.appendChild(this.asset);
            this.assetContainer.appendChild(this.rail);
            this.assetContainer.appendChild(this.leftDirt);
            this.assetContainer.appendChild(this.rightDirt);

            this.longContainer.appendChild(this.topLine);
            this.longContainer.appendChild(this.boxMsg);
            this.longContainer.appendChild(this.botLine);

            this.init(data, checkLoop);
        }

        IntroHorse.prototype.init = function (data, checkLoop) {
            var
                self = this,
                topTxtHeight = this.topText.getBoundingClientRect().height,
                botTxtHeight = this.botText.getBoundingClientRect().height,
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

            this.tween = new TimelineMax({
                paused: true,
                onComplete: this.onComplete
            });

            var shakeTween = new TimelineMax({repeat: -1, repeatDelay: 0, paused: true});
            shakeTween.
                fromTo(self.asset, 0.8, {y: '-=0.5'}, {
                    y: '+=0.5',
                    ease: RoughEase.ease.config({
                        template: Linear.easeNone,
                        strength: 8,
                        points: 200,
                        taper: "none",
                        randomize: true,
                        clamp: false
                    })
                })

            var shakeIt = function shakeIt() {
                shakeTween.restart();
            }
            var stopShake = function stopShake() {
                shakeTween.pause(0);
            }

            this.tween
                .set([self.leftDirt, self.asset, self.rail], {autoAlpha: 1})
                .set('#introLogo', {transformOrigin: "50% 50%"})
                .from('#introLogo', 0.9, {
                    scale: 0.6,
                    autoAlpha: 1,
                    force3D: true,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    transformPerspective: 1000,
                    ease: Back.easeOut.config(1)
                }, '+=0.3')
                .to('#introLogo', 0.5, {
                    scale: 0.1,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    autoAlpha: 0, force3D: true, ease: Sine.easeIn
                })
                .from(self.longContainer, 0.5, {
                    scale: 2.5,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    autoAlpha: 0, ease: Sine.easeIn
                }, '-=0.1')
                .to(self.longContainer, 0.4, {y: '-=24px', ease: Sine.easeOut}, '-=0')
                .from('#footer', 0.4, {bottom: -45, ease: Sine.easeOut}, '-=.4')

                .to(self.topLine, 0.4, {clip: "rect(0px, 300px, 1px, 0px)", ease: Sine.easeOut}, '-=0')
                .to(self.botLine, 0.4, {clip: "rect(0px, 300px, 1px, 0px)", ease: Sine.easeOut}, '-=.5')

                .to(self.topLine, 0.25, {clip: "rect(0px, 300px, 1px, 300px)", ease: Sine.easeIn}, '+=1')
                .to(self.botLine, 0.25, {clip: "rect(0px, 0px, 1px, 0px)", ease: Sine.easeIn}, '-=.25')
                .to(self.boxMsg, 0.25, {autoAlpha: 0, ease: Sine.easeIn}, '-=.25')

                //HORSE
                .to(self.assetContainer, 3, {
                    x: '+=570px',
                    ease: SlowMo.ease.config(0.1, 0.9, false),
                    onComplete: stopShake
                }, '-=0')
                .to(self.asset, 0.6, {
                    y: '-=50px',
                    scale: 1,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    force3D: false,
                    ease: Sine.easeOut,
                    onStart: shakeIt
                }, '-=3')
                .to(self.asset, 0.9, {
                    scale: 1.2,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    force3D: false,
                    ease: Sine.easeIn
                }, '-=0.85')
                .to(self.rail, 0.4, {bottom: 56}, '-=2.7')
                .to(self.rail, 2, {
                    x: '-=80px', scale: 1.4,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    force3D: false, ease: Power0.easeNone
                }, '-=2.8')
                .to(self.leftDirt, 2.7, {y: '-=50px', x: '+=40', force3D: false, ease: SteppedEase.config(40)}, '-=2.5')
                .to(self.rightDirt, 2.7, {
                    y: '-=20px',
                    x: '+=60',
                    force3D: false,
                    ease: SteppedEase.config(40)
                }, '-=2.7')
                .set([self.leftDirt, self.asset, self.rail], {autoAlpha: 0, ease: Sine.easeOut}, '-=0.2')

                //terms CTA
                .to('#terms', 0.25, {right: -200, ease: Sine.easeOut})
                .to('#cta', 0.25, {right: 0, ease: Sine.easeOut})

                //text screen
                .to(this.header, 0.4, {y: '+=30px', ease: Sine.easeOut})
                //.from(this.topText, 0.5, {y: '40px', autoAlpha: 0, ease: Elastic.easeOut.config(1, 0.3)}, '-=0')
                //.to(this.topText, 0.5, {y: '-' + (topTxtHeight ), ease: Elastic.easeOut.config(1, 0.3)}, '+=0.1')
                //.from(this.botText, 0.5, {y: '40px', autoAlpha: 0, ease: Elastic.easeOut.config(1, 0.3)}, '-=.5')
                .to(this.topText, 0.35, {clip: " rect(0px, 300px, 50px, 0px)", ease: Sine.easeOut}, '-=0')
                .to(this.botText, 0.35, {clip: " rect(0px, 300px, 50px, 0px)", ease: Sine.easeOut}, '-=0.35')


            if (this.isFinalScreen) {
                this.tween
                    .to(arrow, 0.6, {onStart: startArrow, onComplete: checkLoop}, '+=0')
            }
            this.tween
                .to(this.topText, 0.3, {clip: " rect(0px, 0px, 50px, 0px)", ease: Sine.easeOut}, '+=2')
                .to(this.botText, 0.3, {clip: " rect(0px, 300px, 50px, 300px)", ease: Sine.easeOut}, '-=0.3')


            //    .set(this.cuttingBox, {zIndex: 1})
            //    .set("#footer", {zIndex: 5})
            //    .to(this.longContainer, 0.3, {width: '290px', ease: Sine.easeOut, onComplete: startHorses}, '+=0.3')
            //    //.from(logo, 0.5, {y: '200px', ease: Sine.easeIn}, '+=0.6')
            //    .to(this.longContainer, 0.5, {y: '-70px', ease: Sine.easeIn}, '+=.5')
            //    .from(this.cuttingBox, 0.5, {height: '0px', ease: Sine.easeIn, onComplete: shakeBanner}, '-=0.5')
            //
            //    .to("#terms", 0.25, {right: '-180px', ease: Sine.easeOut}, '+=.4')
            //    .to("#cta", 0.25, {right: '-0px', ease: Sine.easeOut}, '-=0')
            //
            //    .to(this.longContainer, 0.2, {width: '0px', ease: Sine.easeIn}, '+=1')
            //
            //    //showtexts
            //    .from(this.topText, 0.5, {
            //        y: '40px', autoAlpha: 0, ease: Elastic.easeOut.config(1, 0.3),
            //        onStart: zoomOut
            //    }, '-=0')
            //    .to(this.topText, 0.5, {y: '-' + (topTxtHeight + 7), ease: Elastic.easeOut.config(1, 0.3)}, '+=0.1')
            //    .from(this.botText, 0.5, {y: '40px', autoAlpha: 0, ease: Elastic.easeOut.config(1, 0.3)}, '-=.5')
            //
            //
            //if (this.isFinalScreen) {
            //    this.tween
            //        .to(arrow, 0.6, {onStart: startArrow, onComplete: checkLoop}, '+=0')
            //}
            ////hide texts
            //this.tween
            //    .to(this.topText, 0, {rotationY: "0", ease: Sine.easeOut}, '+=3')
            //    .to(this.topText, 0.2, {rotationY: "90", left: -30, ease: Sine.easeOut})
            //    .to(this.botText, 0.2, {rotationY: '-90', left: 30, ease: Sine.easeOut}, '-=0.2')
            //    ////Hide image container
            //    .to(this.cuttingBox, 0.2, {height: '0px', ease: Sine.easeIn, onComplete: stopHorses}, '-=0.2')


            applyFontSize.call(this);
        }

        function applyFontSize() {
            var fitness = new app.Fitness();
            fitness.add(this.topText);
            fitness.add(this.botText);
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

            //app.betsCount = data

            this.logoFin = document.createElement('div');
            this.logoFin.id = 'logoFin';
            this.logoFin.style.backgroundImage = 'url(' + app.imagesPath + feed.logo + ')';

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


            this.onComplete = onComplete;
            this.isFinalScreen = isFinalScreen;

            //to check isDay1!
            //var testIsDay1 = app.parseOdd(data.txt1 + data.txt2 + data.txt3);

            var newTextForTxt2 = '';

            var fullFinalText = data.txt2;
            this.hasDay1 = fullFinalText.indexOf('{{');
            if (this.hasDay1 !== -1) {
                //app.isDay1 = true;

                this.betsDom = document.createElement('div');

                this.betsDom.className = 'betsCount';

                var bets = fullFinalText.match(/\{{([^)]+)\}}/)[1];
                this.bets = bets - 1;
                this.betsDom.textContent = 1;
                //console.log(bets);
                var strToFind = '{{' + bets + '}}';
                var startIndex = fullFinalText.indexOf(strToFind);
                newTextForTxt2 = fullFinalText.substring((startIndex + strToFind.length ), fullFinalText.length)

                document.getElementById('banner').appendChild(this.betsDom);


            }

            if (this.hasDay1 !== -1) {
                this.textTop.className = 'text finalTextTop';
                this.textBot.className = 'text finalTextBot';
                //ToDo In Streameye MUST BE \\n !!!!!!!!!!
                //var oddParsedText = app.parseOdd(data.txt1);
                var text01 = data.txt1.replace(/\n/g, "<br>");
                this.textTop.innerHTML = app.parseText(text01, data.altColor);

                //var oddParsedText = app.parseOdd(data.txt2);
                var text02 = newTextForTxt2.replace(/\n/g, "<br>");
                this.textBot.innerHTML = app.parseText(text02, data.altColor);
                this.textBot.style.height = "45px";
                this.textBot.style.top = "165px";

                var betsDom = this.betsDom;
                betsDom.setAttribute('data-vertical-align', 'bottom');
                betsDom.setAttribute('data-horizontal-align', 'center');
                betsDom.style.lineHeight = feed.lineHeight;
                betsDom.textContent = app.parseText('1', data.altColor);
                betsDom.style.color = data.color;

            } else {
                this.textTop.className = 'text finalTextTop';
                this.textMid.className = 'text finalTextMid';
                this.textBot.className = 'text finalTextBot';
                //ToDo In Streameye MUST BE \\n !!!!!!!!!!
                //var oddParsedText = app.parseOdd(data.txt1);
                var text01 = data.txt1.replace(/\n/g, "<br>");
                this.textTop.innerHTML = app.parseText(text01, data.altColor);

                //var oddParsedText = app.parseOdd(data.txt2);
                //var text02 = oddParsedText.replace(/\n/g, "<br>");
                //this.textMid.innerHTML = app.parseText(text02, data.altColor);

                //var oddParsedText = app.parseOdd(data.txt2);
                var text03 = data.txt2.replace(/\n/g, "<br>");
                this.textBot.textContent = app.parseText(text03, data.altColor);
            }

            this.textTop.setAttribute('data-vertical-align', 'bottom');
            this.textTop.setAttribute('data-horizontal-align', 'center');
            this.textTop.style.lineHeight = feed.lineHeight;
            this.textTop.style.color = data.color;
            //
            //this.textMid.setAttribute('data-vertical-align', 'bottom');
            //this.textMid.setAttribute('data-horizontal-align', 'center');
            //this.textMid.style.lineHeight = feed.lineHeight;
            //this.textMid.style.color = data.color;

            this.textBot.setAttribute('data-vertical-align', 'top');
            this.textBot.setAttribute('data-horizontal-align', 'center');
            this.textBot.style.lineHeight = feed.lineHeight;
            this.textBot.style.color = data.color;


            this.banner = document.getElementById('banner');
            this.banner.appendChild(this.textTop);
            //this.banner.appendChild(this.textMid);
            this.banner.appendChild(this.textBot);
            this.banner.appendChild(this.logoFin);
            this.boxCropFin.appendChild(this.boxMsg);
            this.banner.appendChild(this.boxCropFin);


            this.init(checkLoop);
        }

        FinalScr.prototype.init = function (checkLoop) {
            //if (app.isDay1) {
            //    app.betsCount = document.getElementById('betsCount').innerText;
            //
            //}

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
                var bets = self.bets,
                    points = (self.bets - 0 - 1);
                console.log("points " + points)
                //var betDomEl = document.getElementById("betsCount");
                var betDomEl = self.betsDom;
                betDomEl.innerHTML = 1;
                var fitness = new app.Fitness();
                fitness.add(betDomEl);
                fitness.fit(fitness.elements);

                function updateHandler() {
                    if (self.hasDay1) {

                        var betDomEl = self.betsDom;
                        betDomEl.innerHTML = self.bets.toFixed(0);

                        var fitness = new app.Fitness();
                        fitness.add(betDomEl);
                        fitness.fit(fitness.elements);
                    }
                }

                function addPoints() {
                    //bets.score=1;
                    if (self.hasDay1) {
                        TweenLite.to(self.betsDom, 1, {
                            score: "+=" + points,
                            onUpdate: updateHandler,
                            ease: SteppedEase.config(10)
                        }, '+=0.25')
                    }
                }
            }

            var rotateTween = new TimelineMax({
                paused: true,
                //yoyo: true,
                repeat: 6,
                onStart: addPoints
            });

            rotateTween
                .to(self.betsDom, 0.2, {rotationX: '-=360_cw', force3D: true, ease: Power0.easeNone})

            var startRotation = function startRotation() {
                rotateTween.restart();
            }

            var stopRotation = function stopRotation() {
                rotateTween.pause(0);
            }

            var setBetsCountToOne = function setBetsCountToOne() {
                self.betsCount.innerHTML = '1';
            }

            this.tween
                .set([this.textTop, this.textBot], {transformOrigin: "50% 50%"})
                .to(this.textTop, 0.5, {autoAlpha: 1, ease: Sine.easeIn})
                //.to(this.textMid, 0.5, {autoAlpha: 1, ease: Sine.easeIn}, '-=0.2')
                .to(self.betsDom, 0.5, {
                    autoAlpha: 1, y: '-=10px', ease: Elastic.easeOut.config(1, 0.2),
                    onStart: startRotation
                }, '-=0.2')
                .to(this.textBot, 0.7, {
                    autoAlpha: 1, y: '-=10px', ease: Elastic.easeOut.config(1, 0.2),
                    //onStart: startRotation
                }, '-=0')
            //.to(this.textTop, 0.4, {rotationY: '0',transformPerspective :0,force3D:true, ease: Sine.easeOut})
            //.to(this.textMid, 0.4, {rotationY: '0',force3D:true,transformPerspective :0, ease: Sine.easeOut}, '-=0.4')
            //.to(this.textBot, 0.4, {rotationY: '0',force3D:true,transformPerspective :0, ease: Sine.easeOut}, '-=0.4')

            if (this.isFinalScreen) {
                this.tween
                    .to(arrow, 0.6, {onStart: startArrow, onComplete: checkLoop}, '+=0')

            }
            this.tween
                //.to(this.textTop, 0.25, {rotationX: '90',transformPerspective :800,force3D:true, ease: Sine.easeOut}, '+=3')
                //.to(this.textMid, 0.25, {rotationX: '90',transformPerspective :800,force3D:true, ease: Sine.easeOut}, '-=.25')
                //.to(this.textBot, 0.25, {rotationX: '90',transformPerspective :800,force3D:true, ease: Sine.easeOut}, '-=.25')
                .to(this.textTop, 0.4, {
                    autoAlpha: 0,
                    y: '+=5px',
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    transformPerspective: 1000,
                    ease: Sine.easeOut
                }, '+=3')
                //.to(this.textMid, 0.3, {
                //    autoAlpha: 0,
                //    x: '-=10px',
                //    y: '+=18px',
                //    scale: 0.6,
                //    z: 0.1, /* add this for the jitter bug */
                //    rotationZ: "0.01deg", /* add this for the jitter bug */
                //    transformPerspective: 1000,
                //    ease: Sine.easeOut
                //}, '-=.1')
                .to(self.betsDom, 0.4, {
                    autoAlpha: 0,
                    y: '+=5px',
                    ease: Sine.easeOut
                }, '-=.2')
                .to(this.textBot, 0.4, {
                    autoAlpha: 0,
                    y: '+=5px',
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    transformPerspective: 1000,
                    ease: Sine.easeOut
                }, '-=.2')
                .to('#header', 0.5, {y: '-=30px', ease: Sine.easeOut}, '-=0')
                .to('#footer', 0.5, {
                    bottom: '-45px', ease: Sine.easeOut,
                    onComplete: setBetsCountToOne
                }, '-=.5')

            //.to(this.textTop, 0.4, {rotationY: '0', left: 0, ease: Sine.easeOut})
            //    .to(this.textBot, 0.4, {rotationY: '0', left: 0, ease: Sine.easeOut}, '-=0.4')
            //
            //if (this.isFinalScreen) {
            //    this.tween
            //        .to(arrow, 0.6, {onStart: startArrow, onComplete: checkLoop}, '+=0')
            //
            //}
            //this.tween
            //    .to(this.textTop, 0.2, {
            //        rotationY: '-=90',
            //        left: -120,
            //        transformOrigin: "100% 50%",
            //        ease: Sine.easeOut
            //    }, '+=3')
            //    .to(this.textBot, 0.2, {
            //        rotationY: '+=90',
            //        left: 120,
            //        transformOrigin: "0% 50%",
            //        ease: Sine.easeOut
            //    }, '-=.2')
            //
            //if (!this.isFinalScreen) {
            //    this.tween
            //        .to(this.logoFin, 0.2, {width: '0px', ease: Sine.easeIn})
            //        .to(this.boxCropFin, 0.2, {width: '0px', ease: Sine.easeIn}, '-=.2')
            //}


            applyFontSize.call(this);
        }

        function applyFontSize() {
            var fitness = new app.Fitness();
            fitness.add(this.textTop);
            fitness.add(this.textMid);
            fitness.add(this.textBot);
            fitness.add(this.boxMsg);
            if (self.hasDay1) {
                fitness.add(self.betsDom);
            }

            fitness.fit(fitness.elements);
        }

        if (screenAvailable) {
            this.emit(FinalScr);
        } else {
            this.emit("No FinalScr");
        }
    }
]);


app.dpi.module('animations', ['feed', 'terms', 'IntroHorse', 'FinalScr', 'documentLoad', 'fonts', 'cta',
    function (feed, terms, IntroHorse, FinalScr) {
        var banner = document.getElementById('banner');
        banner.style.opacity = 1;
        document.getElementById('footer').appendChild(terms);


        var screensLength = feed.screens.length;
        var screens = [],
            screenIndex = -1;

        //feed.screens.forEach(function (screen) {
        //    //check for Day1
        //    if (screen.scrName === 'FinalScr') {
        //        var testIsDay1 = app.parseOdd(screen.txt1 + screen.txt2 + screen.txt3);
        //        app.finText2 = testIsDay1;
        //        //console.log(app.finText2+" jj");
        //    }
        //});


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
                    }

                } else {
                    if (screen.scrName === 'IntroHorse') {
                        screens.push(new IntroHorse(screen, playNextScreen, isFinal));
                    } else if (screen.scrName === 'FinalScr') {
                        screens.push(new FinalScr(screen, playNextScreen, isFinal));
                    }
                }

                screenCounter += 1;
            });
        }

        function isFinalScreen(screenCounter) {
            return screenCounter === screensLength;
        }

        function playNextScreen() {
            app.score.score = 1;
            screenIndex += 1;

            //if (app.isDay1) {
            //    document.getElementById("betsCount").innerHTML = 1;
            //    var fitness = new app.Fitness();
            //    fitness.add(document.getElementById("betsCount"));
            //    fitness.fit(fitness.elements);
            //}
            setTimeout(function () {
                screens[screenIndex].tween.restart();
            }, 20);
        }

        function playFirstScreen() {
            screenIndex = 0;

            screens[screenIndex].tween.restart();
        }

        function checkLoop() {
            if (feed.looping === 1) {
                screens[screens.length - 1].tween.pause();
            }

            if (feed.looping > 1) {
                feed.looping -= 1;
            }
            return feed.looping;
        }
    }
]);

app.dpi.apply();