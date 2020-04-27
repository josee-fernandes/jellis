/**
 * Referencia o elemento da barra de navegação
 */
const nav = document.querySelector('nav');

/**
 * Referencia os botões de fechar, maximizar e minimizar
 */
const minimizar = document.querySelector('.js-minimizar');
const maximizar = document.querySelector('.js-maximizar');
const fechar = document.querySelector('.js-fechar');

/**
 * Referencia a janela atual
 */
const win = remote.getCurrentWindow();

/**
 * Clique do botão de minimizar
 * Minimiza a janela
 * Toca o efeito sonoro de fechar janela
 */
minimizar.addEventListener('click', () => {
  win.minimize();
  sfxClose.play();
});

/**
 * Clique do botão de maximizar
 * Maximiza a janela
 * Toca o efeito sonoro de abrir ou fechar janela, dependendo do estado da maximização atual da janela
 */
maximizar.addEventListener('click', () => {
  if(!win.isMaximized()){
    win.maximize();
    sfxOpen.play();
  }else{
    win.unmaximize();
    sfxClose.play();
  }
});

/**
 * Clique do botão de fechar
 * Fecha o programa
 */
fechar.addEventListener('click', () => {
  win.close();
});