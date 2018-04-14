/*
 * 
 */

Vue.component('colorpicker', {
    template: ''
        + ' <div class="colorpicker">'
        + '     <button :class="`colorpicker--btn colorpicker--btn-${ idx } colorpicker--btn-set${ set_color } colorblind-${ colorblindmode }`" @click="showColorPicker()">{{ set_color }}</button>'
        + '     <div class="colorpicker--menu" v-if="colorpicker_visible">'
        + '         <div v-for="o in options" class="colorpicker--pick">'
        + '             <span :class="`colorpicker--pick-${ o } colorblind-${ colorblindmode }`" @click="pickColor(o)">{{ o }}</span>'
        + '         </div>'
        + '     </div>'
        + ' </div>',
    props: [
        'idx',
        'iteration',
        'colorblindmode'
    ],
    data: function () {
        return {
            options: [1,2,3,4,5,6],
            colorpicker_visible: false,
            set_color: 0
        }
    },
    methods: {
        showColorPicker: function() {
            this.colorpicker_visible = true;
        },
        pickColor: function(color) {
            this.set_color = color;
            this.colorpicker_visible = false;
            this.$emit('pick', { color: color, idx: this.idx })
        }
    },
    watch: {
        iteration: function() {
            this.set_color = 0;
        }
    }
})

vm = new Vue({
    el: '#app',
    data: {
        script: {
            start: true,
            make_master_code: false,
            guess_code: false,
            game_win: false,
            game_loose: false
        },
        mastercode: [0,0,0,0],
        attempts: [],
        hints: [],
        current_guess: [0,0,0,0],
        colorblind_mode: false
    },
    methods: {
        initMasterCode: function() {
            alert('Hand the device to the person who will create the master code.');
            this.script.start = false;
            this.script.make_master_code = true;
        },
        initRandomGame: function() {
            function getRandomNum() {
                return Math.floor( (Math.random()*6)+1 )
            }
            this.mastercode = [
                getRandomNum(),
                getRandomNum(),
                getRandomNum(),
                getRandomNum()
            ]
            this.script.start = false;
            this.script.guess_code = true;
            this.doGuess();
        },
        setMasterCodeColor: function(payload) {
            this.mastercode[payload.idx] = payload.color;
        },
        setGuessColor: function(payload) {
            this.current_guess[payload.idx] = payload.color;
        },
        initGuess: function() {
            alert('Now hand the device to the other player');
            this.doGuess();
        },
        doGuess: function() {
            this.script.make_master_code = false;
            this.script.guess_code = true;
        },
        resolveGuess: function() {
            this.runThroughColors();
            this.updateAttempts();
            this.$emit('cleanup', 0);
            this.checkForWin();
        },
        checkForWin: function() {
            if (JSON.stringify(this.current_guess) === JSON.stringify(this.mastercode)) {
                this.script.guess_code = false;
                this.script.game_win = true;
            } else if (this.attempts.length > 11) {
                this.script.guess_code = false;
                this.script.game_loose = true;
            } else {
                this.current_guess = [0,0,0,0];
            };
        },
        updateAttempts: function() {
            console.log(this.attempts);
            this.attempts.push({
                guess: this.current_guess,
                hints: this.hints.sort().reverse()
            });
            this.hints = []; // Cleanup after updating attempts
        },
        runThroughColors: function() {
            for (var c = 1; c <= 6; c++) {
                var colors1 = this.findColors(this.mastercode, c);
                var colors2 = this.findColors(this.current_guess, c);
                if (colors1.length > 0 && colors2.length > 0) {
                    this.compareColorPositions(colors1, colors2);
                };
            };
        },
        compareColorPositions: function(arr1, arr2) {
            if (arr1.length > 0 && arr2.length > 0) {
                if (arr1.length - arr2.length >= 0) {
                    // There are fewer or the same matching colors in guess
                    this.assignHints(arr1, arr2);
                } else if (arr1.length - arr2.length < 0) {
                    // There are too many matching colors in guess
                    this.assignHints(arr2, arr1);
                };
            };
        },
        findColors: function(arr, color) {
            var instances = [],
                idx = arr.indexOf(color);
            while (idx != -1) {
                instances.push(idx);
                idx = arr.indexOf(color, idx + 1);
            };
            return instances;
        },
        assignHints: function(long_arr, short_arr) {
            for (var a in short_arr) {
                if (long_arr.indexOf(short_arr[a]) !== -1) {
                    this.hints.push(2);
                } else {
                    this.hints.push(1);
                };
            };
        },
        reset: function() {
            this.script.game_win = false;
            this.script.game_loose = false;
            this.script.start = true;
            this.mastercode = [0,0,0,0];
            this.attempts = [];
            this.hints = [];
            this.current_guess = [0,0,0,0];
        }
    }
});
