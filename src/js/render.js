// new Audio('./resrc/sfx/sfx_start.wav').play();

/**
 * Importação do capturador de janelas do electron e das funcionalidades do processo principal (sistema)
 */
const { desktopCapturer, remote } = require('electron');

/**
 * Sistema usado para criar, ler e atualizar o arquivo das configurações do usuário
 */
const { writeFile, readFile } = require('fs'); // filesystem

/**
 * Nome do arquivo que serão guardados os dados locais do usuário para configuração do app
 */
const fileName = 'user_config.txt';

/**
 * Variável que manipula as configurações do usuário
 * Já atribuída com as configurações padrão, caso elas não existam.
 */
let user_config = {
  som : true,
  formato : 'mp4',
  minimizar : false
}

/**
 * Define a configuração do arquivo txt com a mesma do código atual 
 */
const setConfig = (who, msg) => {
  msg = msg || `${fileName} criado.`;
  writeFile(`${__dirname}/data/${fileName}`, JSON.stringify(who), (error) => {
    if(error){
      console.error(`Erro ao tentar criar arquivo ${fileName}: ${error}`);
      return;
    }
  });
}

/**
 * Busca no arquivo txt as configurações do usuário para atribuir á variável user_config
 * Caso o arquivo não exista, ele cria um com as configurações padrão que já vem atribuido ná variável user_config
 * Usado apenas ao abrir o app, para configuração inicial.
 */
readFile(`./src/data/${fileName}`, 'utf-8', (error, data) => {
  if(error+''.includes('no such file or directory')){
    setConfig(user_config);
    return;
  }

  let last_config = JSON.parse(data);
  user_config = last_config;
});

/**
 * Variável usada para manipular de onde vem o vídeo que é mostrado em tempo real e o gravado pelo usuário
 */
let janela;

/**
 * Lê as configurações do usuário e atualiza os dados na sessão de uso atual
 */
const lerArquivo = () => {
  readFile(`./src/data/${fileName}`, 'utf-8', (error, data) => {
    if(!error){
      setConfig(user_config, `${fileName} atualizado.\n`);
      if(janela) selectSrc(janela);
      return;
    }
  });
}

/**
 * Variável usada para não ocorrer bounce na função
 */
let repeat = false;

/**
 * Chama a função para atualizar os dados
 * Usada para checar se as informações visuais coincidem com as configurações registradas no arquivo txt
 */
const getRefreshedConfig = () => {
  if(!repeat){
    if(0 >= (Date.now() - 20)){
      lerArquivo();
    }

    repeat = true;
    return;
  }
  
  lerArquivo();
}

/**
 * Importa as funcionalidades de dialog e menu para as respectivas variáveis.
 */
const { dialog, Menu } = remote;

/**
 * Instância do MediaRecorder pra gravar o vídeo 
 */
let mediaRecorder;

/**
 * Variável usada para guardar cada momento de um vídeo sendo gravado em um array
 */
const recordedChunks = [];

/**
 * Variável usada para lidar com a mudança de estado do botão de escolha de janelas
 * Ela começa como false, pois nenhuma janela é selecionada de antemão
 * Ao escolher alguma janela, essa váriavel passa a ser true até o fim do ciclo do app
 */
let escolhida = false;

/**
 * Container da área principal do app
 */
const elementsContainer = document.querySelector('.app');

/**
 * Elemento da logo
 */
const logo = document.querySelector('nav h1');

/**
 * Definição efeitos sonoros
 */
const sfxBtn = new Audio('./resrc/sfx/sfx_btn_2.mp3');
const sfxOpen = new Audio('./resrc/sfx/sfx_open.mp3');
const sfxClose = new Audio('./resrc/sfx/sfx_close.mp3');

/**
 * Botões de iniciar gravação, parar gravação e escolher janela para gravação
 */
const btnStart = document.querySelector('.js-btn-start');
const btnStop = document.querySelector('.js-btn-stop');
const btnVideoSelect = document.querySelector('.js-btn-video-select');

/**
 * Clique para iniciar gravação
 * Zera a variável dos dados guardados da última gravação (caso existam)
 * Inicia uma nova gravação
 * Desabilita o botão de começar a gravar e habilita o de parar de gravar
 * Troca o texto que fica na parte de cima da stream do vídeo para indicar que está gravando
 * Adiciona a animação na logo enquanto estiver gravando
 * O botão de escolha de janelas deverá ficar desabilitado
 * Se a configuração do usuário estiver definido como minimizar ao iniciar gravação, o app minimiza
 */
btnStart.addEventListener('click', () => {
  recordedChunks.splice(0,recordedChunks.length);
  mediaRecorder.start();
  btnStart.classList.add('btn-desabilitar');
  btnStop.classList.remove('btn-desabilitar');
  
  bemVindo.innerText = `Gravando "${janela.name}"`;

  logo.classList.add('recording');

  if(escolhida){
    btnVideoSelect.classList.remove('warn');
    btnVideoSelect.classList.add('btn-desabilitar');
  }

  if(user_config.minimizar)
    win.minimize();
});

/**
 * Clique para parar gravação
 * Para a gravação
 * Desabilita o botão de parar de gravar e habilita o de começar a gravar
 */
btnStop.addEventListener('click', () => {
  mediaRecorder.stop();
  btnStop.classList.add('btn-desabilitar');
  btnStart.classList.remove('btn-desabilitar');

  bemVindo.innerText = `Pré-visualizando "${janela.name}"`;

  logo.classList.remove('recording');

  if(escolhida){
    btnVideoSelect.classList.remove('btn-desabilitar');
    btnVideoSelect.classList.add('warn');
  }
});

/**
 * Referencia o elemento onde será transmitido o vídeo e o elemento do texto inicial
 */
const videoElement = document.querySelector('video');
const bemVindo = document.querySelector('.bem-vindo');

/**
 * Clique do botão para esolher uma janela para gravação
 * Executa a função para buscar as possibilidades de janelas
 * Toca o efeito sonoro de botão
 */
btnVideoSelect.addEventListener('click', () => {
  getVideoSources();
  sfxBtn.play();
});

/**
 * Pesquisa as janelas abertas no computador. além da tela toda, para que possam ser usadas para gravação
 * Mostra um um menu a tela e quais janelas estão abertas, para que o usuário possa escolher e clicar
 */
async function getVideoSources(){
  const inputSrcs = await desktopCapturer.getSources({
    types : ['window', 'screen']
  });
  
  const videoOptMenu = Menu.buildFromTemplate(
    inputSrcs.map(src => {
      return {
        label : src.name,
        click : () => selectSrc(src),
      };
    })
  );

  videoOptMenu.popup();
}

/**
 * Função que é executada ao selecionar um vídeo no menu de janelas disponíveis para gravação.
 * Ela define as configurações de vídeo para stream no elemento do vídeo
 * Tamém define as configurações de vídeo e áudio para gravação, de acordo com as configurações do usuário
 */
async function selectSrc(src) {
  const constraints = {
    audio : false,
    video : {
      mandatory : {
        chromeMediaSource : 'desktop',
        chromeMediaSourceId : src.id
      }
    }
  }

  let constraintsOut;

  if(user_config.som === true){
    constraintsOut = {
      audio : {
        mandatory : {
          chromeMediaSource : 'desktop'
        }
      },
      video : {
        mandatory : {
          chromeMediaSource : 'desktop',
          chromeMediaSourceId : src.id
        }
      }
    }
  }else{
    constraintsOut = {
      audio : false,
      video : {
        mandatory : {
          chromeMediaSource : 'desktop',
          chromeMediaSourceId : src.id
        }
      }
    }
  }

  /**
   * Caso não ocorra erro, transmite a janela escolhida no elemento do vídeo
   * Define as configurações para gravação de acordo com as configurações do usuário
   * Define que alguma tela foi escolhida
   * Pega os valores do objeto da janela escolhida e atribui na variável de contexto geral (janela)
   * Os botões de gravar e parar de gravar ficam visíveis
   * Ajusta o tamanho do container principal do app para não colidir com a barra de navegação
   * Verifica o tamanho do nome da janela e caso seja maior que 10 caracteres, usa os 10 primeiros e deixa com reticências no final, indicando a janela que está pré-visualizando
   * Cria o objeto do media recorder e configura as funções para guardar os dados de gravação em recordedChunks
   * E também para parar de guardar os dados após clicar em parar de gravar.
   * Toca o efeito sonoro dos botões
   * 
   * Caso ocorra algum erro, a qualquer momento, exibe o erro no console.
   */
  try{
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const videoOut = await navigator.mediaDevices.getUserMedia(constraintsOut);

    videoElement.srcObject = stream;
    videoElement.play();

    escolhida = true;

    janela = src;

    btnStart.classList.remove('btn-escala');
    btnStop.classList.remove('btn-escala');

    bemVindo.classList.add('bem-vindo-posicao');
    
    let exibicao;

    if(janela.name.length > 20){
      exibicao = `${janela.name.substr(0, 19)} ...`;
    }else{
      exibicao = janela.name;
    }
    bemVindo.innerText = `Pré-visualizando "${exibicao}"`;

    btnVideoSelect.innerText = 'Trocar janela';
    btnVideoSelect.classList.add('warn');

    elementsContainer.classList.add('app-changed');

    const options = { mimeType : 'video/webm; codecs=h264,vp9,opus' };
    mediaRecorder = new MediaRecorder(videoOut, options);

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;

    sfxBtn.play();
  }catch (error){
    console.error(`Erro "${error.name}" : ${error.message}`);
  }
  
}

/**
 * Função para guardar os dados gravados em um array
 */
function handleDataAvailable(el){
  recordedChunks.push(el.data);
}

/**
 * Função para parar de guardar os dados
 * Exibe a tela para salvar o vídeo com o caminho padrão para a pasta de vídeos
 * Ao clicar em salvar o vídeo é salvo de acordo com as configurações do usuário
 * Exibe no console que o vídeo foi salvo corretamente.
 */
async function handleStop(el) {
  const blob = new Blob(recordedChunks, {
    type : 'video/webm; codecs=h264,vp9,opus'
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  let extensao;
  switch(user_config.formato){
    case 'mp4':
      extensao = 'mp4';
      break;
    case 'avi':
      extensao = 'avi';
      break;
    case 'webm':
      extensao = 'webm';
      break;
    default:
      extensao = 'mp4'
      break;
  }

  const { filePath } = await dialog.showSaveDialog({
    title: 'Selecionar pasta para salvar o vídeo',
    buttonLabel : 'Salvar vídeo',
    defaultPath : `C:\\Users\\${process.env.USERNAME}\\Videos\\VID-${Date.now()}.${extensao}`, // se for o codec=h264,vp9,opus usar .webm, se tiver usando só codec=h264, pode usar mp4, avi
    filters : [
      {
        name : 'Vídeo',
        extensions: [
          `${extensao}`
        ]
      },
      // {
      //   name : 'All Files',
      //   extensions : '*'
      // }
    ],
    properties: [
      'showOverwriteConfirmation',
      'createDirectory',
      'openDirectory',
      'promptToCreate',
      'createDirectory'
    ]
  });

  if(filePath)
    writeFile(filePath, buffer, () => console.log('Vídeo salvo com sucesso!'));
}