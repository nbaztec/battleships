$(function() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') { // SHIFT key
      $btnOrient.click();
    }
  });

  $btnOrient.click((e) => {
    VerticalMode = !VerticalMode;
    $btnOrient.toggleIcon();
  });

  $btnReset.click(() => {
    if (!$btnReset.enabled()) {
      return;
    }

    api.placeShips().then(console.log).catch(console.error);
  });

  $btnReady.click(() => {
    if (!$btnReady.enabled()) {
      return;
    }

    api.setShips().then(console.log).catch(console.error);
  });

  $btnResign.click(() => {
    if (!$btnResign.enabled()) {
      return;
    }

    $btnResign.disable();
    $btnReady.disable();

    alert('resign!');
  })
});