https://developer.chrome.com/extensions


Расширение для Chrome - это набор html/css/js файлов (бандл).
Основной файл - это manifest.json (https://developer.chrome.com/extensions/manifest)
Остальные файлы опциональны (доступны по адресу chrome-extension://<extensionID>/<pathToFile>)

extensionID как и другие  константы, доступны в коде:
body {
    background-image:url('chrome-extension://__MSG_@@extension_id__/background.png');
}
// locale
<script type="text/javascript" src="'/__MSG_@@ui_locale/dir.js"></script>

Расширение может взаимодействовать с:
1) с  DOM и прочим API web страниц
2) с XMLHttpRequest
3) c Chrome API

Есть также особенный вид расширений - Chrome Apps - позволяющие создавать like нативные приложения
Весь UI обычных приложений как правило сводится к browser action и page action (иконки сверху справа)
page_action    - относится к конкретной странице
browser_action - может использоваться на любых страницах
permissions	   - разрешения (внешние сайты + текущая вкладка)


Архитектура (https://developer.chrome.com/extensions/overview#arch)

background_page - невидимая страница с основной логикой приложения
content_script  - скрипт, выполняемый на текущей web странице

background_page бывают персистентные и на событиях (persistent background pages и event pages)

UI может быть в виде popup + дополнительные страницы, переопределение текущей страницы
(https://developer.chrome.com/extensions/override) или создание отдельного окна
через tabs.create или window.open()

content_script не имеет доступ к DOM страниц расширения, но может обмениваться с ними сообщениями.

chrome.* API - большинство методов асинхронны. Поэтому, если нужно будет получить от апи какой-то
результат, нужно передавать в него каллбэк, например:

	chrome.tabs.create(object createProperties, function callback)

Синхронные метода сразу возвращают результат:

	string chrome.runtime.getURL()


EXAMPLES:

Обновить URL в активном табе:

chrome.tabs.query({'active': true}, function(tabs) {
  chrome.tabs.update(tabs[0].id, {url: newUrl});
});
