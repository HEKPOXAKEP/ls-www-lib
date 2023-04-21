/*----------------------------------------------------
  Для отладки модальных диалогов.

  $(#container).load('dialogs.html')
  ----------------------------------------------------*/
function _showDlg_()
{
  var
    msg='Текст сообщения.',
    params={ };

  if ($('#cbUseParams').is(':checked')) {
    msg=$('#textMsg').val().trim()||msg;

    if ($('#cbTitle').is(':checked') && (s=$('#inputTitle').val().trim())) {
      params.title=s;
    }

    if ($('#cbBeforeShow').is(':checked') && (s=$('#textBeforeShow').val().trim())) {
      eval('function _beforeShow(dialog){'+s+'}');
      params.beforeShow=_beforeShow;
    }

    if ($('#cbBeforeDestroy').is(':checked') && (s=$('#textBeforeDestroy').val().trim())) {
      eval('function _beforeDestroy(dialog){'+s+'}');
      params.beforeDestroy=_beforeDestroy;
    }
  }

  ccDlgs.showDlg($('#selectDlgType').val(),msg,params);
}
