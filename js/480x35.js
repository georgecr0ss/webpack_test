/**
 * Created by veni on 5/12/2015.
 */
var app = {
    isDay1: false,
    betsCount: 3,
    score: {score: 1},

    mockup: function () {
    },
    isTrue: function (bool) {
        return bool === true || bool === "true";
    },
//    fontsPath: '//static.streameye.net/fonts/v2/',
fontsPath: '//static.streameye.net/html5/templates/horse_racing_resources/fonts/',
    bannerSize: '300x250',
    imagesPath: '//static.streameye.net/html5/templates/flamingball_da/img/',
assetPath: 'https://static.streameye.net/html5/templates/chelt16/img/'
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

    // var hasDay1 = text.indexOf('{{');
    // if (hasDay1 !== -1) {
    //     app.isDay1 = true;
    // }

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
        // feedUrl = '//www.streameye.net/marketdatajsonpfull.aspx?id=' + queryParams.id + ispreview,
              //feedUrl = 'http://chromeye.com/betfair/feeds/txtFeed.json?',
            feedUrl = 'http://localhost/CH-DR/txtFeed.json?',

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
                    lineHeight = 1;
                    break;
                case   'dk':
                    lineHeight = 1;
                    break;
                case 'pt':
                    lineHeight = 0.92;
                    break;
                default:
                    lineHeight = 0.92;
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


            this.tapBoom = document.createElement('div');
            this.tapBoom.id = 'tapBoom';
            
            this.onComplete = onComplete;
            this.isFinalScreen = isFinalScreen;

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
            this.header.setAttribute('data-horizontal-align', 'middle');
            //this.boxMsg.style.lineHeight = feed.lineHeight;
            this.header.style.lineHeight = 1;
            //this.boxMsg.style.fontStyle = 'italic';
            var text = feed.boxMsg.replace(/\n/g, "<br>");
           if (feed.day1 !== '' && typeof feed.day1 !== 'undefined' && feed.day1 !== null) {
                text += '<br><span style="color:#FFB80C"> ' + feed.day1 + '</span>';
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

         
            this.banner = document.getElementById('banner');
              this.hasText = ((data.txt1.trim() !== '' && typeof data.txt1.trim() !== 'undefined' && data.txt1.trim() !== null) ||
            (data.txt2.trim() !== '' && typeof data.txt2.trim() !== 'undefined' && data.txt2.trim() !== null) );

            if (this.hasText) {
                this.topText = document.createElement('div');
                this.botText = document.createElement('div');
                //top  text
                this.topText.className = 'text topText';
                this.topText.setAttribute('data-vertical-align', 'bottom');
                this.topText.setAttribute('data-horizontal-align', 'right');
                this.topText.style.lineHeight = feed.lineHeight;
                var text = data.txt1.trim().replace(/\n/g, "<br>"); 
                this.topText.innerHTML = app.parseText(text, data.altColor);
                this.topText.style.color = data.color;

                //bottom  text
                this.botText.className = 'text botText';
                this.botText.setAttribute('data-vertical-align', 'top');
                this.botText.setAttribute('data-horizontal-align', 'left');
                this.botText.style.lineHeight = feed.lineHeight;
                var text = data.txt2.trim().replace(/\n/g, "<br>");

                this.botText.innerHTML = app.parseText(text, data.altColor);
                this.botText.style.color = data.color; 
                this.banner.appendChild(this.topText);
                this.banner.appendChild(this.botText);
            }


            //Asset
           this.asset.id = 'horse';
            var assetUrl = app.assetPath +  'horse-wide.png';
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
            var rail = 'rail-lb.svg'
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
               this.header.style.paddingTop = '0px';
               this.boxMsg.style.paddingTop = '7px';
            }
            this.banner.appendChild(this.header); 
            this.banner.appendChild(this.rail);
            this.assetContainer.appendChild(this.asset);
            // this.assetContainer.appendChild(this.rail);
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
                // topTxtHeight = this.topText.getBoundingClientRect().height,
                // botTxtHeight = this.botText.getBoundingClientRect().height,
                self = this,
                arrow = document.getElementById("arrow"),
                terms = document.getElementById("terms"),
                cta = document.getElementById("cta"),
                logo = document.getElementById("logo"),
                svg = document.getElementById('simpleSvg');
 if(this.hasText){
                     var topTxtHeight = this.topText.getBoundingClientRect().height;
                       var botTxtHeight = this.botText.getBoundingClientRect().height;
               
                }
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
                fromTo(self.asset, 0.7, {y: '-=0.6'}, {
                    y: '+=0.6',
                    ease: RoughEase.ease.config({
                        template: Linear.easeNone,
                        strength: 4,
                        points: 25,
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


            this.tween = new TimelineMax({
                paused: true,
                onComplete: this.onComplete
            });

            this.tween
                .set(self.botLine,{clip: "rect(0px, 480px, 3px, 480px)"})
                .set(self.topLine,{clip:"rect(0px, 0px, 3px, 0px)"})
                .set([self.leftDirt, self.asset], {autoAlpha: 1})
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
                .from(self.tapBoom, 0.8, {
                    scale: 0,
                    force3D: true,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    transformPerspective: 1000,
                    ease: Back.easeOut.config(1)
                }, '-=.7')
                .to('#introLogo', 0.5, {
                    scale: 0.1,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    autoAlpha: 0, force3D: true, ease: Sine.easeIn
                })
                .to(self.tapBoom, 0.5, {
                    scale: 0,
                    force3D: true,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    transformPerspective: 1000,
                    ease: Back.easeIn.config(1)
                }, '-=0.35')
                .from(self.longContainer, 0.5, {
                    scale: 2.5,
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    autoAlpha: 0, ease: Sine.easeIn
                }, '+=0.1')
                // .to(self.longContainer, 0.4, {y: '-=24px', ease: Sine.easeOut}, '-=0')

               .to(self.topLine, 0.3, {clip: "rect(0px, 371px, 3px, 0px)", ease: Sine.easeOut}, '-=0')
                .to(self.topLine, 0.3, {clip: "rect(0px, 371px, 3px, 109px)", ease: Sine.easeOut}, '-=0.1')
                .to(self.botLine, 0.3, {clip: "rect(0px, 480px, 3px, 109px)", ease: Sine.easeOut}, '-=.4')
                .to(self.botLine, 0.3, {clip: "rect(0px, 371px, 3px, 109px)", ease: Sine.easeOut}, '-=.2')

                .to(self.topLine, 0.2, {clip: "rect(0px, 480px, 3px, 480px)", ease: Sine.easeIn}, '+=1')
                .to(self.botLine, 0.2, {clip: "rect(0px, 0px, 3px, 0px)", ease: Sine.easeIn}, '-=.25')

                
                .to(self.boxMsg, 0.25, {autoAlpha: 0, ease: Sine.easeIn}, '-=.25')

                .to('#footer', 0.4, {right: 0, ease: Sine.easeOut}, '+=.2')
                .to("#logo", 0.4,{left: 0, ease: Sine.easeOut}, '-=0.4')
                .to("#rail", 0.2, { autoAlpha:1,  
                   /* add this for the jitter bug */
                      /* add this for the jitter bug */
                    force3D: false, ease: Power0.easeNone
                }, '-=.13')
                //HORSE
                
                .from(this.rail, 0.2, {top: 102})
                .to(self.assetContainer, 3.5, {
                    x: '+=640px',
                    force3D: false,
                    ease: SlowMo.ease.config(0.5, 0.9, false),
                    onComplete: stopShake
                }, '-=0')
                .to(self.asset, 0.9, {
                    scale: 0.71, 
                    z: 0.18, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    force3D: false,
                    ease: Sine.easeOut,                    
                    onStart: shakeIt
                }, '-=3.5')
              
                .to(self.leftDirt, 3.6, {y: '-=40px', x: '+=85', force3D: false, ease: SteppedEase.config(40)}, '-=3.5')
                .to(self.rightDirt, 2.7, {
                    y: '-=20px',
                    x: '+=0',
                    force3D: false,
                    ease: SteppedEase.config(40)
                }, '-=3.7')
                .to("#rail", 0.2, {
                    top: '102px',autoAlpha:1,  
                   /* add this for the jitter bug */
                      /* add this for the jitter bug */
                    force3D: false, ease: Power0.easeNone
                }, '-=.13')
                .set([self.leftDirt, self.asset,self.rightDirt], {autoAlpha: 0, ease: Sine.easeOut}, '-=0.2')

                //terms CTA
                // .to('#terms', 0.25, { })
                // .to('#cta', 0.25, { })

                if (this.hasText) {
                    this.tween
                        .from(this.topText, 0.4, {left: -200, ease: Sine.easeOut}, '-=0')
                        .from(this.botText, 0.4, {left: 480, ease: Sine.easeOut}, '-=0')
                }
              
                 
                // .set(this.topText, {transformOrigin: "10% 100%"})
                // .to(this.topText, 0.5, {autoAlpha: 1, ease: Elastic.easeOut.config(1, 0.3)}, '-=0')
                // .to(this.topText, 0.5, { autoAlpha: 0,
                //         ease: Elastic.easeOut.config(1, 0.3)}, '+=0.1')

                // .set(this.botText, {transformOrigin: "100% 0%"})
                // .to(this.botText, 0.5, {autoAlpha: 1, ease: Elastic.easeOut.config(1, 0.3)}, '+=1')

                //text screen
                // .to(this.header, 0.4, {x: '+=120px', ease: Sine.easeOut})
                
            if (this.isFinalScreen) {
                this.tween
                    .to(arrow, 0.6, {onStart: startArrow, onComplete: checkLoop}, '+=0')
            }
            if (this.hasText) {
                    this.tween
            this.tween
              .to([this.topText, this.botText], 0.4, {autoAlpha: 0, ease: Sine.easeIn}, '+=1.8')

                }
            if (this.isFinalScreen) {
                    this.tween                         
                        .to('#footer', 0.5, {
                            right: '-200px', ease: Sine.easeOut
                        }, '-=0')
                        .to('#logo', 0.5, {
                            left: '-200px', ease: Sine.easeOut
                        }, '-=0.5')
                }
                if (!this.isFinalScreen) {
                    this.tween  
                    .to('#header', 0.3, {clip: "rect(0px,  65px, 35px, 0px);", ease: Sine.easeOut})
              }
                
                // .to(this.topText, 0.2, {y: "+=10px", autoAlpha: 0, ease: Sine.easeOut}, '+=2')
                // .to(this.botText, 0.2, {y: "+=10px", autoAlpha: 0, ease: Sine.easeOut}, '-=0.1')


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

            //app.betsCount = data

            this.logoFin = document.createElement('div');
            this.logoFin.id = 'logoFin';
            this.logoFin.style.backgroundImage = 'url(' + app.imagesPath + feed.logo + ')';

     
     

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
            this.textTop.className = 'text finalTextTop';
            this.textBot.className = 'text finalTextBot';

            this.hasDay1 = (data.txt2 !== '' && typeof data.txt2 !== 'undefined' && data.txt2 !== null);
            if (this.hasDay1) {
                this.textMid = document.createElement('div');
                this.textMid.className = 'betsCount';

                this.bets = data.txt2 - 0 - 1;
                this.textMid.textContent = 1;

                this.textMid.setAttribute('data-vertical-align', 'bottom');
                this.textMid.setAttribute('data-horizontal-align', 'right');
                this.textMid.style.lineHeight = feed.lineHeight;
                this.textMid.textContent = app.parseText('1', data.altColor);
                this.textMid.style.color = data.color;

                //ToDo In Streameye MUST BE \\n !!!!!!!!!!
                var oddParsedText = app.parseOdd(data.txt1);
                var text01 = oddParsedText.replace(/\n/g, "<br>");
                this.textTop.innerHTML = app.parseText(text01, data.altColor);

                var oddParsedText = app.parseOdd(data.txt3);
                var text02 = oddParsedText.replace(/\n/g, "<br>");
                this.textBot.innerHTML = app.parseText(text02, data.altColor);

                this.textTop.setAttribute('data-vertical-align', 'bottom');
                this.textTop.setAttribute('data-horizontal-align', 'left');
                this.textTop.style.lineHeight = feed.lineHeight;
                this.textTop.style.color = data.color;

                this.textBot.setAttribute('data-vertical-align', 'top');
                this.textBot.setAttribute('data-horizontal-align', 'left');
                this.textBot.style.lineHeight = feed.lineHeight;
                this.textBot.style.color = data.color;
                //this.textBot.style.height = "45px";
                //this.textBot.style.top = "165px";

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
            //this.banner.appendChild(this.textMid);
            this.banner.appendChild(this.textBot);
      //this.banner.appendChild(this.logoFin);  
            // this.boxCropFin.appendChild(this.boxMsg);
            // this.banner.appendChild(this.boxCropFin);


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
                        TweenLite.to(bets, 0.4, {
                            score: "+=" + points,
                            onUpdate: updateHandler,
                            ease: SteppedEase.config(10)
                        }, '+=0.1')
                    }
                }


                var rotateTween = new TimelineMax({
                    paused: true,
                    //yoyo: true,
                    repeat: 4,
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
                        autoAlpha: 1,  ease: Elastic.easeOut.config(1, 0.2),
                        onStart: startRotation
                    }, '-=0.2')
            }
            this.tween
                .to(this.textBot, 0.7, {
                    autoAlpha: 1, y: '-=10px', ease: Elastic.easeOut.config(1, 0.2),
                   onComplete: function () {
                        if (!self.hasDay1) {
                            startPulse();
                        }
                    }
                }, '-=0.3')
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
                    y: '+=0px',
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    transformPerspective: 1000,
                    ease: Sine.easeOut
                }, '+=3')
            if (self.hasDay1) {
                this.tween
                    .to(self.textMid, 0.4, {
                        autoAlpha: 0,
                        y: '+=0px',
                        ease: Sine.easeOut
                    }, '-=.2')
            }
            this.tween
                .to(this.textBot, 0.4, {
                    autoAlpha: 0,
                    y: '+=0px',
                    z: 0.1, /* add this for the jitter bug */
                    rotationZ: "0.01deg", /* add this for the jitter bug */
                    transformPerspective: 1000,
                    ease: Sine.easeOut,
                    onComplete: setBetsCountToOne
                }, '-=.2')
         
                if (this.isFinalScreen) {
                    this.tween
                        .to('#header', 0.5, {clip: "rect(0px, 0px, 35px, 0px);", ease: Sine.easeOut}, '-=0')
                        .to('#footer', 0.5, {
                            right: '-200px', ease: Sine.easeOut
                        }, '+=0.05')
                         .to('#logo', 0.5, {
                            left: '-200px', ease: Sine.easeOut
                        }, '-=0.5')
                }


            applyFontSize.call(this);
        }

        function applyFontSize() {
            var fitness = new app.Fitness();
            fitness.add(this.textTop);
            fitness.add(this.textBot);
            fitness.add(this.boxMsg);
            if (self.hasDay1) {
                fitness.add(self.textMid);
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

            app.betsCount = data

            this.logoFin = document.createElement('div');
            this.logoFin.id = 'logoFin';
            this.logoFin.style.backgroundImage = 'url(' + app.imagesPath + feed.logo + ')';
    

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
            // console.log(oddParsedText);
            var text01 = oddParsedText.replace(/\n/g, "<br>");
            this.textTop.innerHTML = app.parseText(text01, data.altColor);
            
            var oddParsedText = app.parseOdd(data.txt2);
            var text02 = oddParsedText.replace(/\n/g, "<br>");
            this.textBot.innerHTML = app.parseText(text02, data.altColor);
            //
            //var oddParsedText = app.parseOdd(data.txt3);
            //var text03 = oddParsedText.replace(/\n/g, "<br>");
            //this.textBot.innerHTML = app.parseText(text03, data.altColor);
            //
            //this.textTop.setAttribute('data-vertical-align', 'bottom');
            //this.textTop.setAttribute('data-horizontal-align', 'left');
            //this.textTop.style.lineHeight = feed.lineHeight;
            //this.textTop.style.color = data.color;
            //
            //this.textMid.setAttribute('data-vertical-align', 'top');
            //this.textMid.setAttribute('data-horizontal-align', 'left');
            //this.textMid.style.lineHeight = feed.lineHeight;
            //this.textMid.style.color = data.color;
            //
            //this.textBot.setAttribute('data-vertical-align', 'top');
            //this.textBot.setAttribute('data-horizontal-align', 'center');
            //this.textBot.style.lineHeight = feed.lineHeight;
            //this.textBot.style.color = data.color;

            //to check isDay1!
            // var testIsDay1 = app.parseOdd(data.txt1 + data.txt2 + data.txt3);

            // if (app.isDay1) {
            //     this.textTop.className = 'text finalTextTop';
            //     this.textBot.className = 'text finalTextBot';
            //     //ToDo In Streameye MUST BE \\n !!!!!!!!!!
            //     var oddParsedText = app.parseOdd(data.txt1);
            //     var text01 = oddParsedText.replace(/\n/g, "<br>");
            //     this.textTop.innerHTML = app.parseText(text01, data.altColor);

            //     var oddParsedText = app.parseOdd(data.txt2);
            //     var text02 = oddParsedText.replace(/\n/g, "<br>");
            //     this.textBot.innerHTML = app.parseText(text02, data.altColor);

            // } else {
            //     this.textTop.className = 'text finalTextTop';
            //     //this.textMid.className = 'text finalTextMid';
            //     this.textBot.className = 'text finalTextBot';
            //     //ToDo In Streameye MUST BE \\n !!!!!!!!!!
            //     var oddParsedText = app.parseOdd(data.txt1);
            //     var text01 = oddParsedText.replace(/\n/g, "<br>");
            //     this.textTop.innerHTML = app.parseText(text01, data.altColor);

            //     var oddParsedText = app.parseOdd(data.txt3);
            //     //var text02 = oddParsedText.replace(/\n/g, "<br>");
            //     //this.textMid.innerHTML = app.parseText(text02, data.altColor);

            //     var oddParsedText = app.parseOdd(data.txt2);
            //     var text03 = oddParsedText.replace(/\n/g, "<br>");
            //     this.textBot.innerHTML = app.parseText(text03, data.altColor);
            // }

            this.textTop.setAttribute('data-vertical-align', 'bottom');
            this.textTop.setAttribute('data-horizontal-align', 'center');
            this.textTop.style.lineHeight = 1;
            this.textTop.style.color = data.color;
            //
            //this.textMid.setAttribute('data-vertical-align', 'bottom');
            //this.textMid.setAttribute('data-horizontal-align', 'center');
            //this.textMid.style.lineHeight = 1;
            //this.textMid.style.color = data.color;

            this.textBot.setAttribute('data-vertical-align', 'top');
            this.textBot.setAttribute('data-horizontal-align', 'center');
            this.textBot.style.lineHeight = 1;
            this.textBot.style.color = data.color;


            this.banner = document.getElementById('banner');
            this.banner.appendChild(this.textTop);
            //this.banner.appendChild(this.textMid);
            this.banner.appendChild(this.textBot);
      //this.banner.appendChild(this.logoFin);    


            this.init(checkLoop);
        }


        FinalScrOffer2.prototype.init = function (checkLoop) {
            //  if (app.isDay1) {
            //     app.betsCount = document.getElementById('betsCount').innerText;

            // }
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

            // if (app.isDay1) {
            //     //var bets = {score: 1},
            //     var bets = app.score,
            //         points = (app.betsCount - 0) - 1;
            //     document.getElementById("betsCount").innerHTML = 1;
            //     //betDomEl = document.getElementById("test");

            //     function updateHandler() {
            //         if (app.isDay1) {
            //             var betDomEl = document.getElementById("betsCount");
            //             betDomEl.innerHTML = bets.score.toFixed(0);
            //         }
            //     }

            //     function addPoints() {
            //         //bets.score=1;
            //         if (app.isDay1) {
            //             TweenLite.to(bets, 0.6, {
            //                 score: "+=" + points,
            //                 onUpdate: updateHandler,
            //                 ease: SteppedEase.config(10)
            //             }, '+=0.05')
            //         }
            //     }
            // }
            this.tween = new TimelineMax({
                paused: true,
                onComplete: this.onComplete
            });

            ////is  Not Final Screen
            //if (!this.isFinalScreen) {
            //    this.tween
            //        .to(this.logoFin, 0.5, {width: '110px', ease: Sine.easeIn})
            //        .to(this.boxCropFin, 0.5, {width: '115px', ease: Sine.easeIn}, '-=.5')
            //}

            this.tween

                .set([this.textTop, this.textMid, this.textBot], {transformOrigin: "50% 50%"} )
                .from(this.textTop, 0.5, {autoAlpha:0}, '+=0.2')
                .from(this.textBot, 0.5, {top: 90, ease: Elastic.easeOut.config(0.1, 0.1) }, '-=0.1')
                // .to(this.textBot, 0.7, {autoAlpha: 1, y: '-=10px', ease: Elastic.easeOut.config(1, 0.2)}, '-=0')
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
                       // .to('#header', 0.5, {clip: "rect(0px, 0px, 90px, 0px)", ease: Sine.easeOut}, '-=0')
                       //  .to('#footer', 0.5, {right: '-160px', ease: Sine.easeOut}, '-=.5')
                // .to(this.textBot, 0.3, {
                //     autoAlpha: 0,
                //     y: '-=0px',
                //     scale: 0.7,
                //     z: 0.1,  add this for the jitter bug 
                //     rotationZ: "0.01deg", /* add this for the jitter bug */
                //     transformPerspective: 1000,
                //     ease: Sine.easeOut
                // }, '-=.1')
         
       
                if (this.isFinalScreen) {
                    this.tween
                        .to('#header', 0.5, {clip: "rect(0px, 0px, 35px, 0px);", ease: Sine.easeOut}, '-=0')
                        .to('#footer', 0.5, {
                            right: '-200px', ease: Sine.easeOut
                        }, '+=0.05')
                         .to('#logo', 0.5, {
                            left: '-200px', ease: Sine.easeOut
                        }, '-=0.5')
                }


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

            this.logoFin = document.createElement('div');
            this.logoFin.id = 'logoFin';
            this.logoFin.style.backgroundImage = 'url(' + app.imagesPath + feed.logo + ')';
    

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
            //var text01 = oddParsedText.replace(/\n/g, "<br>");
            //this.textTop.innerHTML = app.parseText(text01, data.altColor);
            //
            var oddParsedText = app.parseOdd(data.txt3);
            //var text02 = oddParsedText.replace(/\n/g, "<br>");
            //this.textMid.innerHTML = app.parseText(text02, data.altColor);
            //
            //var oddParsedText = app.parseOdd(data.txt3);
            //var text03 = oddParsedText.replace(/\n/g, "<br>");
            //this.textBot.innerHTML = app.parseText(text03, data.altColor);
            //
            //this.textTop.setAttribute('data-vertical-align', 'bottom');
            //this.textTop.setAttribute('data-horizontal-align', 'left');
            //this.textTop.style.lineHeight = feed.lineHeight;
            //this.textTop.style.color = data.color;
            //
            //this.textMid.setAttribute('data-vertical-align', 'top');
            //this.textMid.setAttribute('data-horizontal-align', 'left');
            //this.textMid.style.lineHeight = feed.lineHeight;
            //this.textMid.style.color = data.color;
            //
            //this.textBot.setAttribute('data-vertical-align', 'top');
            //this.textBot.setAttribute('data-horizontal-align', 'center');
            //this.textBot.style.lineHeight = feed.lineHeight;
            //this.textBot.style.color = data.color;

            //to check isDay1!
            var testIsDay1 = app.parseOdd(data.txt1 + data.txt2 + data.txt3);
 
                 
                var oddParsedText = app.parseOdd(data.txt1);
                var text01 = oddParsedText.replace(/\n/g, "<br>");
                this.textTop.innerHTML = app.parseText(text01, data.altColor);

                var oddParsedText = app.parseOdd(data.txt2);
                var text02 = oddParsedText.replace(/\n/g, "<br>");
                this.textMid.innerHTML = app.parseText(text02, data.altColor);

                var oddParsedText = app.parseOdd(data.txt3);
                var text03 = oddParsedText.replace(/\n/g, "<br>");
                this.textBot.innerHTML = app.parseText(text03, data.altColor);
            // }

            this.textTop.setAttribute('data-vertical-align', 'bottom');
            this.textTop.setAttribute('data-horizontal-align', 'center');
            this.textTop.style.lineHeight = 1;
            this.textTop.style.color = data.color;
            //
            this.textMid.setAttribute('data-vertical-align', 'middle');
            this.textMid.setAttribute('data-horizontal-align', 'center');
            this.textMid.style.lineHeight = 1;
            this.textMid.style.color = data.color;

            this.textBot.setAttribute('data-vertical-align', 'bottom');
            this.textBot.setAttribute('data-horizontal-align', 'center');
            this.textBot.style.lineHeight = 1;
            this.textBot.style.color = data.color;


            this.banner = document.getElementById('banner');
            this.banner.appendChild(this.textTop);
            this.banner.appendChild(this.textMid);
            this.banner.appendChild(this.textBot);
      //this.banner.appendChild(this.logoFin);    


            this.init(checkLoop);
        }



        FinalScrOffer3.prototype.init = function (checkLoop) {
            //  if (app.isDay1) {
            //     app.betsCount = document.getElementById('betsCount').innerText;

            // }
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

            // if (app.isDay1) {
            //     //var bets = {score: 1},
            //     var bets = app.score,
            //         points = (app.betsCount - 0) - 1;
            //     document.getElementById("betsCount").innerHTML = 1;
            //     //betDomEl = document.getElementById("test");

            //     function updateHandler() {
            //         if (app.isDay1) {
            //             var betDomEl = document.getElementById("betsCount");
            //             betDomEl.innerHTML = bets.score.toFixed(0);
            //         }
            //     }

            //     function addPoints() {
            //         //bets.score=1;
            //         if (app.isDay1) {
            //             TweenLite.to(bets, 0.6, {
            //                 score: "+=" + points,
            //                 onUpdate: updateHandler,
            //                 ease: SteppedEase.config(10)
            //             }, '+=0.05')
            //         }
            //     }
            // }
            this.tween = new TimelineMax({
                paused: true,
                onComplete: this.onComplete
            });

            ////is  Not Final Screen
            //if (!this.isFinalScreen) {
            //    this.tween
            //        .to(this.logoFin, 0.5, {width: '110px', ease: Sine.easeIn})
            //        .to(this.boxCropFin, 0.5, {width: '115px', ease: Sine.easeIn}, '-=.5')
            //}

            this.tween
              .set([this.textTop, this.textMid, this.textBot], {transformOrigin: "50% 50%"})
                .from(this.textTop, 0.5, {autoAlpha: 0,   ease: Sine.easeOut},'+=0.2') 
                .from(this.textMid, 0.4, {autoAlpha: 0 , ease: Sine.easeOut, onStart: startPulse}, '-=0.3')

                .from(this.textBot, 0.5, { autoAlpha: 0, top: 90,ease: Elastic.easeOut.config(0.2, 0.2), onComplete: startPulse }, '-=0.1')
                // .to(this.textBot, 0.7, {autoAlpha: 1, y: '-=10px', ease: Elastic.easeOut.config(1, 0.2)}, '-=0')
            //.to(this.textTop, 0.4, {rotationY: '0',transformPerspective :0,force3D:true, ease: Sine.easeOut})
             //.to(this.textBot, 0.4, {rotationY: '0',force3D:true,transformPerspective :0, ease: Sine.easeOut}, '-=0.4')

            if (this.isFinalScreen) {
                this.tween
                    .to(arrow, 0.6, {onStart: startArrow, onComplete: checkLoop}, '+=0')

            }
            this.tween
                //.to(this.textTop, 0.25, {rotationX: '90',transformPerspective :800,force3D:true, ease: Sine.easeOut}, '+=3')
                //.to(this.textMid, 0.25, {rotationX: '90',transformPerspective :800,force3D:true, ease: Sine.easeOut}, '-=.25')
                //.to(this.textBot, 0.25, {rotationX: '90',transformPerspective :800,force3D:true, ease: Sine.easeOut}, '-=.25')
                
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
                    ease: Sine.easeOut
                }, '-=.1')
       
                if (this.isFinalScreen) {
                    this.tween
                        .to('#header', 0.5, {clip: "rect(0px, 0px, 35px, 0px);", ease: Sine.easeOut}, '-=0')
                        .to('#footer', 0.5, {
                            right: '-200px', ease: Sine.easeOut
                        }, '+=0.05')
                         .to('#logo', 0.5, {
                            left: '-200px', ease: Sine.easeOut
                        }, '-=0.5')
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

        var screensLength = feed.screens.length;
        var screens = [],
            screenIndex = -1;

        var loops = feed.looping;

        var tcReturnTween = new TimelineMax({paused: true});
        tcReturnTween
            .to('#terms', 0.25, {right: 0, ease: Sine.easeOut})
            .to('#cta', 0.25, {right: -200, ease: Sine.easeOut})

        var showTc = function showTc() {
            tcReturnTween.restart();
        };


        var ctaReturnTween = new TimelineMax({paused: true});
        ctaReturnTween
            .to('#terms', 0.25, {right: -200, ease: Sine.easeOut})
            .to('#cta', 0.25, {right: 0, ease: Sine.easeOut})

        var showCta = function showCta() {
            ctaReturnTween.restart();
        };


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
            app.score.score = 1;
            screenIndex += 1;
            setTimeout(function () {
                screens[screenIndex].tween.restart();
            }, 20);
        }

        function playFirstScreen() {
            screenIndex = 0;
            TweenLite.delayedCall(0.1, showTc);

            if (loops > feed.looping) {

                if (screens[screenIndex].hasText) {
                    screens[screenIndex].tween.restart();
                    screens[screenIndex].tween.play(2);
                    TweenLite.delayedCall(4.7, showCta);
                    TweenLite.delayedCall(3, function () {
                        screens[screenIndex].tween.restart();
                        screens[screenIndex].tween.play(screens[screenIndex].tween.totalDuration() - 3.25);


                    });
                } else {
                    screens[screenIndex].tween.restart();
                    screens[screenIndex].tween.play(2);
                    TweenLite.delayedCall(4.4, showCta);
                    TweenLite.delayedCall(3, function () {
                        screens[screenIndex].tween.restart();
                        screens[screenIndex].tween.play(screens[screenIndex].tween.totalDuration() - 0.2);
                        //console.log(screens[screenIndex].tween.totalDuration()-0.45);

                    });
                }

            } else {
                screens[screenIndex].tween.restart();
                TweenLite.delayedCall(7, showCta);
            }
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