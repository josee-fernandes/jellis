new Audio('./resrc/sfx/sfx_start.wav').play();

const { desktopCapturer, remote } = require('electron');

const { writeFile, readFile } = require('fs'); // filesystem

const fileName = 'user_config.txt';

let user_config = {
  som : true,
  formato : 'mp4',
  minimizar : false
}

const btnAtualizar = document.querySelector('.js-atualizar');

const configPadrao = () => {
  writeFile(`./src/data/${fileName}`, JSON.stringify({user_config}), (error) => {
    if(error){
      console.error(`Erro ao tentar criar arquivo ${fileName}: ${error}`);
      return;
    }
  
    console.log(`${fileName} criado.`);
  });
}

readFile(`./src/data/${fileName}`, 'utf-8', (error, data) => {
  if(error+''.includes('no such file or directory')){
    configPadrao();
    return;
  }

  let last_config = JSON.parse(data);
  user_config = last_config;
});

let janela;

const getRefreshedConfig = () => {
  readFile(`./src/data/${fileName}`, 'utf-8', (error, data) => {
    if(!error){
      let last_config = JSON.parse(data);
      user_config = last_config;
      selectSrc(janela);
      console.log(user_config);
      return;
    }
  
    console.error(error);
  });
}

btnAtualizar.addEventListener('click', () => {
  getRefreshedConfig();
});

const { dialog, Menu } = remote;

let mediaRecorder; // Instância do MediaRecorder pra gravar o vídeo
const recordedChunks = [];

let escolhida = false;

const elementsContainer = document.querySelector('.app');

// Logo
const logo = document.querySelector('nav h1');

// Efeitos sonoros
const sfxBtn = new Audio('./resrc/sfx/sfx_btn.wav');
// const sfxRecord = new Audio('./resrc/sfx/sfx_record.wav');
// const sfxStopRecord = new Audio('./resrc/sfx/sfx_stop_record.wav');

// Botões
const btnStart = document.querySelector('.js-btn-start');
const btnStop = document.querySelector('.js-btn-stop');
const btnVideoSelect = document.querySelector('.js-btn-video-select');

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

  // sfxRecord.play();

  if(user_config.minimizar)
    win.minimize();
});

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

  // setTimeout(() => {
  //   sfxStopRecord.play();
  // }, 500);
});

const videoElement = document.querySelector('video');
const bemVindo = document.querySelector('.bem-vindo');

btnVideoSelect.addEventListener('click', () => {
  getVideoSources();
  sfxBtn.play();
});

// Pega as telas disponíveis
async function getVideoSources(){
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

// Muda a tela do vídeo para gravar
async function selectSrc(src) {
  const constraints = {
    audio : false,
    video : {
      mandatory : {
        chromeMediaSource : 'desktop',
        chromeMediaSourceId : src.id
      }
    }
  };

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
    };
    console.log('Config do Som True');
  }else{
    constraintsOut = {
      audio : false,
      video : {
        mandatory : {
          chromeMediaSource : 'desktop',
          chromeMediaSourceId : src.id
        }
      }
    };

    console.log('Config do Som False');
  }

  // Criar uma stream
  try{
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const videoOut = await navigator.mediaDevices.getUserMedia(constraintsOut);

    // Preview a tela no elemento <video>
    videoElement.srcObject = stream;
    videoElement.play();

    escolhida = true;

    janela = src;

    btnStart.classList.remove('btn-escala');
    btnStop.classList.remove('btn-escala');

    bemVindo.classList.add('bem-vindo-posicao');
    bemVindo.innerText = `Pré-visualizando "${janela.name}"`

    btnVideoSelect.innerText = 'Trocar janela';
    btnVideoSelect.classList.add('warn');

    elementsContainer.classList.add('app-changed');

    // Crirar o Media Recorder
    const options = { mimeType : 'video/webm; codecs=h264,vp9,opus' };
    mediaRecorder = new MediaRecorder(videoOut, options);

    // Registrar manipuladores de evento
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;

    sfxBtn.play();
  }catch (error){
    console.error(`Erro "${error.name}" : ${error.message}`);
  }
  
}

function handleDataAvailable(el){
  recordedChunks.push(el.data);
}

// Salvar o arquivo do vídeo quando parar de gravar
async function handleStop(el) {
  const blob = new Blob(recordedChunks, {
    type : 'video/webm; codecs=h264,vp9,opus' // ,vp9,opus
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  let extensao;
  switch(user_config.formato){
    case 'mp4':
      extensao = 'mp4';
      console.log('mp4');
      break;
    case 'avi':
      extensao = 'avi';
      console.log('avi');
      break;
    case 'webm':
      extensao = 'webm';
      console.log('webm');
      break;
    default:
      extensao = 'mp4'
      console.log('mp4 2');
      break;
  }

  const { filePath } = await dialog.showSaveDialog({
    buttonLabel : 'Salvar vídeo',
    defaultPath : `VID-${Date.now()}.${extensao}` // se for o codec=h264,vp9,opus usar .webm, se tiver usando só codec=h264, pode usar mp4, avi
  });

  if(filePath)
    writeFile(filePath, buffer, () => console.log('Vídeo salvo com sucesso!'));
}

setInterval(() => {
  if(escolhida){
    if(videoElement.srcObject == null){
      btnVideoSelect.classList.remove('warn');
      escolhida = false;
      bemVindo.classList.remove('bem-vindo-posicao');
      bemVindo.innerText = 'Para gravar, comece escolhendo uma janela!🤗';
      elementsContainer.classList.remove('app-changed');
    }
  }
}, 1000);