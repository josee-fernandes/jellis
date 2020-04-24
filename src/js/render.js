const { desktopCapturer, remote } = require('electron');

const { writeFile } = require('fs'); // filesystem

const { dialog, Menu } = remote;

let mediaRecorder; // Instância do MediaRecorder pra gravar o vídeo
const recordedChunks = [];

let escolhida = false;

let janela;

const elementsContainer = document.querySelector('.app');

// Botões
const btnStart = document.querySelector('.js-btn-start');
const btnStop = document.querySelector('.js-btn-stop');
const btnVideoSelect = document.querySelector('.js-btn-video-select');

btnStart.addEventListener('click', () => {
  mediaRecorder.start();
  btnStart.classList.add('btn-desabilitar');
  btnStop.classList.remove('btn-desabilitar');
  
  bemVindo.innerText = `Gravando "${janela}"`;

  if(escolhida){
    btnVideoSelect.classList.remove('warn');
    btnVideoSelect.classList.add('btn-desabilitar');
  }
});

btnStop.addEventListener('click', () => {
  mediaRecorder.stop();
  btnStop.classList.add('btn-desabilitar');
  btnStart.classList.remove('btn-desabilitar');

  bemVindo.innerText = `Pré-visualizando "${janela}"`;

  if(escolhida){
    btnVideoSelect.classList.remove('btn-desabilitar');
    btnVideoSelect.classList.add('warn');
  }
});

const videoElement = document.querySelector('video');
const bemVindo = document.querySelector('.bem-vindo');

btnVideoSelect.addEventListener('click', () => {
  getVideoSources();
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
        chromeMediaSource : 'desktop'
      }
    }
  };

  // Criar uma stream
  try{
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // Preview a tela no elemento <video>
    videoElement.srcObject = stream;
    videoElement.play();

    escolhida = true;

    janela = src.name;

    btnStart.classList.remove('btn-escala');
    btnStop.classList.remove('btn-escala');

    bemVindo.classList.add('bem-vindo-posicao');
    bemVindo.innerText = `Pré-visualizando "${janela}"`

    btnVideoSelect.innerText = 'Trocar janela';
    btnVideoSelect.classList.add('warn');

    elementsContainer.classList.add('app-changed');

    // Crirar o Media Recorder
    const options = { mimeType : 'video/webm; codecs=vp9' };
    mediaRecorder = new MediaRecorder(stream, options);

    // Registrar manipuladores de evento
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
  }catch (error){
    console.warn(`Erro "${error.name}" : ${error.message}`);
  }
  
}

function handleDataAvailable(el){
  recordedChunks.push(el.data);
}

// Salvar o arquivo do vídeo quando parar de gravar
async function handleStop(el) {
  const blob = new Blob(recordedChunks, {
    type : 'video/webm; codecs=vp9'
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  const { filePath } = await dialog.showSaveDialog({
    buttonLabel : 'Salvar vídeo',
    defaultPath : `VID-${Date.now()}.webm`
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