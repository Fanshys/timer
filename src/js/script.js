let timerCount = 0;
let timersArray = [];

function createStopwatch(name, time = 0, id = timerCount) {
    document.querySelector('.stopwatch__create').insertAdjacentHTML('beforebegin',
        '<div class="stopwatch-item row">' +
        '<button class="stopwatch-item__delete"><i class="far fa-trash-alt"></i></button>' +
        '<div class="stopwatch-item__name-block col-12 col-md-6">' +
        '<label><input class="stopwatch-item__name" value="' + name + '" readonly="readonly" maxlength="15">' +
        '<button class="stopwatch-item__name-icon"><i class="fas fa-pencil-alt"></i></button></label>' +
        '</div>' +
        '<div class="stopwatch-item__counter-block col-12 col-md-6" name="clockform">' +
        '<span id="timer-' + id + '" class="stopwatch-item__counter stopwatch">00:00:00</span>' +
        '<div id="' + id + '" class="stopwatch-item__buttons">' +
        '<button class="stopwatch-item__button start-button">Старт</button>' +
        '<button class="stopwatch-item__button pause-button">Пауза</button>' +
        '<button class="stopwatch-item__button reset-button">Сброс</button>' +
        '</div></div></div>'
    )
    worker.postMessage({
        'func': 'create',
        'time': time,
        'name': name,
        'id': id
    });
    timersArray.push({
        'name': name,
        'time': time,
        'id': id
    })
    timerCount++;
    allEventSet();
}

var worker = new Worker("./build/js/worker.js");

worker.onmessage = function (e) {
    let id = e.data['id'];
    var item = timersArray.find(item => item.id === id);

    document.querySelector("#timer-" + id).innerHTML = e.data["time"];
    document.title = e.data["name"] + ' - ' + e.data["time"];

    item.time = e.data["diff"];
    item.name = e.data["name"];
    sendData();
};

function sendData() {
    localStorage.setItem("timersArray", JSON.stringify(timersArray));
}

function startTimer(id) {
    worker.postMessage({
        'func': 'start',
        'id': id
    });
}

function pauseTimer(id) {
    worker.postMessage({
        'func': 'pause',
        'id': id
    });
}

function resetTimer(id) {
    worker.postMessage({
        'func': 'reset',
        'id': id
    });
}

function renameTimerEvent() {
    // Переименование секундомера
    document.querySelectorAll(".stopwatch-item:nth-last-of-type(2) .stopwatch-item__name-icon")[0].addEventListener('click', function () {
        let id = this.parentElement.parentElement.nextElementSibling.children[1].getAttribute('id');
        if (this.previousSibling.getAttribute("readonly") == 'readonly') {
            this.innerHTML = '<i class="fas fa-check"></i>';
            this.previousSibling.removeAttribute("readonly");
            this.previousSibling.setAttribute("style", "border-bottom: 2px solid #00b3d6; color: white");
        } else {
            this.innerHTML = '<i class="fas fa-pencil-alt"></i>';
            this.previousSibling.setAttribute("readonly", "readonly");
            this.previousSibling.setAttribute("style", "border-bottom: none; color: #b4f5fd");
            let name = this.previousSibling.value;
            let item = timersArray.find(item => item.id == id);
            item.name = name;
            worker.postMessage({
                'func': 'rename',
                'id': id,
                'name': name
            });
            sendData();
        }
    });

    // Применение переименования по нажатию на enter
    document.querySelectorAll(".stopwatch-item:nth-last-of-type(2) .stopwatch-item__name")[0].addEventListener('keyup', function (event) {
        if (event.keyCode == 13) {
            if (!this.getAttribute("readonly")) {
                let id = this.parentElement.parentElement.nextElementSibling.children[1].getAttribute('id');
                this.nextElementSibling.innerHTML = '<i class="fas fa-pencil-alt"></i>';
                this.setAttribute("readonly", "readonly");
                this.setAttribute("style", "border-bottom: none; color: #b4f5fd");

                let name = this.value;
                let item = timersArray.find(item => item.id == id);
                item.name = name;
                worker.postMessage({
                    'func': 'rename',
                    'id': id,
                    'name': name
                });
                sendData();
            }
        }
    });
}

function deleteTimerEvent() {
    document.querySelectorAll(".stopwatch-item:nth-last-of-type(2) .stopwatch-item__delete")[0].addEventListener('click', function () {
        let id = this.parentElement.children[2].children[1].getAttribute('id');
        worker.postMessage({
            'func': 'delete',
            'id': id
        });
        var item = timersArray.find(item => item.id == id);
        timersArray.splice(timersArray.indexOf(item), 1);
        this.parentElement.remove();
        localStorage.setItem("timersArray", JSON.stringify(timersArray));
    });
}

function startTimerEvent() {
    document.querySelectorAll(".stopwatch-item:nth-last-of-type(2) .start-button")[0].addEventListener('click', function () {
        let id = this.parentElement.getAttribute('id');
        startTimer(id);
    });
}

function pauseTimerEvent() {
    document.querySelectorAll(".stopwatch-item:nth-last-of-type(2) .pause-button")[0].addEventListener('click', function () {
        let id = this.parentElement.getAttribute('id');
        pauseTimer(id);
    });
}

function resetTimerEvent() {
    document.querySelectorAll(".stopwatch-item:nth-last-of-type(2) .reset-button")[0].addEventListener('click', function () {
        let id = this.parentElement.getAttribute('id');
        resetTimer(id);
    });
}

function allEventSet() {
    startTimerEvent();
    pauseTimerEvent();
    resetTimerEvent();
    renameTimerEvent();
    deleteTimerEvent();
}

// Создание по нажатию на enter
document.querySelector(".input__create").addEventListener('keyup', function (event) {
    if (event.keyCode == 13) {
        let name = this.value;
        createStopwatch(name);
        this.value = '';
    }
});

//Создание
document.querySelector('.button__create').addEventListener('click', function () {
    let name = document.querySelector('.input__create').value;
    document.querySelector('.input__create').value = '';
    createStopwatch(name);
});

document.addEventListener("DOMContentLoaded", function () {
    // Создание секундомеров из localStorage при загрузке страницы
    if (localStorage.getItem("timersArray") && JSON.parse(localStorage.getItem("timersArray")).length) {
        const items = JSON.parse(localStorage.getItem("timersArray"));
        items.forEach(element => {
            timerCount = timerCount < element["id"] ? element["id"] : timerCount;
            createStopwatch(element["name"], element["time"], element["id"]);
        });
    } else {
        createStopwatch("Секундомер");
    }
})