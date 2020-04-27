setTimeout(() => {
  /**
   * Variável para saber se o menu de opções está aberto
   */
  let options = false;

  /**
   * Referencia do botão de opções
   */
  const btnOpcoes = document.querySelector('.js-opcoes');

  /**
   * PopUp do menu de opções
   */
  const opBlur = document.querySelector('.options-blur');
  const opPop = document.querySelector('.options');

  /**
   * Clique do botão de opções
   * Troca o valor da variável de opções para o inverso do valor atribuído
   * Tom o efeito sonoro dos botões
   * Remove as classes que fazem o menu não aparecer
   */
  btnOpcoes.onclick = e => {
    options = !options;
    sfxBtn.play();
    if(options){
      opBlur.classList.remove('op-blur-hide');
      opBlur.classList.remove('op-blur-vis');
      opPop.classList.remove('op-closed');
      return;
    }
  }

  /**
   * Referencia o botão de fechar o menu de opções
   */
  const btnCloseOp = document.querySelector('.close-op');

  /**
   * Clique do botão de fechar o menu de opções
   * Troca o valor da variável de opções para o inverso do valor atribuído
   * Adiciona as classes que fazem o menu não aparecer
   * Toca o efeito sonoro dos botões
   * Espera meio segundo para tirar a visibilidade do menu de opções
   * Faz isso para que não interfira nos elementos que possuem uma indexação no eixo z, menor que a do menu de opções
   */
  btnCloseOp.onclick = e => {
    options = !options;
    sfxBtn.play();
    opBlur.classList.add('op-blur-hide');
    opPop.classList.add('op-closed');
    setTimeout(() => {
      opBlur.classList.add('op-blur-vis');
    }, 500);
  }

  /**
   * Referencia os botões de opção do som
   */
  const btnSom = document.querySelector('.op-som button');
  const selSom = document.querySelector('.op-som button div');

  /**
   * Referencia os botões de opção do formato de vídeo
   */
  const btnFormatos = document.querySelectorAll('.op-formato div button');

  /**
   * Referencia os botões de opção para minimização
   */
  const btnMinimizar = document.querySelector('.op-minimizar button');
  const selMinimizar = document.querySelector('.op-minimizar button div');

  /**
   * Função usada para atualizar a opção do som do usuário
   * Possui um parâmetro para indicar se está sendo executada na inicialização do app
   */
  const refreshSom = (comecando) => {    
    if(!comecando){
      user_config.som = !user_config.som;
    }
      
    setTimeout(() => {
      getRefreshedConfig();
      if(user_config.som){
        selSom.classList.add('verdadeiro');
        
        return;
      }
      selSom.removeAttribute('class');
    }, 100);
  }

  /**
   * Função usada para atualizar a opção do formato de vídeo do usuário
   * Possui dois parâmetros:
   * 1. (comecando) Para indicar se está sendo executada na inicialização do app
   * 2. (opcao) Para indicar a opção de acordo com o formato de vídeo para execução do respectivo código
   */
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
          }, 20);
          break;
        case 1:
          user_config.formato = 'avi';
          setTimeout(() => {
            getRefreshedConfig();
            btnFormatos[0].removeAttribute('class');
            btnFormatos[1].classList.add('formato-sel');
            btnFormatos[2].removeAttribute('class');
          }, 20);          
          break;
        case 2:
          user_config.formato = 'webm';
          setTimeout(() => {
            getRefreshedConfig();
            btnFormatos[0].removeAttribute('class');
            btnFormatos[1].removeAttribute('class');
            btnFormatos[2].classList.add('formato-sel');
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

  /**
   * Função usada para atualizar a opção da minimização do usuário
   * Possui um parâmetro para indicar se está sendo executada na inicialização do app
   */
  const refreshMinimizar = (comecando) => {
    if(!comecando)
      user_config.minimizar = !user_config.minimizar
      
    setTimeout(() => {
      getRefreshedConfig();  

      if(user_config.minimizar){
        selMinimizar.classList.add('verdadeiro');
        return;
      }
  
      selMinimizar.removeAttribute('class');
    }, 20);
  }

  /**
   * Execução das funções no começo da execução do app para atualizar as configurações do usuário visualmente
   * Passando o parâmetro true para indicar onde está sendo executada e -1 para não executar nenhum código de atualização de formato de vídeo
   */
  refreshSom(true);
  refreshFormato(true, -1);
  refreshMinimizar(true);

  /**
   * Clique do botão do som
   * Executa a função para atualizar as configurações de som, passando o parâmetro false para indicar o contexto de execução
   */
  btnSom.onclick = e => {
    refreshSom(false);
  }

  /**
   * Clique do botão do formato MP4
   * Executa a função para atualizar as configurações de som, passando o parâmetro false para indicar o contexto de execução
   * E o parâmetro 0 para indicar que o código a ser executado é para o formato MP4
   */
  btnFormatos[0].onclick = e => {
    refreshFormato(false, 0);
  }

  /**
   * Clique do botão do formato AVI
   * Executa a função para atualizar as configurações de som, passando o parâmetro false para indicar o contexto de execução
   * E o parâmetro 0 para indicar que o código a ser executado é para o formato AVI
   */
  btnFormatos[1].onclick = e => {
    refreshFormato(false, 1);
  }

  /**
   * Clique do botão do formato WEBM
   * Executa a função para atualizar as configurações de som, passando o parâmetro false para indicar o contexto de execução
   * E o parâmetro 0 para indicar que o código a ser executado é para o formato WEBM
   */
  btnFormatos[2].onclick = e => {
    refreshFormato(false, 2);
  }

  /**
   * Clique do botão da minimização
   * Executa a função para atualizar as configurações de som, passando o parâmetro false para indicar o contexto de execução
   */
  btnMinimizar.onclick = e => {
    refreshMinimizar(false);
  }
}, 100);