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
class ToolbarCtrl extends Map {

  constructor() {
    super();
    this.currToolbarId=undefined;
  }

  get currToolbar() {
    return this.get(this.currToolbarId);
  }

  registerToolbar() {
    ///
  }

  /*
    Загрузка и инициализация html и объекта js тулбара.
    containerId  - контейнер тулбара, в который будут добавляться кнопки
  */
  loadToolbar(id,fHtml,fJs,containerId) {
    if (this.currToolbarId !==undefined) {
      this.get(this.currToolbarId).unbindEvents();
    }
    $('#'+containerId).empty();

    new Promise((resolve,reject) => {
      var rez=this.loadToolbarModule(id,fHtml,fJs,containerId);

      if (rez.error) {
        reject(rez.message);
      } else {
        resolve(rez);
      }
    })
    .then((response) => {
      ///_log(response.message);  // dbg
      if (!this.has(id)) {
        this.currToolbarId=id;
        this.set(id,initToolbar(containerId));   // создаём объект
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

  loadToolbarModule(id,fHtml,fJs,containerId) {
    return modCtrl.loadMod(
      id,
      {
        oHtml: {url: fHtml, parentId: containerId},
        oJs: {src: fJs}
      }
    );
  }

  /*
    Инициализация событий тулбара.
    У каждого управляющего класса должен быть метод initEvents().
  */
  bindEvents(id) {
    this.get(id).bindEvents();
  }

  /*
    Уничтожаем объект тулбара по его Id.
  */
  delete(id) {
    this.get(id).unbindEvents();  // отвязываем события
    this.set(id,null);
    super.delete(id);
  }

  /*
    Удаление всех объектов ToolbarCtrl.
  */
  clear() {
    this.forEach((obj,id) => {
      obj.unbindEvents();  // отвязываем события
      this.set(id,null);
    });
    super.clear();
  }
}
