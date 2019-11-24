// Класс секундомера
class Stopwatch {
    constructor(display, name) {
        this.name = name;
        this.running = false;
        this.display = display;
        this.reset();
        this.print(this.times);
    }

    // Сброс счетчика
    reset() {
        this.stop()
        this.times = [0, 0, 0, 0];
        this.print();
    }

    // Старт отсчета
    start() {
        if (!this.time) this.time = performance.now();
        if (!this.running) {
            this.running = true;
            requestAnimationFrame(this.step.bind(this));
        }
    }

    // Пауза
    stop() {
        this.running = false;
        this.time = null;
    }

    step(timestamp) {
        if (!this.running) return;
        this.calculate(timestamp);
        this.time = timestamp;
        this.print();
        requestAnimationFrame(this.step.bind(this));
    }

    // Расчет времени
    calculate(timestamp) {
        var diff = timestamp - this.time;
        // Hundredths of a second are 100 ms
        this.times[3] += diff / 10;
        // Seconds are 100 hundredths of a second
        if (this.times[3] >= 100) {
            this.times[2] += 1;
            this.times[3] -= 100;
        }
        // Minutes are 60 seconds
        if (this.times[2] >= 60) {
            this.times[1] += 1;
            this.times[2] -= 60;
        }
        // Hours are 60 minutes
        if (this.times[1] >= 60) {
            this.times[0] += 1;
            this.times[1] -= 60;
        }
    }

    // Вывод времени
    print() {
        this.display.text(this.format(this.times));
    }

    // Формат вывода времени
    format(times) {
        return `\
        ${pad0(times[0], 2)}:\
        ${pad0(times[1], 2)}:\
        ${pad0(times[2], 2)}`;
    }

    // Получение данных объекта
    getData() {
        let arr = {
            name: this.name,
            time: this.times
        };
        return arr;
    }
}

// Преобразование полей времени счетчика в вид '00'
function pad0(value, count) {
    var result = value.toString();
    for (; result.length < count; --count)
        result = '0' + result;
    return result;
}

// Массив объектов секундомера
let stopwatch = [];
let i = 0;

// Инициализация объектов для существующих елементов
$('.stopwatch-item').each(function () {
    stopwatch.push(new Stopwatch(
        $(`.stopwatch:eq(${i})`),
        $(`.stopwatch-item__name:eq(${i})`).val()
    ))
    i++;
})

// Создание нового элемента
const createStopwatch = function (name) {
    $('.stopwatch__create').before(
        '<div class="stopwatch-item row">' +
        '<button class="stopwatch-item__delete"><i class="far fa-trash-alt"></i></button>' +
        '<div class="stopwatch-item__name-block col-12 col-md-6">' +
        '<label><input class="stopwatch-item__name" value="' + name + '" readonly maxlength="15">' +
        '<button class="stopwatch-item__name-icon"><i class="fas fa-pencil-alt"></i></button></label>' +
        '</div>' +
        '<div class="stopwatch-item__counter-block col-12 col-md-6" name="clockform">' +
        '<span id="clock" class="stopwatch-item__counter stopwatch">00:00:00</span>' +
        '<div class="stopwatch-item__buttons">' +
        '<button class="stopwatch-item__button start-button">Старт</button>' +
        '<button class="stopwatch-item__button pause-button">Пауза</button>' +
        '<button class="stopwatch-item__button reset-button">Сброс</button>' +
        '</div></div></div>'
    )

    // Инициализация созданного элемента
    stopwatch.push(new Stopwatch(
        $(`.stopwatch:eq(${i})`),
        name
    ))
    i++;
    $('.input__create').val('');
}

// Сбор данных со всех существующих объектов секундомера
const getDataStopwatch = function () {
    let arr = [];
    stopwatch.forEach(elem => arr.push(elem.getData()));
    return JSON.stringify(arr);
}

// Триггеры для управления секундомерами
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
    stopwatch[x].reset();
});

$(document).on('click', '.button__create', function () {
    let name = $('.input__create').val();
    createStopwatch(name);
});

$(document).on('click', '.stopwatch-item__delete', function () {
    let x = $(this).index('.stopwatch-item__delete');
    stopwatch.splice(x, 1);
    $(this).parent().remove();
    i--;
});

// Переименование секундомера
$(document).on('click', '.stopwatch-item__name-icon', function () {
    let x = $(this).index('.stopwatch-item__name-icon');
    if ($(this).prev().attr("readonly")) {
        $(this).html('<i class="fas fa-check"></i>');
        $(this).prev().removeAttr("readonly").css("border-bottom", "2px solid #00b3d6").css("color", "white");
    } else {
        $(this).html('<i class="fas fa-pencil-alt"></i>');
        $(this).prev().attr("readonly", "readonly").css("border-bottom", "none").css("color", "#b4f5fd");
        stopwatch[x].name = $(this).prev().val();
    }
});