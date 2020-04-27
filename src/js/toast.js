/**
 * Referencia os elementos usados para o toast e a mensagem
 */
const toastWrapper = document.querySelector('.msg-wrapper');
const msgToast = document.querySelector('.msg');
const msgText = document.querySelector('.msg p');

/**
 * Função usada para mostrar o toast
 * Possui um parâmetro, usado para escolher a mensagem exibida
 */
const showToast = (message) => {
  msgText.innerText = message
  msgToast.classList.add('msg-show');
  toastWrapper.classList.remove('msg-hide');
  setTimeout(() => {
    msgToast.classList.remove('msg-show');
    
    setTimeout(() => {
      toastWrapper.classList.add('msg-hide');
    }, 300);
  }, 3000);
}