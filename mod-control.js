/*
  Класс управления загрузкой модулей
  ==================================
  Под модулем понимается совокупность связанных css, html и javascript.

  Динамическая загрузка компонентов модулей: {css, html, js}.
  Основной метод ModCtrl.loadMod() возвращает Promise.

  Перед началом использования создать объект класса ModCtrl:
  var
    modCtrl=new ModCtrl();
*/

const
  DYNAMIC_JS='dynamic-js',
  DYNAMIC_CSS='dynamic-css';

/*
  Обёртка для загрузки скриптов.
*/
const
  loadJsAsync=(id,src) => {
    return new Promise((resolve,reject) => {
      try {
        var
          el=document.createElement('script'),
          cn=document.head || document.body;

        el.async=true;
        el.class=DYNAMIC_JS;
        el.id=id;
        el.src=src;

        el.addEventListener('load',() => {
          resolve({loaded: true, error: false, message: `Скрипт ${src} загружен`});
        });
        el.addEventListener('error',() => {
          // если загрузка не удалась, удаляем созданный элемент
          el=document.getElementById(id);
          if (el) el.remove();

          reject({
            loaded: false,
            error: true,
            message: `Ошибка загрузки скрипта ${src}`,
          });
        });

        cn.appendChild(el);
      } catch (err) {
        console.info(err);  // dbg
        reject(err);
      }
    });
  };

/*
  Обёртка для загрузки таблиц стилей.
*/
const
  loadCssAsync=(id,href) => {
    return new Promise((resolve,reject) => {
      try {
        var
          el=document.createElement('link'),
          cn=document.head || document.body;

        el.id=id;
        el.rel='stylesheet';
        el.class=DYNAMIC_CSS;
        el.href=href;

        el.addEventListener('load',() => {
          resolve({loaded: true, error: false, message: `Css ${href} загружен`});
        });
        el.addEventListener('error',() => {
          // если загрузка сорвалась, удаляем созданный элемент
          el=document.getElementById(id);
          if (el) el.remove();

          reject({
            loaded: false,
            error: true,
            message: `Ошибка загрузки css ${href}`,
          });
        });

        cn.appendChild(el);
      } catch (err) {
        reject(err);
      }
    });
  };

/*
  ===============
  Класс ModCtrl
  ===============
*/
class ModCtrl
{
  #caseInsensitiveIds;  // использвать регистронечуствительные идентификаторы

  constructor(caseInsensitiveIds=true) {
    this.#caseInsensitiveIds=caseInsensitiveIds;
  }

  isCaseInsensitiveIds() {
    return this.#caseInsensitiveIds;
  }

  /*
    Приводит Id к ниженму регистру, если #caseInsensitiveIds===true.
  */
  #prepId(id) {
    return this.#caseInsensitiveIds ? id.toLowerCase() : id;
  }

  /*
    Загрузка указанных компонентов модуля.

    Вернёт Promise с полями loaded:boolean, error:boolean и message:string.

    id - Id для css и script;

    options {
      oCss: {href: ?},
      oHtml: {url: ?, parentId: ?},
      oJs: {src: ?},
    }
  */
  loadMod(id,options) {
    var
      _id=this.#prepId(id);

    const
      prCss=options.oCss ? new Promise((resolve) => {
          resolve(this.#loadCss(_id+'-css',options.oCss));
        })
        : Promise.resolve({loaded: true, error: false, message: 'oCss не задан'});
    const
      prHtml=options.oHtml ? new Promise((resolve) => {
          resolve(this.#loadHtml(_id,options.oHtml));
        })
        : Promise.resolve({loaded: true, error: false, message: 'oHtml не задан'});
    const
      prJs=options.oJs ? new Promise((resolve) => {
         resolve(this.#loadJs(_id+'-js',options.oJs));
        })
        : Promise.resolve({loaded: true, error: false, message: 'oJs не задан'});

    return Promise.all([prCss,prHtml,prJs])
    .then((responses) => {
      ///console.info('Все промисы выполнены: ',values);  dbg
      return Promise.resolve({
        loaded: true,
        error: false,
        message: `Все промисы отработали нормально: [${responses[0].message}, ${responses[1].message}, ${responses[2].message}]`,
      });
    })
    .catch((err) => {
      console.error('Error! Один из промисов вызвал ошибку: ',err.message);
      return Promise.reject(err);
    });
  }

  /*
    Добавляет элемент <link> в конец секции <head>
  */
  #loadCss(id,oCss) {
    if (document.getElementById(id)) {
      return Promise.resolve({
        loaded: true, 
        error: false, 
        message: `Css id='${id}' href='${oCss.href}' уже загружен`});
    }

    return loadCssAsync(id,oCss.href)
      .then((response) => {
        return Promise.resolve({loaded: true, error: false, message: response.message});
      })
      .catch((error) => {
        ///console.error(error.message);  // dbg
        return Promise.reject({loaded: false, 'error': true, message: error.message});
      });
  }

  /*
    Добавляет элемент <script> в конец секции <head>
  */
  #loadJs(id,oJs) {
    if (document.getElementById(id)) {
      return Promise.resolve({
        loaded: true, 
        error: false, 
        message: `Js id='${id}' src='${oJs.src}' уже загружен`});
    }

    return loadJsAsync(id,oJs.src)
      .then((response) => {
        return Promise.resolve({loaded: true, error:false, message: response.message});
      })
      .catch((error) => {
        ///console.error(error.message);  // dbg
        return Promise.reject({loaded: false, 'error': true, message: error.message});
      });
  }

  /*
    Загружает html и вставляет его внутрь указанного oHtml.parentId.
  */
  #loadHtml(id,oHtml) {
    var msg='???';

    if (!oHtml.parentId) {
      msg=`Не указан oHtml.parentId, id=${id}`;
      console.warn(msg);
      return Promise.reject({
        loaded: false,
        error: true,
        message: msg,
      });
    }

    var
      prnt=document.getElementById(oHtml.parentId);

    if (!prnt) {
      msg=`Родитель <tag id="${oHtml.parentId}"> не найден`;
      console.warn(msg);
      return Promise.reject({
        loaded: false,
        error: true,
        message: msg,
      });
    }

    return fetch(oHtml.url,{credentials:'include'})
      .then((response) => {
        if (response.ok)
          return response.text();

        return Promise.reject(response);
      })
      .then((html) => {
        prnt.innerHTML=html;
        msg=`Html ${oHtml.url} загружен`;
        ///console.log(msg);  // dbg
        return Promise.resolve({loaded: true, error: false, message: msg});
      })
      .catch((error) => {
        msg=`Ошибка загрузки ${oHtml.url}: ${error.status} ${error.statusText}`;
        ///console.error(msg); // dbg
        return Promise.reject({
          loaded: false,
          error: true,
          message: msg,
        });
      });
  }

  /*
    Удаляет из DOM элементы css, script, html по их Id.

    ids {
      cssId: ?,
      jsId: ?,
      htmlId: ?
    }
  */
  removeMod(ids) {
    this.removeCss(ids.cssId);
    this.removeJs(ids.jsId);
    this.removeHtml(ids.htmlId);
  }

  removeJs(id) {
    if (!id) return;
    const
      el=document.querySelector('#'+this.#prepId(id)+'.'+DYNAMIC_JS);
    if (el) el.remove();
  }

  removeCss(id) {
    if (!id) return;
    const
      el=document.querySelector('#'+this.#prepId(id)+'.'+DYNAMIC_CSS);
    if (el) el.remove();
  }

  removeHtml(id) {
    if (!id) return;
    const
      el=document.getElementById(this.#prepId(id));
    if (el) el.remove();
  }
}
