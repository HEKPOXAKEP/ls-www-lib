/*
  Test script for JqUIDialogs
*/
var
  modCtrl=new ModCtrl(),
  dlgCtrl=null;

function startUp() {
  dlgCtrl=new JqUIDlgCtrl('dlg-container',modCtrl);

  document.getElementById('show-msgdlg').addEventListener('click',showMsgDlg);
  document.getElementById('show-3-dlgs').addEventListener('click',show3Dlgs);
  document.getElementById('show-custom-dlg').addEventListener('click',showCustomDlg);
}

function showMsgDlg() {
  dlgCtrl.showDlg(
    document.getElementById('sel-msgdlg-type').value,
    document.getElementById('ed-msgdlg-body').value,
    document.getElementById('ed-msgdlg-title').value
  );
}

function show3Dlgs() {
  dlgCtrl.showDlg('error','Achtung! This is error.','ERROR',{position: {at: 'left top'}});
  dlgCtrl.showDlg('warn','Simple warning message.','WARNING',{position: {at: 'right top'}});
  dlgCtrl.showDlg(
    'info',
    'Some information.<br>Click <span id="destroy-all-dlgs" style="color: blue; cursor: pointer"><u>here</u></span> to destroy all dialogs.',
    'INFORMATION',
    {position: {at: 'center center'}},beforeOpenDlg);

  document.getElementById('destroy-all-dlgs').addEventListener('click',() => {
    dlgCtrl.destroyAllDlgs();
  })
}

function beforeOpenDlg(dlg,opts) {
  opts.resizable=true;
}

function showCustomDlg() {
  dlgCtrl.showCustomDlg(
    'custom-dlg-1',
    {
      oHtml: {url: 'custom-dlg-1.html'},
      oJs: {src: 'custom-dlg-1.js'}
    },
    'Test dialogue №1',
    null,
    setupCustomDlg
  );
}

function setupCustomDlg(dlg,opts) {
  var
    d=new TestDlg1(dlg);

  opts.buttons=[
    {text: 'Info dlg', id: 'btn-info-dlg', click: d.boundBtnInfoClick},
    {text: 'Warn dlg', id: 'btn-warn-dlg', click: d.boundBtnWarnClick},
    {text: 'Error dlg', id: 'btn-err-dlg', click: d.boundBtnErrClick},
    {text: 'Close', id: 'btn-close', click: d.boundBtnCloseClick}
  ];
}
