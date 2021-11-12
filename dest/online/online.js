(function () {
    'use strict';

    function component(object) {
      var network = new Lampa.Reguest();
      var scroll = new Lampa.Scroll({
        mask: true,
        over: true
      });
      var files = new Lampa.Files(object);
      var filter = new Lampa.Filter(object);
      var results = [];
      var filtred = [];
      var extract = {};
      var token = '3i40G5TSECmLF77oAqnEgbx61ZWaOYaE';
      var last;
      var last_filter;
      var filter_items = {
        season: [],
        voice: [],
        voice_info: []
      };
      var filter_translate = {
        season: 'Сезон',
        voice: 'Перевод'
      };
      scroll.minus();
      scroll.body().addClass('torrent-list');

      this.create = function () {
        var _this = this;

        this.activity.loader(true);
        Lampa.Background.immediately(Lampa.Utils.cardImgBackground(object.movie));
        var url = 'https://videocdn.tv/api/' + (object.movie.number_of_seasons ? 'tv-series' : 'movies');
        url = Lampa.Utils.addUrlComponent(url, 'api_token=' + token);
        url = Lampa.Utils.addUrlComponent(url, 'query=' + encodeURIComponent(object.search));
        if (object.movie.release_date && object.movie.release_date !== '0000') url = Lampa.Utils.addUrlComponent(url, 'year=' + (object.movie.release_date + '').slice(0, 4));
        network.silent(url, function (json) {
          if (json.data && json.data.length) {
            results = json.data;

            _this.build();

            _this.activity.loader(false);

            _this.activity.toggle();
          } else _this.empty('Ой, мы не нашли (' + object.search + ')');
        }, function (a, c) {
          _this.empty('Ответ: ' + network.errorDecode(a, c));
        });

        filter.onSearch = function (value) {
          Lampa.Activity.replace({
            search: value,
            clarification: true
          });
        };

        filter.onBack = function () {
          _this.start();
        };

        filter.render().find('.selector').on('hover:focus', function (e) {
          last_filter = e.target;
        });
        filter.render().find('.filter--sort').remove();
        return this.render();
      };

      this.empty = function (descr) {
        var empty = new Lampa.Empty({
          descr: descr
        });
        files.append(empty.render(filter.empty()));
        this.start = empty.start;
        this.activity.loader(false);
        this.activity.toggle();
      };

      this.buildFilterd = function (select_season) {
        var select = [];

        var add = function add(type, title) {
          var need = Lampa.Storage.get('online_filter', '{}');
          var items = filter_items[type];
          var subitems = [];
          var value = need[type];
          items.forEach(function (name, i) {
            subitems.push({
              title: name,
              selected: value == i,
              index: i
            });
          });
          select.push({
            title: title,
            subtitle: items[value],
            items: subitems,
            stype: type
          });
        };

        filter_items.voice = [];
        filter_items.season = [];
        filter_items.voice_info = [];
        var choice = {
          season: 0,
          voice: 0
        };
        results.slice(0, 1).forEach(function (movie) {
          if (movie.season_count) {
            var s = movie.season_count;

            while (s--) {
              filter_items.season.push('Сезон ' + (movie.season_count - s));
            }

            choice.season = typeof select_season == 'undefined' ? filter_items.season.length - 1 : select_season;
          }

          if (filter_items.season.length) {
            movie.episodes.forEach(function (episode) {
              if (episode.season_num == choice.season + 1) {
                episode.media.forEach(function (media) {
                  if (filter_items.voice.indexOf(media.translation.smart_title) == -1) {
                    filter_items.voice.push(media.translation.smart_title);
                    filter_items.voice_info.push({
                      id: media.translation.id
                    });
                  }
                });
              }
            });
          } else {
            movie.translations.forEach(function (element) {
              filter_items.voice.push(element.smart_title);
              filter_items.voice_info.push({
                id: element.id
              });
            });
          }
        });
        Lampa.Storage.set('online_filter', object.movie.number_of_seasons ? choice : {});
        select.push({
          title: 'Сбросить фильтр',
          reset: true
        });

        if (object.movie.number_of_seasons) {
          add('voice', 'Перевод');
          add('season', 'Сезон');
        }

        filter.set('filter', select);
        this.selectedFilter();
      };

      this.selectedFilter = function () {
        var need = Lampa.Storage.get('online_filter', '{}'),
            select = [];

        for (var i in need) {
          select.push(filter_translate[i] + ': ' + filter_items[i][need[i]]);
        }

        filter.chosen('filter', select);
      };

      this.extractFile = function (str) {
        var url = '';

        try {
          var items = str.split(',').map(function (item) {
            return {
              quality: parseInt(item.match(/\[(\d+)p\]/)[1]),
              file: item.replace(/\[\d+p\]/, '').split(' or ')[0]
            };
          });
          items.sort(function (a, b) {
            return b.quality - a.quality;
          });
          url = items[0].file;
          url = 'http:' + url.slice(0, url.length - 32) + '.mp4';
        } catch (e) {}

        return url;
      };

      this.extractData = function () {
        var _this2 = this;

        network.timeout(5000);
        var movie = results.slice(0, 1)[0];
        extract = {};

        if (movie) {
          var src = movie.iframe_src.replace('58.svetacdn.in/0HlZgU1l1mw5', '4432.svetacdn.in/Z9w3z4ZBIQxF');
          network["native"]('http:' + src, function (raw) {
            var math = raw.replace(/\n/g, '').match(/id="files" value="(.*?)"/);

            if (math) {
              var json = Lampa.Arrays.decodeJson(math[1].replace(/&quot;/g, '"'), {});
              var text = document.createElement("textarea");

              for (var i in json) {
                text.innerHTML = json[i];
                Lampa.Arrays.decodeJson(text.value, {});
                extract[i] = {
                  json: Lampa.Arrays.decodeJson(text.value, {}),
                  file: _this2.extractFile(json[i])
                };

                for (var a in extract[i].json) {
                  var elem = extract[i].json[a];

                  if (elem.folder) {
                    for (var f in elem.folder) {
                      var folder = elem.folder[f];
                      folder.file = _this2.extractFile(folder.file);
                    }
                  } else elem.file = _this2.extractFile(elem.file);
                }
              }
            }
          }, false, false, {
            dataType: 'text'
          });
        }
      };

      this.build = function () {
        var _this3 = this;

        this.buildFilterd();
        this.filtred();
        this.extractData();

        filter.onSelect = function (type, a, b) {
          if (type == 'filter') {
            if (a.reset) {
              _this3.buildFilterd();
            } else {
              if (a.stype == 'season') {
                _this3.buildFilterd(b.index);
              } else {
                var filter_data = Lampa.Storage.get('online_filter', '{}');
                filter_data[a.stype] = b.index;
                a.subtitle = b.title;
                Lampa.Storage.set('online_filter', filter_data);
              }
            }
          }

          _this3.applyFilter();

          _this3.start();
        };

        this.showResults();
      };

      this.filtred = function () {
        filtred = [];
        var filter_data = Lampa.Storage.get('online_filter', '{}');

        if (object.movie.number_of_seasons) {
          results.slice(0, 1).forEach(function (movie) {
            movie.episodes.forEach(function (episode) {
              if (episode.season_num == filter_data.season + 1) {
                episode.media.forEach(function (media) {
                  if (media.translation.id == filter_items.voice_info[filter_data.voice].id) {
                    filtred.push({
                      episode: parseInt(episode.num),
                      season: episode.season_num,
                      title: episode.num + ' - ' + episode.ru_title,
                      quality: media.max_quality + 'p',
                      translation: media.translation_id
                    });
                  }
                });
              }
            });
          });
        } else {
          results.slice(0, 1).forEach(function (movie) {
            movie.media.forEach(function (element) {
              filtred.push({
                title: element.translation.title,
                quality: element.max_quality + 'p',
                translation: element.translation_id
              });
            });
          });
        }
      };

      this.applyFilter = function () {
        this.filtred();
        this.selectedFilter();
        this.reset();
        this.showResults();
        last = scroll.render().find('.torrent-item:eq(0)')[0];
      };

      this.showResults = function (data) {
        filter.render().addClass('torrent-filter');
        scroll.append(filter.render());
        this.append(filtred);
        files.append(scroll.render());
      };

      this.reset = function () {
        last = false;
        filter.render().detach();
        scroll.clear();
      };

      this.getFile = function (element, show_error) {
        var translat = extract[element.translation];
        var id = element.season + '_' + element.episode;

        if (translat) {
          if (element.season) {
            for (var i in translat.json) {
              var elem = translat.json[i];

              if (elem.folder) {
                for (var f in elem.folder) {
                  var folder = elem.folder[f];
                  if (folder.id == id) return folder.file;
                }
              } else if (elem.id == id) {
                return elem.file;
              }
            }
          } else return translat.file;
        }

        if (show_error) Lampa.Noty.show('Не удалось извлечь ссылку');
      };

      this.append = function (items) {
        var _this4 = this;

        items.forEach(function (element) {
          var hash = Lampa.Utils.hash(element.season ? [element.season, element.episode, object.movie.original_title].join('') : object.movie.original_title);
          var view = Lampa.Timeline.view(hash);
          var item = Lampa.Template.get('online', element);
          item.append(Lampa.Timeline.render(view));
          item.on('hover:focus', function (e) {
            last = e.target;
            scroll.update($(e.target), true);
          }).on('hover:enter', function () {
            var file = _this4.getFile(element, true);

            if (file) {
              _this4.start();

              Lampa.Player.play({
                url: file,
                timeline: view,
                title: element.season ? element.title : object.movie.title + ' / ' + element.title
              });
              var playlist = [];
              items.forEach(function (elem) {
                playlist.push({
                  title: elem.title,
                  url: _this4.getFile(elem)
                });
              });
              Lampa.Player.playlist(playlist);
            } else {
              Lampa.Noty.show('Не удалось извлечь ссылку');
            }
          });
          scroll.append(item);
        });
      };

      this.back = function () {
        Lampa.Activity.backward();
      };

      this.start = function () {
        Lampa.Controller.add('content', {
          toggle: function toggle() {
            Lampa.Controller.collectionSet(scroll.render(), files.render());
            Lampa.Controller.collectionFocus(last || false, scroll.render());
          },
          up: function up() {
            if (Navigator.canmove('up')) {
              if (scroll.render().find('.selector').slice(2).index(last) == 0 && last_filter) {
                Lampa.Controller.collectionFocus(last_filter, scroll.render());
              } else Navigator.move('up');
            } else Lampa.Controller.toggle('head');
          },
          down: function down() {
            Navigator.move('down');
          },
          right: function right() {
            Navigator.move('right');
          },
          left: function left() {
            if (Navigator.canmove('left')) Navigator.move('left');else Lampa.Controller.toggle('menu');
          },
          back: this.back
        });
        Lampa.Controller.toggle('content');
      };

      this.pause = function () {};

      this.stop = function () {};

      this.render = function () {
        return files.render();
      };

      this.destroy = function () {
        network.clear();
        files.destroy();
        scroll.destroy();
        results = null;
        network = null;
      };
    }

    Lampa.Component.add('online', component);
    Lampa.Template.add('button_online', "<div class=\"full-start__button selector view--online\">\n<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:svgjs=\"http://svgjs.com/svgjs\" version=\"1.1\" width=\"512\" height=\"512\" x=\"0\" y=\"0\" viewBox=\"0 0 30.051 30.051\" style=\"enable-background:new 0 0 512 512\" xml:space=\"preserve\" class=\"\">\n<g xmlns=\"http://www.w3.org/2000/svg\">\n    <path d=\"M19.982,14.438l-6.24-4.536c-0.229-0.166-0.533-0.191-0.784-0.062c-0.253,0.128-0.411,0.388-0.411,0.669v9.069   c0,0.284,0.158,0.543,0.411,0.671c0.107,0.054,0.224,0.081,0.342,0.081c0.154,0,0.31-0.049,0.442-0.146l6.24-4.532   c0.197-0.145,0.312-0.369,0.312-0.607C20.295,14.803,20.177,14.58,19.982,14.438z\" fill=\"currentColor\"/>\n    <path d=\"M15.026,0.002C6.726,0.002,0,6.728,0,15.028c0,8.297,6.726,15.021,15.026,15.021c8.298,0,15.025-6.725,15.025-15.021   C30.052,6.728,23.324,0.002,15.026,0.002z M15.026,27.542c-6.912,0-12.516-5.601-12.516-12.514c0-6.91,5.604-12.518,12.516-12.518   c6.911,0,12.514,5.607,12.514,12.518C27.541,21.941,21.937,27.542,15.026,27.542z\" fill=\"currentColor\"/>\n</g></svg>\n\n<span>\u041E\u043D\u043B\u0430\u0439\u043D</span>\n</div>");
    Lampa.Template.add('online', "<div class=\"online selector\">\n    <div class=\"online__body\">\n        <div class=\"online__title\">{title}</div>\n        <div class=\"online__quality\">{quality}</div>\n    </div>\n</div>");
    Lampa.Listener.follow('full', function (e) {
      if (e.type == 'complite') {
        var btn = Lampa.Template.get('button_online');
        btn.on('hover:enter', function () {
          Lampa.Activity.push({
            url: '',
            title: 'Онлайн',
            component: 'online',
            search: e.data.movie.title,
            search_one: e.data.movie.title,
            search_two: e.data.movie.original_title,
            movie: e.data.movie,
            page: 1
          });
        });
        e.object.activity.render().find('.view--torrent').after(btn);
      }
    });

})();
