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

    api.placeShips().catch(console.error);
  });

  $btnReady.click(() => {
    if (!$btnReady.enabled()) {
      return;
    }

    api.setShips()
        .then(() => {
          $btnReady.disable();
          $btnReset.disable();
          $btnOrient.disable();
        })
        .catch(console.error);
  });

  $btnResign.click(() => {
    if (!$btnResign.enabled()) {
      return;
    }

    api.resign()
        .then(() => {
          $btnResign.disable();
          $btnRematch.enable();
        })
        .catch(console.error);
  });

  $btnRematch.click(() => {
    if (!$btnRematch.enabled()) {
      return;
    }

    api.rematch()
        .then(() => {
          $btnRematch.disable();
          $btnResign.disable();
        })
        .catch(console.error);
  })
});