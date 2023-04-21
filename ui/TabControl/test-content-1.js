/*
  Модуль объекта для работы с test-content-1.html.

  Такой модуль всегда должен иметь функцию инициализации initMod(),
  которая должна создать объект и вернуть ссылку на него.
*/
class TabCtrlParams {
  constructor(ccTabSheet) {
    this.ccTabSheet=ccTabSheet;
    this.init();
  }

  init() {
    $('#rbContentHtml').click();  // первоначально выбираем режим html
    $('#editSheetName').keyup(this.onEditSheetNameKeyUp);
    $('#btnAddTabSheet').click(this,this.onBtnAddTabSheetClick);
  }

  onEditSheetNameKeyUp(ev) {
    var $sheetName=$(this);
    if ($sheetName.val().trim() =='')
      $sheetName.addClass('bad-data');
    else
      $sheetName.removeClass('bad-data');
  }

  onBtnAddTabSheetClick(ev) {
    //console.log(ev.data);
    if (ev.data.checkParams())
      ev.data.createNewTabSheet();
  }

  checkParams() {
    let sheetName=$('#editSheetName').val().trim();
    if (sheetName =='') {
      $('#editSheetName').focus();
      return false;
    }
  }

  createNewTabSheet() {
    alert('пока заглушка...');
  }

  beforeDestroy(ccTabCtrl,ccTabSheet) {
    let s=`Ай-яй-яй!\rЯ ${this.constructor.name} и сейчас меня уничтожат.\rПрощайте!`;
    console.log(s);
    alert(s);
    return true;
  }
}

function initMod(ccTabSheet)
{
  return new TabCtrlParams(ccTabSheet);
}
