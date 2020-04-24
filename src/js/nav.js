// let { remote } = require('electron');

const nav = document.querySelector('nav');

const minimizar = document.querySelector('.js-minimizar');
const maximizar = document.querySelector('.js-maximizar');
const fechar = document.querySelector('.js-fechar');

const win = remote.getCurrentWindow();

minimizar.addEventListener('click', () => {
  win.minimize();
});

maximizar.addEventListener('click', () => {
  if(!win.isMaximized())
    win.maximize();
  else
    win.unmaximize();
});

fechar.addEventListener('click', () => {
  win.close();
});