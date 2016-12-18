(function ($) {
    function installer(options) {
        var items = [],
            $self = $({}),
            initialized = false;

        function init() {
            // need some delay while plugin will render himself
            setTimeout(function () {
                initialized = true;
                notify('ready', isInstalled());

                setVisibility();
            },
            1000);
        }

        function setVisibility() {
            if (!isInstalled())
                show();
        }

        function register(elem) {
            var redirectUrl = options.redirectUrl;

            $(elem).attr(
            {
                'onclick': 'installApp().done(function(){window.open("'+ redirectUrl +'", "_blank")});return false;',
                'href': ''
            });

            items.push({
                elem: elem
            });

            if (initialized) {
                setVisibility();
            }
        }

        function isChrome() {
            return typeof chrome != 'undefined';
        }

        function isInstalled() {
            if (!isChrome())
                return false;

            return chrome.app.isInstalled || $('.plugin-installed').length > 0;
        }

        function forEach(handler) {
            items.forEach(function (item) {
                handler($(item.elem));
            });
        }

        function hide() {
            forEach(function ($elem) {
                $elem.hide();
            });
        }

        function show() {
            forEach(function ($elem) {
                $elem.show();
            });
        }

        function notify(eventName, data) {
            $self.trigger(eventName, data);
        }

        function install() {
            var d = $.Deferred();

            try {
                if (isInstalled())
                    return;

                if (isChrome()) {
                    chrome.webstore.install('',
                        function (msg) {
                            hide();

                            d.resolve();
                        },

                        function (msg, code) {
                            if (code != 'userCancelled')
                                showError(msg);

                            console.warn('Error occured during plugin installation: ' + msg + '.');
                        });
                } else {
                    showError('Плагин работает только в браузере Google Chrome на настольных ПК');
                }
            } catch (ex) {
                showError();
            }

            return d.promise().
                done(function() {
                    notify('installed');
                }).done(setPluginInstalledClientActivity);
        }

        function setPluginInstalledClientActivity() {
            var url= document.location.protocol + '//' + document.location.host + '/trackPluginInstalled';

            $.ajax({
                dataType: 'json',
                type: 'GET',
                url: url,
            }).error(function () {
                console.warn('Cant update client plugin installed track.');
            }).done(function () {
            });
        }

        function showError(message) {
            alert(message ? message : 'Не удалось установить плагин.');
        }

        function onReady(handler) {
            $self.bind('ready', handler);

            if (initialized)
                handler(null, isInstalled());

            return this;
        }

        function onInstall(handler) {
            $self.bind('installed', handler);

            return this;
        }

        init();

        return {
            register: register,
            install: install,

            onReady: onReady,
            onInstall: onInstall
        };
    }

    $.fn.chromeExtensionInstaller = function (options) {
        return chromeExtensionInstaller(this.get(0), options);
    };

    var chromeExtensionInstaller = function (elem, options) {
        if (!window.installer)
            window.installer = installer(options);

        if (elem)
            window.installer.register(elem, options);

        return window.installer;
    };
})(jQuery);

function installApp() {
    return window.installer.install();
}