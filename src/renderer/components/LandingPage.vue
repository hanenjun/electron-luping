<template>
  <div id="wrapper">
    <div class="lpbtn">
      <button id="pause" ref="pause" @click="pausebtn" v-show="lpz">暂停</button>
    <button id="resume" ref="resume" @click="resumebtn" v-show="islp&&!lpz">继续</button>
    <button id="stop" ref="stop" @click="stopbtn" v-show="islp">停止</button>
    <button id="sava" ref="sava" @click="savabtn" v-show="islp">保存</button>
    <button id="start" ref="start" @click="startbtn" v-show="!islp&&!lpz">开始</button>
    <div id="filenamebox" ref="filenamebox" style="display: none">
      <input id="filename" ref="filename" type="text" />
      <button id="savabtn" ref="savabtn" @click="savabtnbtn">保存</button>
    </div>
   <div  v-show="!islp&&!lpz">
      选择录屏窗口：
    <select style="width:100px" @change="setid" id="select" ref="select">
      <option v-for="(item,index) in list" :key="index" :value="item.id">{{item.name}}</option>
    </select>
   </div>
    </div>
    <div v-show="!islp&&!lpz" class="mlpts" style="z-index:-10;width:100%;height:100%;position: absolute;top:0;left:0" >
        <h1 style="color:red">还没有开始录屏</h1>
    </div>
    <video v-show="islp" ref="video" src="" style="z-index:-10;width:100%;height:100%;position: absolute;top:0;left:0" ></video>
  </div>
</template>

<script>
let filename = null;
let video = null;
let recorder = null
let sourceId = null;
const {dialog} = require('electron').remote;
import { desktopCapturer,ipcRenderer } from "electron";
import fs from 'fs'
export default {
  name: "landing-page",
  components: {},
  data(){
    return{
      list:[],
      islp:false,
      lpz:false,
      isstop:false,
    }
  },
  methods: {
    start:function() {
      video = this.$refs.video; // 使用video标签
      desktopCapturer.getSources(
        {
          types: ["window", "screen"],
        },
        (err, sources) => {
          /*首先根据选择的录制源是窗口还是摄像头以不同的方式获取视频流；*/
          // let sourceId = source.id; // 所选择的屏幕或窗口 sourceId
          let stream = navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: sourceId,
                maxWidth: window.screen.width,
                maxHeight: window.screen.height,
              },
            },
          });
          /*因为无法通过直接设置 audio: true 来获取音频，所以需要另外加入麦克风的音轨。*/
          console.log(stream)
          stream
            .then((Mediastream) => {
              let audioTracks = navigator.mediaDevices
                .getUserMedia({
                  audio: true,
                  video: false,
                })
                .then((mediaStream) => {
                  this.islp = true
                  this.lpz = true
                  console.log(Mediastream)
                  video.srcObject = Mediastream;
                  video.onloadedmetadata = (e) => {video.play();console.log(e)};
                  console.dir(video)
                  //mediaStream.getAudioTracks()[0];
                  Mediastream.addTrack(mediaStream.getAudioTracks()[0]);
                  this.createRecorder(Mediastream); // createRecorder() 函数实现见下文
                });
            })
            .catch((err) => console.error("startRecord error", err));
        }
      );
    },
 
    createRecorder:function(stream) {

      recorder = new MediaRecorder(stream);
      recorder.start();
console.log(recorder,recorder.stream)
      // 如果 start 没设置 timeslice，ondataavailable 在 stop 时会触发
      recorder.ondataavailable = (event) => {
        console.log(event);
        let blob = new Blob([event.data], {
          type: "video/mp4",
        });
        this.saveMedia(blob);
      };
      recorder.onerror = (err) => {
        console.error(err);
      };
    },
    /*stopRecorder() 函数结束录制并保存至本地 mp4 文件；*/
    stopRecord:function() {
      recorder.stop();
    },
    setid: (e) => {
      var selValue = e.target.options[e.target.selectedIndex].value; //获取当前选择项的值
      console.log(selValue);
      sourceId = selValue;
    },
    saveMedia: (blob) => {
      let reader = new FileReader();
      reader.onload = () => {
        let buffer = new Buffer(reader.result);
        // let content = "Some text to save into the file";

// You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
dialog.showSaveDialog((fileName) => {
    if (fileName === undefined){
        console.log("You didn't save the file");
        return;
    }

    // fileName is a string that contains the path and filename created in the save file dialog.  
    fs.writeFile(fileName, buffer, (err) => {
        if(err){
            alert("An error ocurred creating the file "+ err.message)
        }
                    
        alert("The file has been succesfully saved");
    });
}); 
        // fs.writeFile(filename + ".mp4", buffer, {}, (err, res) => {
        //   if (err) return console.error(err);
        // });
      };
      reader.onerror = (err) => console.error(err);
      reader.readAsArrayBuffer(blob);
    },

    sava: (filenameval) => {
      // this.islp = true
      filename = filenameval;
      recorder.requestData();
    },

    pause:function() {
      // this.islp = false
                  this.lpz = false

      recorder.pause();
      video.pause();
    },

    resume:function() {
      this.lpz = true
      recorder.resume();
      video.play();
    }, 
    stopbtn:function() {
        video.pause();
      this.islp = false
      this.lpz = false
      //   console.log("stop");
      //  this.$refs.filenamebox.style.display = 'block'
        // this.stopRecord();
        recorder = null
    },
    startbtn:function() {
    // this.$router.push({
    //   name:'djs'
    // })
       ipcRenderer.send("start");
       setTimeout(()=>{
        this.start();
       },4000)
    },
    savabtn:function() {
        console.log("savainput");
        this.sava()
        // this.$refs.filenamebox.style.display = "block";
    },
    savabtnbtn:function() {
        console.log("sava");
        let filename = this.$refs.filename.value;
        if (filename) {
          this.sava(filename);
        } else {
          alert(1);
        }
    },
    pausebtn:function() {
        console.log("pause");
        this.pause();
    },
    resumebtn:function() {
        console.log("resume");
        this.resume();
    },
  },
  created() {
    desktopCapturer.getSources(
      {
        types: ["window", "screen"],
      },
      (err, sources) => {
        console.log(sources);
        sourceId = sources[0].id;
        this.list = sources

      }
    );
   
  },
};
</script>

<style>
.lpbtn{
  z-index:99999;width:600px;
margin: 0 auto;
   height: 50px;
  background: transparent;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.mlpts{
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
