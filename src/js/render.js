// Botões
const videoElement = document.querySelector('video');
const btnStart = document.querySelector('.js-btn-start');
const btnStop = document.querySelector('.js-btn-stop');
const btnVideoSelect = document.querySelector('.js-btn-video-select');

let mediaRecorder; // Instância do MediaRecorder pra gravar o vídeo
const recordedChunks = [];

btnVideoSelect.addEventListener('click', () => {
  getVideoSources();
});

btnStart.addEventListener('click', () => {
  mediaRecorder.start();
  // btnStart.classList.add('');
  btnStart.innerText = 'Recording';
});

btnStop.addEventListener('click', () => {
  mediaRecorder.stop();
  // btnStart.classList.remove('')
  btnStart.innerText = 'Start';
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



// Muda a tela do vídeo para gravar
const selectSrc = async src => {
  btnVideoSelect.innerText = src.name;

  const constraints = {
    audio : false,
    video : {
      mandatory : {
        chromeMediaSource : 'desktop',
        chromeMediaSourceId : src.id
      }
    }
  };

  // Criar uma stream
  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  // Preview a tela no elemento <video>
  videoElement.srcObject = stream;
  videoElement.play();

  // Crirar o Media Recorder
  const options = { mimeType : 'video/webm; codecs=vp9' };
  mediaRecorder = new MediaRecorder(stream, options);

  // Registrar manipuladores de evento
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
}

const handleDataAvailable = el => {
  recordedChunks.push(e.data);
}

const { dialog } = remote;

const { writeFile } = require('fs'); // filesystem

// Salvar o arquivo do vídeo quando parar de gravar
const handleStop = async el => {
  const blob = new Blob(recordedChunks, {
    type : 'video/webm; codecs=vp9'
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  const { filePath } = await dialog.showSaveDialog({
    buttonLabel : 'Salvar vídeo',
    defaultPath : `vid-${Date.now()}.webm`
  });

  if(filePath)
    writeFile(filePath, buffer, () => console.log('Vídeo salvo com sucesso!'));
}