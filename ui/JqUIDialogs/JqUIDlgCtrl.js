/*
  Класс для работы с модальными дилогами
  через виджет JQuery.Dialog.

  Использует библиотеки jquery, jquery-ui и объект класса ModCtrl из mod-control.
*/
const
  DLG_ID='jquidlg-';

class JqUIDlgCtrl
{
  modCtrl=null;       /* экземпляр класса ModCtrl или ссылка
                         на него, переданная в конструкторе */
  dlgContainerId;     // id элемента <div> в который будут добавлятся дилоги
  dlgIdCntr=0;        // счётчик генератора дилоговых <div>
  stack=new Set();    // стэк диалогов; последний - самый верхний

  constructor(dlgContainerId,modCtrl=null) {
    this.modCtrl=(modCtrl) ? modCtrl : new ModCtrl();

    if (!dlgContainerId)
      throw new Error('JqUIDlgCtrl.constructor: undefined dlgContainerId');

    this.dlgContainerId=dlgContainerId;
  }

  /*
    Закрывает и уничтожает все дилоговые окна, чистить стэк и счётчик
  */
  destroyAllDlgs() {
    var
      i,
      astack=Array.from(this.stack);

    while ((i=astack.pop()) !=undefined) {
      $(this.getDlgNode(i)).dialog('destroy');
    }
    document.getElementById(this.dlgContainerId).innerHTML='';
    this.stack.clear();
    this.dlgIdCntr=0;
  }

  /*
    Вернёт элемент <div> диалога по его id
  */
  getDlgNode(dlgId) {
    switch (typeof dlgId) {
      case 'number':
        return document.getElementById(DLG_ID+dlgId.toString());
      case 'string':
        return document.getElementById(dlgId);
      case 'object':
        return dlgId;
      default:
        throw new Error('JqUIDlgCtrlgetDlg: unrecognized dlgId type '+(typeof dlgId));
    }
  }

  /*
    Чистит содержимое диалога
  */
  emptyDlg(dlgId) {
    this.getDlgNode(dlgId).innerHTML='';
  }

  /*
    Закрывает и уничтожает диалог
  */
  destroyDlg(dlgId) {
    const
      dlg=this.getDlgNode(dlgId);

    $(dlg).dialog('destroy');  // destroy the dialog
    this.stack.delete(Number(dlg.id.split('-').slice(-1)));  // delete dlg's id from stack
    dlg.remove();  // and now remove div node from DOM
  }

  /*
    Создаёт и показывает простой диалог с сообщением.

    dlgType:    error, warn, info
    msg:        сообщение в формате html
    title:      заголовок
    options:    объект дополнительных параметров диалога
    beforeOpen: callback вызывается перед открытием
                входные параметры:
                  - узел диалога
                  - объект параметров
  */
  showDlg(dlgType,msg,title,options=null,beforeOpen=null) {
    this.dlgIdCntr++;
    this.stack.add(this.dlgIdCntr);

    const
      dlgId=DLG_ID+this.dlgIdCntr.toString(),
      dlg=document.getElementById(this.dlgContainerId).appendChild(
        document.createElement('div')
      );
    // setup dlg
    dlg.id=dlgId;
    dlg.className='jquidlg dlgtype-'+dlgType;
    dlg.innerHTML=msg;
    dlg.title=title ?? dlgType;

    var
      opts={
        resizable: false,
        modal: true,
        width: 'auto',
        close: () => this.destroyDlg(dlg),
      };

    // если переданы дополнительные параметры диалога
    if (options) {
      opts=Object.assign(opts,options);
    }

    // if before open callback defined
    if (beforeOpen) beforeOpen(dlg,opts);

    // if after all the buttons are not defined
    if (!opts.buttons) {
      opts.buttons=[
        {text: 'Ok', click: () => $(dlg).dialog('close')},
      ];
    }

    // that's it! now show the dialogue
    $(dlg).dialog(opts);
  }

  /*
    Загружает модуль диалога, создаёт диалог и показывает.

    Параметры:
      modId       - Id загружаемых модулей (для ModCtrl)
      mod         - объект компонетов модуля для загрузки:
                    {
                      oCss: {href: ?},
                      oHtml: {url: ?},
                      oJs: {src: ?}
                    }
      title       - заголовок диалога
      options     - объект дополнительных параметров диалога
      beforeOpen  - callback вызывается перед открытием
                    входные параметры:
                    - узел диалога (dlg)
                    - объект параметров (opts)
  */
  showCustomDlg(modId,mod,title,options,beforeOpen) {
    this.dlgIdCntr++;
    this.stack.add(this.dlgIdCntr);

    var
      promiseRez;

    const
      dlgId=DLG_ID+this.dlgIdCntr.toString(),
      dlg=document.getElementById(this.dlgContainerId).appendChild(
        document.createElement('div')
      );

    dlg.id=dlgId;
    dlg.className='jquidlg dlgtype-custom';
    dlg.title=title;

    // загружаем компоненты диалога: css, html, js
    mod.oHtml.parentId=dlgId;
    new Promise((resolve,reject) => {
      promiseRez = this.modCtrl.loadMod(modId, mod);
      if (promiseRez.error)
        reject(promiseRez);
      else
        resolve(promiseRez);
    })
    .then((response) => {
      ///console.log(response.message); // dbg
      var
        opts={
          resizable: false,
          modal: true,
          width: 'auto',
          close: () => this.destroyDlg(dlg),
        };
      // если переданы дополнительные параметры диалога
      if (options) {
        opts=Object.assign(opts,options);
      }
      this.setupCustomDlg(dlg,opts,beforeOpen);
      return {loaded: true, error: false, message: 'Ok'};
    })
    .catch((err) => {
      console.error('Error loading dialog mod:',err.message);
      this.stack.delete(this.dlgIdCntr);
      dlg.remove();
      return err;
    });
  }

  setupCustomDlg(dlg,opts,beforeOpen) {
    // if before open callback defined
    if (beforeOpen) beforeOpen(dlg,opts);
    // if after all the buttons are not defined
    if (!opts.buttons) {
      console.warn('No button defined...');
      opts.buttons=[
        {text: 'Close', click: () => $(dlg).dialog('close')},
      ];
    }
    // that's it! now show the dialogue
    $(dlg).dialog(opts);
  }
}
