/*
  ============================
  Класс управления тулбарами
  ============================

  Каждый загружаемый скрипт тулбара должен иметь функцию initToolbar(id,containerId),
  которая создаст и вернёт экземпляр класс этого тулбара.

  Перед использванием создать объект класса ToolbarCtrl:
  var
    toolbarCtrl=new ToolbarCtrl();
*/
class ToolbarCtrl
{
  currToolbarId;
  ownToolbars=new Map();  // will hold Toolbar objects

  constructor() {
    this.currToolbar=undefined;
  }

  currToolbar() {
    return this.ownToolbars.get(this.currToolbarId);
  }

  registerToolbar() {
    ///
  }

  /*
    Загрузка и инициализация компонетов тулбара css, html, js.

    @param object toolbarMod    объект для загрузки css, html и js:
      {
        oCss: {href: ?},
        oHtml: {url: ? || html: ?}, - url || html
        oJs: {src: ?},
      }

    @param string containerId   контейнер тулбара, в который будут добавляться кнопки
  */
  loadToolbar(id,toolbarMod,containerId) {
    if (this.currToolbarId !==undefined) {
      this.ownToolbars.get(this.currToolbarId).unbindEvents();
    }
    $('#'+containerId).empty();

    new Promise((resolve,reject) => {
      var rez=this.loadToolbarModule(id,toolbarMod,containerId);

      if (rez.error) {
        reject(rez.message);
      } else {
        resolve(rez);
      }
    })
    .then((response) => {
      ///_log(response.message);  //dbg
      if (!this.ownToolbars.has(id)) {
        this.currToolbarId=id;
        this.ownToolbars.set(id,initToolbar(containerId));   // создаём объект
        ///this.set(id,new window[className](containerId));  // создаём объект
        this.bindEvents(id);                        // привязываем события
      } else {
        // скрипт был загружен и инициализирован ранее,
        // только привязываем события.
        this.currToolbarId=id;
        this.bindEvents(id);
      }
    })
    .catch((err) => {
      ///console.error(`Метод App.loadClockModule() завершился с ошибкой:\n${err.message}`);  //dbg
      console.error('Method ToolbarCtrl.loadToolbarModule() rejected with error:\n',err);
    });
  }

  loadToolbarModule(id,toolbarMod,containerId) {
    toolbarMod.oHtml.parentId=containerId;
    return modCtrl.loadMod(id,toolbarMod);
  }

  /*
    Инициализация событий тулбара.
    У каждого управляющего класса должен быть метод initEvents().
  */
  bindEvents(id) {
    this.ownToolbars.get(id).bindEvents();
  }

  /*
    Уничтожаем объект тулбара по его Id.
  */
  deleteToolbar(id) {
    this.ownToolbars.get(id).unbindEvents();  // отвязываем события
    this.ownToolbars.set(id,null);
    this.ownToolbars.delete(id);
  }

  /*
    Удаление всех объектов ToolbarCtrl.
  */
  clearToolbars() {
    this.ownToolbars.forEach((obj,id) => {
      obj.unbindEvents();  // отвязываем события
      this.ownToolbars.set(id,null);
    });
    this.ownToolbars.clear();
  }
}
