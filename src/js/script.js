class Stopwatch {
    constructor(display, results) {
        this.running = false;
        this.display = display;
        this.results = results;
        this.laps = [];
        this.reset();
        this.print(this.times);
    }

    reset() {
        this.times = [0, 0, 0];
    }

    start() {
        if (!this.time) this.time = performance.now();
        if (!this.running) {
            this.running = true;
            requestAnimationFrame(this.step.bind(this));
        }
    }

    lap() {
        let times = this.times;
        let li = document.createElement('li');
        li.innerText = this.format(times);
        this.results.appendChild(li);
    }

    stop() {
        this.running = false;
        this.time = null;
    }

    restart() {
        if (!this.time) this.time = performance.now();
        if (!this.running) {
            this.running = true;
            requestAnimationFrame(this.step.bind(this));
        }
        this.reset();
    }

    clear() {
        clearChildren(this.results);
    }

    step(timestamp) {
        if (!this.running) return;
        this.calculate(timestamp);
        this.time = timestamp;
        this.print();
        requestAnimationFrame(this.step.bind(this));
    }

    calculate(timestamp) {
        var diff = timestamp - this.time;
        // Hundredths of a second are 100 ms
        this.times[2] += diff / 10;
        // Seconds are 100 hundredths of a second
        if (this.times[2] >= 100) {
            this.times[1] += 1;
            this.times[2] -= 100;
        }
        // Minutes are 60 seconds
        if (this.times[1] >= 60) {
            this.times[0] += 1;
            this.times[1] -= 60;
        }
    }

    print() {
        this.display.text(this.format(this.times));
    }

    format(times) {
        return `\
        ${pad0(times[0], 2)}:\
        ${pad0(times[1], 2)}:\
        ${pad0(Math.floor(times[2]), 2)}`;
    }
}

function pad0(value, count) {
    var result = value.toString();
    for (; result.length < count; --count)
        result = '0' + result;
    return result;
}

function clearChildren(node) {
    while (node.lastChild)
        node.removeChild(node.lastChild);
}


let stopwatch = [];
let i = 0;

$('.stopwatch-item').each(function () {
    stopwatch.push(new Stopwatch(
        $(`.stopwatch:eq(${i})`),
    ))
    i++;
})

$(document).on('click', '.start-button', function () {
    let x = $(this).index('.start-button');
    stopwatch[x].start();
});

$(document).on('click', '.pause-button', function () {
    let x = $(this).index('.pause-button');
    stopwatch[x].stop();
});

$(document).on('click', '.reset-button', function () {
    let x = $(this).index('.reset-button');
    stopwatch[x].restart();
});

$(document).on('click', '.button__create', function () {
    let name = $('.input__create').val();
    $('.stopwatch__create').before(
        '<div class="stopwatch-item row">' +
        '<div class="stopwatch-item__name-block col-12 col-md-6">' +
        '<h2 class="stopwatch-item__name">' + name + '</h2>' +
        '</div>' +
        '<div class="stopwatch-item__counter-block col-12 col-md-6" name="clockform">' +
        '<span id="clock" class="stopwatch-item__counter stopwatch">00:00:00</span>' +
        '<div class="stopwatch-item__buttons">' +
        '<button class="stopwatch-item__button start-button stopwatch-button">Старт</button>' +
        '<button class="stopwatch-item__button pause-button stopwatch-button">Пауза</button>' +
        '<button class="stopwatch-item__button reset-button stopwatch-button">Ресет</button>' +
        '</div>' +
        '</div>' +
        '</div>'
    )
    stopwatch.push(new Stopwatch(
        $(`.stopwatch:eq(${i})`),
    ))
    i++;
    $('.input__create').val('');
})