(function () {

    var shakeTween = new TimelineMax({repeat: -1, repeatDelay: 0, paused: true});
    shakeTween.
        fromTo([self.leftDirt,self.rightDirt,self.asset], 0.8, {y: '-=0.7'}, {
            y: '+=0.7',
            ease: RoughEase.ease.config({
                template: Linear.easeNone,
                strength: 10,
                points: 90,
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

})();