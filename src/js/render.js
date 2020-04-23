// Botões
const videoElement = document.querySelector('video');
const btnStart = document.querySelector('.js-btn-start');
const btnStop = document.querySelector('.js-btn-stop');
const btnVideoSelect = document.querySelector('.js-btn-video-select');

btnVideoSelect.addEventListener('click', () => {
  getVideoSources();
});

const { desktopCapturer, remote } = require('electron');
const { Menu } = remote;

// Pega as telas disponíveis
const getVideoSources = async () => {
  const inputSrcs = await desktopCapturer.getSources({
    types : ['window', 'screen']
  });

  const videoOptMenu = Menu.buildFromTemplate(
    inputSrcs.map(src => {
      return {
        label : src.name,
        click : () => selectSrc(src)
      };
    })
  );

  videoOptMenu.popup();
}