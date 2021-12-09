/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
"use strict";
const h1Sentence = document.querySelector('h1');
const localVideo = document.getElementById("local");
const recordedVideo = document.getElementById("recorded");
const startBtn = document.getElementById("start");
const recordBtn = document.getElementById("record");
const playBtn = document.getElementById("play");
const downloadBtn = document.getElementById("download");
const timer = document.querySelector('h4');
let mediaRecorder;
let localBlobs;
let recordedBlobs;
var value = [
  '名前を教えてください'
, '何歳ですか'
, '誕生日はいつですか'
, '出身地はどこですか'
, '血液型は何型ですか'
, '好きな食べ物は何ですか'
, '嫌いな食べ物は何ですか'
, '好きなスポーツは何ですか'
, '好きな季節はいつですか'
, '今までで一番高い買い物は何ですか'
, '休日はどんなことをして過ごしますか'
, '趣味は何ですか'
, '入っていた部活動について教えてください'
, '100万円を貰ったら何に使いますか'
, '何人家族ですか'
, '好きな動物は何ですか'
, '得意な料理は何ですか'
, 'コンビニでよく買うものは何ですか'
, '小さい頃の夢は何ですか'
, '好きなテレビ番組は何ですか'
, '好きなアニメは何ですか'
, '好きな漫画は何ですか'
, '好きなゲームは何ですか'
, 'アルバイトの経験について教えてください'
, '夏休みの宿題はいつやるタイプですか'
, '行ってみたい場所はありますか'
, '掃除は得意ですか'
, 'よく利用するアプリサービスを教えてください'];

var question_number=0;
var startVideoTime;
var startTimerTime;
var elapsedTime = 0;//経過時刻を更新するための変数。 初めはだから0で初期化
var timerId;//タイマーを止めるにはclearTimeoutを使う必要があり、そのためにはclearTimeoutの引数に渡すためのタイマーのidが必要

//タイマーをストップ -> 再開させたら0になってしまうのを避けるための変数。
var timeToadd = 0;
function updateTimetText(){

  //m(分) = 135200 / 60000ミリ秒で割った数の商　-> 2分
  var m = Math.floor(elapsedTime / 60000);

  //s(秒) = 135200 % 60000ミリ秒で / 1000 (ミリ秒なので1000で割ってやる) -> 15秒
  var s = Math.floor(elapsedTime % 60000 / 1000);

  //ms(ミリ秒) = 135200ミリ秒を % 1000ミリ秒で割った数の余り
  var ms = elapsedTime % 1000;


  //HTML 上で表示の際の桁数を固定する　例）3 => 03　、 12 -> 012
  //javascriptでは文字列数列を連結すると文字列になる
  //文字列の末尾2桁を表示したいのでsliceで負の値(-2)引数で渡してやる。
  m = ('0' + m).slice(-2); 
  s = ('0' + s).slice(-2);
  ms = ('0' + ms).slice(-2);

  //HTMLのid　timer部分に表示させる　
  timer.textContent = m + ':' + s+ ':' + ms;
}

//再帰的に使える用の関数
function countUp(){

  //timerId変数はsetTimeoutの返り値になるので代入する
  timerId = setTimeout(function(){

      //経過時刻は現在時刻をミリ秒で示すDate.now()からstartを押した時の時刻(startTimerTime)を引く
      elapsedTime = Date.now() - startTimerTime + timeToadd;
      updateTimetText()

      //countUp関数自身を呼ぶことで10ミリ秒毎に以下の計算を始める
      countUp();

  //1秒以下の時間を表示するために10ミリ秒後に始めるよう宣言
  },30);
}


shuffleArray()

function getLocalMediaStream(mediaStream) {
  recordBtn.disabled = false;
  const localStream = mediaStream;
  localVideo.srcObject = mediaStream;
  window.stream = mediaStream;
}

function handleLocalMediaStreamError(error) {
  console.log(`navigator.getUserMedia error: ${error}`);
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function shuffleArray(){
  let a=value.length;
  while (a) {
    let j = Math.floor( Math.random() * a );
    let t = value[--a];
    value[a] = value[j];
    value[j] = t;
  }
}

function selectQusetion(num){
  question_number=num
  var str='質問'+(question_number+1)+':'+value[question_number];
  question_number++
  return str
}

function startRecording() {
  recordedBlobs = [];
  const options = { mimeType: "video/webm;codecs=vp9" };
  document.querySelector('h4').innerText="~録画中~"
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (error) {
    console.log(`Exception while creating MediaRecorder: ${error}`);
    return;
  }

  console.log("Created MediaRecorder", mediaRecorder);
  recordBtn.textContent = "録画停止";
  playBtn.disabled = true;
  downloadBtn.disabled = true;

  mediaRecorder.onstop = event => {
    console.log("Recorder stopped: ", event);
  };
  	
  
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10);
  console.log("MediaRecorder started", mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
  document.querySelector('h4').innerText=""
  console.log("Recorded media.");
}


startBtn.addEventListener("click", () => {
  //startVideoTime = Date.now();
  //countUp();

  const constraints = {
    audio: true,
    video: {
      width: 1280,
      height: 720
    }
  };
  h1Sentence.innerText=selectQusetion(0);
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(getLocalMediaStream)
    .catch(handleLocalMediaStreamError);
});

recordBtn.addEventListener("click", () => {
  if (recordBtn.textContent === "録画開始") {
    //録画時間の表示
    startTimerTime = Date.now();
    countUp();

    //videoの録画
    startRecording();
    recordedVideo.src=null;
  } else {
    clearTimeout(timerId);
    elapsedTime = 0;
    updateTimetText();
    stopRecording();
    recordBtn.textContent = "録画開始";
    playBtn.disabled = false;
    downloadBtn.disabled = false;
  }
});

playBtn.addEventListener("click", () => {
  const superBuffer = new Blob(recordedBlobs, { type: "video/webm" });
  recordedVideo.src = null;
  recordedVideo.srcObject = null;
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  recordedVideo.controls = true;
  recordedVideo.play();
});

downloadBtn.addEventListener("click", () => {
  const blob = new Blob(recordedBlobs, { type: "video/webm" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = "rec.webm";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
  h1Sentence.innerText=selectQusetion(question_number);
  recordedVideo.src=null;
  playBtn.disabled = true;
  downloadBtn.disabled = true;
});
