
// Класс секундомера
class Stopwatch {
    constructor(display, name, time = [0, 0, 0]) {
        this.name = name;
        this.running = false;
        this.display = display;
        this.times = time;
        this.print(this.times);
    }

    // Сброс счетчика
    reset() {
        this.stop()
        this.times = [0, 0, 0];
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
        this.times[2] += diff / 1000;
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
        ${pad0(Math.floor(times[2]), 2)}`;
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

// Создание нового элемента
function createStopwatch(name, time = [0, 0, 0]) {
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
        name,
        time
    ))
    i++;
    $('.input__create').val('');
    
}

// Сбор данных со всех существующих объектов секундомера
function getDataStopwatch() {
    let arr = [];
    stopwatch.forEach(elem => arr.push(elem.getData()));
    return JSON.stringify(arr);
}

// Проверка на наличие работающих секундомеров
function checkTimersWork() {
    let result = false;
    stopwatch.forEach(elem => elem.running == true ? result = true : false);
    if (!result) {
        myWorker.postMessage({
            'work': 'false'
        });
    }
}

// Пересылка собранных данных в localstorage
function localStor() {
    let json = getDataStopwatch();
    localStorage.setItem("json", json);
}

var myWorker = new Worker("./build/js/worker.js");
myWorker.postMessage({
    'work': 'true'
});
let ie = 0;
myWorker.onmessage = function () {
    localStor();
    checkTimersWork();
}

// Триггеры для управления секундомерами
$(document).on('click', '.start-button', function () {
    let x = $(this).index('.start-button');
    stopwatch[x].start();
    myWorker.postMessage({
        'work': 'true'
    });
});

$(document).on('click', '.pause-button', function () {
    let x = $(this).index('.pause-button');
    stopwatch[x].stop();
    myWorker.postMessage({
        'work': 'true'
    });
});

$(document).on('click', '.reset-button', function () {
    let x = $(this).index('.reset-button');
    stopwatch[x].reset();
    myWorker.postMessage({
        'work': 'true'
    });
});

$(document).on('click', '.button__create', function () {
    let name = $('.input__create').val();
    createStopwatch(name);
    myWorker.postMessage({
        'work': 'true'
    });
});

$(document).on('click', '.stopwatch-item__delete', function () {
    let x = $(this).index('.stopwatch-item__delete');
    stopwatch.splice(x, 1);
    $(this).parent().remove();
    i--;
    myWorker.postMessage({
        'work': 'true'
    });
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

$(document).ready(function () {
    // Создание секундомеров из localStorage при загрузке страницы
    if (JSON.parse(localStorage.getItem("json")).length > 0) {
        const items = JSON.parse(localStorage.getItem("json"));
        items.forEach(element => createStopwatch(element["name"], element["time"]));
    } else {
        createStopwatch("Секундомер");
    }

    // Применение переименования по нажатию на enter
    $(document).on('keyup', '.stopwatch-item__name', (function (event) {
        if (event.keyCode == 13) {
            if (!$(this).attr("readonly")) {
                let x = $(this).index('.stopwatch-item__name');
                $(this).next().html('<i class="fas fa-pencil-alt"></i>');
                $(this).attr("readonly", "readonly").css("border-bottom", "none").css("color", "#b4f5fd");
                stopwatch[x].name = $(this).val();
                
            }
        }
    }));

    // Создание по нажатию на enter
    $(".input__create").keyup(function (event) {
        if (event.keyCode == 13) {
            let name = $(this).val();
            createStopwatch(name);
            
        }
    });
})