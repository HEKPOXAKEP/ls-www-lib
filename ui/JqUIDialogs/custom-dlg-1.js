/*
  Класс тестовго диалога №1
*/
class TestDlg1
{
  dlg=null;

  constructor(dlg) {
    this.dlg=dlg;
    this.edTxt=document.getElementById('ed-txt');
    this.lblTxt=document.getElementById('lbl-txt');
    this.setupEvents();
  }

  setupEvents() {
    this.boundBtnInfoClick=this.btnInfoClick.bind(this);
    this.boundBtnWarnClick=this.btnWarnClick.bind(this);
    this.boundBtnErrClick=this.btnErrClick.bind(this);
    this.boundBtnCloseClick=this.btnCloseClick.bind(this);

    this.boundEdTxtChange=this.edTxtChange.bind(this);
    this.edTxt.addEventListener('input',this.boundEdTxtChange);
  }

  btnInfoClick(ev) {
    ev.stopPropagation();
    dlgCtrl.showDlg(
      'info',
      'This is an informational message. After reading, click the "Ok" button.',
      'INFORMATION',
      {maxWidth: 300}
    );
  }

  btnWarnClick(ev) {
    ev.stopPropagation();
    dlgCtrl.showDlg(
      'warn',
      'We don\'t know what\'s going on. If only we knew, but we don\'t know, and it\'s scary.',
      'WARNING',
      {maxWidth: 300}
    );
  }

  btnErrClick(ev) {
    ev.stopPropagation();
    dlgCtrl.showDlg(
      'error',
      'Unknown error. But don\'t worry, this is just a test message. Just click the "OK" button.',
      'ERROR',
      {maxWidth: 300}
    );
  }

  btnCloseClick(ev) {
    //$(this.dlg).dialog('close');
    dlgCtrl.destroyDlg(this.dlg);
  }

  edTxtChange(ev) {
    this.lblTxt.innerHTML=this.edTxt.value;
  }
}
