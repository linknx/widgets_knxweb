/*
 * jDigiClock plugin 2.1
 *
 * http://www.radoslavdimov.com/jquery-plugins/jquery-plugin-digiclock/
 *
 * Copyright (c) 2009 Radoslav Dimov
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */


(function($) {
    $.fn.extend({

        jdigiclock: function(options) {

            var defaults = {
                clockImagesPath: 'widgets/digiclock/images/clock/',
                weatherImagesPath: 'widgets/digiclock/images/weather/',
                lang: 'en',
                am_pm: false,
                weatherLocationCode: 'EUR|BG|BU002|BOURGAS',
                weatherMetric: 'C',
                weatherUpdate: 0,
                proxyType: 'php'
                
            };

            var regional = [];
            regional['en'] = {
                monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                weatherNames: ['','Sunny','Mostly Sunny','Partly Sunny','Intermittent Clouds','Hazy Sunshine','Mostly Cloudy','Cloudy (AM and PM)','Dreary (AM and PM)','','','Fog (AM and PM)','Showers (AM and PM)','Mostly Cloudy with Showers','Partly Sunny with Showers','Thunderstorms (AM and PM)','Mostly Cloudy with Thunder Showers','Partly Sunny with Thunder Showers','Rain (AM and PM)','Flurries (AM and PM)','Mostly Cloudy with Flurries','Partly Sunny with Flurries','Snow (AM and PM)','Mostly Cloudy with Snow','Ice (AM and PM)','Sleet (AM and PM)','Freezing Rain (AM and PM)','','','Rain and Snow Mixed (AM and PM)','Hot (AM and PM)','Cold (AM and PM)','Windy (AM and PM)','Clear','Mostly Clear','Partly Cloudy','Intermittent Clouds','Hazy','Mostly Cloudy','Partly Cloudy with Showers','Mostly Cloudy with Showers','Partly Cloudy with Thunder Showers','Mostly Cloudy with Thunder Showers','Mostly Cloudy with Flurries','Mostly Cloudy with Snow']
            }
            regional['fr'] = {
                monthNames: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Déc'],
                dayNames: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
                weatherNames: ['','Ensoleillé',"Ensoleillé dans l'ensemble","Ensoleillé dans l'ensemble",'Nuages intermittents','Soleil voilé','Nuageux','Nuageux (Matin et Après-midi)','Grisaille (Matin et Après-midi)','','','Brouillard (Matin et Après-midi)','Averses (Matin et Après-midi)','Nuageux avec averses','Ensoleillé avec averses','Orages (Matin et Après-midi)','Nuageux avec averses et tonnerre','Ensoleillé avec averses et tonnerre','Pluies (Matin et Après-midi)','Averses de neige (Matin et Après-midi)','Nuageux avec averses de neige','Ensoleillé avec averses de neige','Neige (Matin et Après-midi)','Nuageux avec neige','Ice (Matin et Après-midi)','Grisail (Matin et Après-midi)','Pluie verglaçante (Matin et Après-midi)','','','Pluie et neige mêlées (Matin et Après-midi)','Très Chaud (Matin et Après-midi)','Froid (Matin et Après-midi)','Venté (Matin et Après-midi)','Effacé','Ciel dégagé','Partiellement nuageux','Nuages intermittents','Brumeux','Nuageux','Partiellement nuageux avec averses','Nuageux avec averses','Partiellement nuageux avec averses de grèles','Nuageux avec averses et tonnerre','Nuageux avec averses de neige','Nuageux avec neige']
            }


            var options = $.extend(defaults, options);

            return this.each(function() {
                
                var $this = $(this);
                var o = options;
                $this.clockImagesPath = o.clockImagesPath;
                $this.weatherImagesPath = o.weatherImagesPath;
                $this.lang = regional[o.lang] == undefined ? regional['en'] : regional[o.lang];
                $this.am_pm = o.am_pm;
                $this.weatherLocationCode = o.weatherLocationCode;
                $this.weatherMetric = o.weatherMetric == 'C' ? 1 : 0;
                $this.weatherUpdate = o.weatherUpdate;
                $this.proxyType = o.proxyType;
                $this.currDate = '';
                $this.timeUpdate = '';


                var html = '<div id="plugin_container">';
                html    += '<p id="left_arrow"><img src="widgets/digiclock/images/icon_left.png" /></p>';
                html    += '<p id="right_arrow"><img src="widgets/digiclock/images/icon_right.png" /></p>';
                html    += '<div id="digital_container">';
                html    += '<div id="clock"></div>';
                html    += '<div id="weather"></div>';
                html    += '</div>';
                html    += '<div id="forecast_container"></div>';
                html    += '</div>';

                $this.html(html);

                $this.displayClock($this);

                $this.displayWeather($this);               

                $('#right_arrow', $this).unbind();
                $('#right_arrow', $this).bind('click', function() {
                    $('#plugin_container > div', $this).filter(function(i) {
                        $(this).animate({'left': (i * 500) - 500 + 'px'}, 400);                        
                    });
                    $(this).hide();
                    $('#left_arrow', $this).show();
                });

                $('#left_arrow', $this).unbind();
                $('#left_arrow', $this).hide();
                $('#left_arrow', $this).bind('click', function() {
                    $('#plugin_container > div', $this).filter(function(i) {
                        $(this).animate({'left': i * 500 + 'px'}, 400);
                    });
                    $(this).hide();
                    $('#right_arrow', $this).show();
                });

            });
        }
    });
   

    $.fn.displayClock = function(el) {
        $.fn.getTime(el);
        setTimeout(function() {$.fn.displayClock(el)}, $.fn.delayClock());
    }

    $.fn.displayWeather = function(el) {
        $.fn.getWeather(el);
        if (el.weatherUpdate > 0) {
            setTimeout(function() {$.fn.displayWeather(el)}, (el.weatherUpdate * 60 * 1000));
        }
    }

    $.fn.delayClock = function() {
        var now = new Date();
        var delay = (60 - now.getSeconds()) * 1000;
        
        return delay;
    }

    $.fn.getTime = function(el) {
        var now = new Date();
        var old = new Date();
        old.setTime(now.getTime() - 60000);
        
        var now_hours, now_minutes, old_hours, old_minutes, timeOld = '';
        now_hours =  now.getHours();
        now_minutes = now.getMinutes();
        old_hours =  old.getHours();
        old_minutes = old.getMinutes();

        if (el.am_pm) {
            var am_pm = now_hours > 11 ? 'pm' : 'am';
            now_hours = ((now_hours > 12) ? now_hours - 12 : now_hours);
            old_hours = ((old_hours > 12) ? old_hours - 12 : old_hours);
        } 

        now_hours   = ((now_hours <  10) ? "0" : "") + now_hours;
        now_minutes = ((now_minutes <  10) ? "0" : "") + now_minutes;
        old_hours   = ((old_hours <  10) ? "0" : "") + old_hours;
        old_minutes = ((old_minutes <  10) ? "0" : "") + old_minutes;
        // date
        el.currDate = el.lang.dayNames[now.getDay()] + ',&nbsp;' + now.getDate() + '&nbsp;' + el.lang.monthNames[now.getMonth()];
        // time update
        el.timeUpdate = el.currDate + ',&nbsp;' + now_hours + ':' + now_minutes;

        var firstHourDigit = old_hours.substr(0,1);
        var secondHourDigit = old_hours.substr(1,1);
        var firstMinuteDigit = old_minutes.substr(0,1);
        var secondMinuteDigit = old_minutes.substr(1,1);
        
        timeOld += '<div id="hours"><div class="line"></div>';
        timeOld += '<div id="hours_bg"><img src="' + el.clockImagesPath + 'clockbg1.png" /></div>';
        timeOld += '<img src="' + el.clockImagesPath + firstHourDigit + '.png" id="fhd" class="first_digit" />';
        timeOld += '<img src="' + el.clockImagesPath + secondHourDigit + '.png" id="shd" class="second_digit" />';
        timeOld += '</div>';
        timeOld += '<div id="minutes"><div class="line"></div>';
        if (el.am_pm) {
            timeOld += '<div id="am_pm"><img src="' + el.clockImagesPath + am_pm + '.png" /></div>';
        }
        timeOld += '<div id="minutes_bg"><img src="' + el.clockImagesPath + 'clockbg1.png" /></div>';
        timeOld += '<img src="' + el.clockImagesPath + firstMinuteDigit + '.png" id="fmd" class="first_digit" />';
        timeOld += '<img src="' + el.clockImagesPath + secondMinuteDigit + '.png" id="smd" class="second_digit" />';
        timeOld += '</div>';

        el.find('#clock').html(timeOld);

        // set minutes
        if (secondMinuteDigit != '9') {
            firstMinuteDigit = firstMinuteDigit + '1';
        }

        if (old_minutes == '59') {
            firstMinuteDigit = '511';
        }

        setTimeout(function() {
            $('#fmd').attr('src', el.clockImagesPath + firstMinuteDigit + '-1.png');
            $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg2.png');
        },200);
        setTimeout(function() { $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg3.png')},250);
        setTimeout(function() {
            $('#fmd').attr('src', el.clockImagesPath + firstMinuteDigit + '-2.png');
            $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg4.png');
        },400);
        setTimeout(function() { $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg5.png')},450);
        setTimeout(function() {
            $('#fmd').attr('src', el.clockImagesPath + firstMinuteDigit + '-3.png');
            $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg6.png');
        },600);

        setTimeout(function() {
            $('#smd').attr('src', el.clockImagesPath + secondMinuteDigit + '-1.png');
            $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg2.png');
        },200);
        setTimeout(function() { $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg3.png')},250);
        setTimeout(function() {
            $('#smd').attr('src', el.clockImagesPath + secondMinuteDigit + '-2.png');
            $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg4.png');
        },400);
        setTimeout(function() { $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg5.png')},450);
        setTimeout(function() {
            $('#smd').attr('src', el.clockImagesPath + secondMinuteDigit + '-3.png');
            $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg6.png');
        },600);

        setTimeout(function() {$('#fmd').attr('src', el.clockImagesPath + now_minutes.substr(0,1) + '.png')},800);
        setTimeout(function() {$('#smd').attr('src', el.clockImagesPath + now_minutes.substr(1,1) + '.png')},800);
        setTimeout(function() { $('#minutes_bg img').attr('src', el.clockImagesPath + 'clockbg1.png')},850);

        // set hours
        if (now_minutes == '00') {
           
            if (el.am_pm) {
                if (now_hours == '00') {                   
                    firstHourDigit = firstHourDigit + '1';
                    now_hours = '12';
                } else if (now_hours == '01') {
                    firstHourDigit = '001';
                    secondHourDigit = '111';
                } else {
                    firstHourDigit = firstHourDigit + '1';
                }
            } else {
                if (now_hours != '10') {
                    firstHourDigit = firstHourDigit + '1';
                }

                if (now_hours == '20') {
                    firstHourDigit = '1';
                }

                if (now_hours == '00') {
                    firstHourDigit = firstHourDigit + '1';
                    secondHourDigit = secondHourDigit + '11';
                }
            }

            setTimeout(function() {
                $('#fhd').attr('src', el.clockImagesPath + firstHourDigit + '-1.png');
                $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg2.png');
            },200);
            setTimeout(function() { $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg3.png')},250);
            setTimeout(function() {
                $('#fhd').attr('src', el.clockImagesPath + firstHourDigit + '-2.png');
                $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg4.png');
            },400);
            setTimeout(function() { $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg5.png')},450);
            setTimeout(function() {
                $('#fhd').attr('src', el.clockImagesPath + firstHourDigit + '-3.png');
                $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg6.png');
            },600);

            setTimeout(function() {
            $('#shd').attr('src', el.clockImagesPath + secondHourDigit + '-1.png');
            $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg2.png');
            },200);
            setTimeout(function() { $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg3.png')},250);
            setTimeout(function() {
                $('#shd').attr('src', el.clockImagesPath + secondHourDigit + '-2.png');
                $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg4.png');
            },400);
            setTimeout(function() { $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg5.png')},450);
            setTimeout(function() {
                $('#shd').attr('src', el.clockImagesPath + secondHourDigit + '-3.png');
                $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg6.png');
            },600);

            setTimeout(function() {$('#fhd').attr('src', el.clockImagesPath + now_hours.substr(0,1) + '.png')},800);
            setTimeout(function() {$('#shd').attr('src', el.clockImagesPath + now_hours.substr(1,1) + '.png')},800);
            setTimeout(function() { $('#hours_bg img').attr('src', el.clockImagesPath + 'clockbg1.png')},850);
        }
    }

    $.fn.getWeather = function(el) {

        el.find('#weather').html('<p class="loading">Update Weather ...</p>');
        el.find('#forecast_container').html('<p class="loading">Update Weather ...</p>');
        var metric = el.weatherMetric == 1 ? 'C' : 'F';
        var proxy = '';

        switch (el.proxyType) {
            case 'php':
                proxy = 'digiclock.php';
            break;
            case 'asp':
                proxy = 'asp/WeatherProxy.aspx';
            break;
        }

        $.getJSON('widgets/digiclock/' + proxy + '?location=' + el.weatherLocationCode + '&metric=' + el.weatherMetric, function(data) {

            el.find('#weather .loading, #forecast_container .loading').hide();

            var curr_temp = '<p class="temp">' + data.curr_temp + '&deg;<span class="metric">' + metric + '</span></p>';

            el.find('#weather').css('background','url(' + el.weatherImagesPath + data.curr_icon + '.png) 50% 100% no-repeat');
            var weather = '<div id="local"><p class="city">' + data.city + '</p><p>' + el.lang.weatherNames[data.curr_icon] + '</p></div>'; /*data.curr_text*/
            weather += '<div id="temp"><p id="date">' + el.currDate + '</p>' + curr_temp + '</div>';
            el.find('#weather').html(weather);

            // forecast
            el.find('#forecast_container').append('<div id="current"></div>');
            var curr_for = curr_temp + '<p class="high_low">' + data.forecast[0].day_htemp + '&deg;&nbsp;/&nbsp;' + data.forecast[0].day_ltemp + '&deg;</p>';
            curr_for    += '<p class="city">' + data.city + '</p>';
            curr_for    += '<p class="text">' + el.lang.weatherNames[data.forecast[0].day_icon] + '</p>'; /*data.forecast[0].day_text*/
            el.find('#current').css('background','url(' + el.weatherImagesPath + data.forecast[0].day_icon + '.png) 50% 0 no-repeat').append(curr_for);

            el.find('#forecast_container').append('<ul id="forecast"></ul>');
            data.forecast.shift();
            for (var i in data.forecast) {
                var d_date = new Date(data.forecast[i].day_date);
                var day_name = el.lang.dayNames[d_date.getDay()];
                var forecast = '<li>';
                forecast    += '<p>' + day_name + '</p>';
                forecast    += '<img src="' + el.weatherImagesPath + data.forecast[i].day_icon + '.png" alt="' + data.forecast[i].day_text + '" title="' + el.lang.weatherNames[data.forecast[i].day_icon] + '" />'; /*data.forecast[i].day_text*/
                forecast    += '<p>' + data.forecast[i].day_htemp + '&deg;&nbsp;/&nbsp;' + data.forecast[i].day_ltemp + '&deg;</p>';
                forecast    += '<p>' + data.forecast[i].day_windspeed + 'bf&nbsp;/&nbsp;' + data.forecast[i].day_winddirection + '&deg;</p>';
                forecast    += '</li>';
                el.find('#forecast').append(forecast);
            }

            el.find('#forecast_container').append('<div id="update"><img src="widgets/digiclock/images/refresh_01.png" alt="reload" title="reload" id="reload" />' + el.timeUpdate + '</div>');

            $('#reload').click(function() {
                el.find('#weather').html('');
                el.find('#forecast_container').html('');
                $.fn.getWeather(el);
            });
        });
    }

})(jQuery);