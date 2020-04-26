setTimeout(() => {

  let options = true;

  const btnOpcoes = document.querySelector('.js-opcoes');

  const opBlur = document.querySelector('.options-blur');
  const opPop = document.querySelector('.options');

  btnOpcoes.onclick = e => {
    options = !options;
    sfxBtn.play();
    if(!options){  
      opBlur.classList.remove('op-blur-hide');
      opBlur.classList.remove('op-blur-vis');
      opPop.classList.remove('op-closed');
      return;
    }
  }

  const btnCloseOp = document.querySelector('.close-op');

  btnCloseOp.onclick = e => {
    options = !options;
    opBlur.classList.add('op-blur-hide');
    opPop.classList.add('op-closed');
    sfxBtn.play();
    setTimeout(() => {
      opBlur.classList.add('op-blur-vis');
    }, 500);
  }

  const btnSom = document.querySelector('.op-som button');
  const selSom = document.querySelector('.op-som button div');

  const btnFormatos = document.querySelectorAll('.op-formato div button');

  const btnMinimizar = document.querySelector('.op-minimizar button');
  const selMinimizar = document.querySelector('.op-minimizar button div');

  const refreshSom = (comecando) => {
    if(!comecando)
      user_config.som = !user_config.som;
      
    setTimeout(() => {
      getRefreshedConfig();
        
      if(user_config.som){
        selSom.classList.add('verdadeiro');
        console.log(user_config);
        return;
      }
  
      console.log(user_config);
      selSom.removeAttribute('class');
    }, 20);
  }

  const refreshFormato = (comecando, opcao) => {
    if(!comecando){
      switch(opcao){
        case 0:
          user_config.formato = 'mp4';
          setTimeout(() => {
            getRefreshedConfig();

            btnFormatos[0].classList.add('formato-sel');
          btnFormatos[1].removeAttribute('class');
          btnFormatos[2].removeAttribute('class');
          console.log(user_config);
          }, 20);
          break;
        case 1:
          user_config.formato = 'avi';
          setTimeout(() => {
            getRefreshedConfig();
            btnFormatos[0].removeAttribute('class');
            btnFormatos[1].classList.add('formato-sel');
            btnFormatos[2].removeAttribute('class');
            console.log(user_config);
          }, 20);          
          break;
        case 2:
          user_config.formato = 'webm';
          setTimeout(() => {
            getRefreshedConfig();
            btnFormatos[0].removeAttribute('class');
            btnFormatos[1].removeAttribute('class');
            btnFormatos[2].classList.add('formato-sel');
            console.log(user_config);
          }, 20);
          break;
        default:
          break;
      }
      return;
    }

    if(user_config.formato === 'mp4'){
      refreshFormato(false, 0);
    }else if(user_config.formato === 'avi'){
      refreshFormato(false, 1);
    }else{
      refreshFormato(false, 2);
    }
  }

  const refreshMinimizar = (comecando) => {
    if(!comecando)
      user_config.minimizar = !user_config.minimizar
      
    setTimeout(() => {
      getRefreshedConfig();  

      if(user_config.minimizar){
        selMinimizar.classList.add('verdadeiro');
        console.log(user_config);
        return;
      }
  
      console.log(user_config);
      selMinimizar.removeAttribute('class');
    }, 20);
  }

  refreshSom(true);
  refreshFormato(true, -1);
  refreshMinimizar(true);

  btnSom.onclick = e => {
    refreshSom(false);
  }

  btnFormatos[0].onclick = e => {
    refreshFormato(false, 0);
  }

  btnFormatos[1].onclick = e => {
    refreshFormato(false, 1);
  }

  btnFormatos[2].onclick = e => {
    refreshFormato(false, 2);
  }

  btnMinimizar.onclick = e => {
    refreshMinimizar(false);
  }
}, 100);