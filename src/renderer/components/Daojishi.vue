<template>
  <div class="djsbox">     
            <span style="z-index：999999;color:red;font-size:60px">{{ djs }}</span>
  </div>
</template>

<script>
import { desktopCapturer, ipcRenderer } from "electron";

export default {
  data() {
    return {
      djs: 3,
    };
  },
  mounted() {
   
    let time = setInterval(() => {
      this.djs = this.djs -= 1;
      if (this.djs < 0) {
          this.djs = 0
        console.log(1);
        clearInterval(time);
      }
    }, 1000);
  },
};
</script>

<style>
.djsbox {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.djsboxs{
    background: black;
  opacity: 0.5;
 width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>