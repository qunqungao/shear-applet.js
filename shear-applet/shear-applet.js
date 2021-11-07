// 2021/10/30 22:29
// 群
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    imageUrl:{
      type:String
    },
    MakWidth:{
      type:Number
    },
    MakHeight:{
      type:Number
    },
    MaskForm:{
      type:Number,
      value:1,
    },
    MaxScaling:{
      type:Number,
      value:3,
    },
    Speed:{
      type:Number,
      value:1.7,
    },
  },
  observers: {
    'imageUrl': function (url) {
      this.setData({
        imgSrc:url
      })
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    srcq:"",
    canvasObj:{
      canvas:null,
      context:null,
      canvasTwo:null,
      contextTwo:null,
      canvasThree:null,
      contextThree:null
    },
    imgSrc:"",
    imgObj:null,
    rotate:0,
    MaskWidth:0,
    MaskHeight:0,
    windowWidth:0,
    windowHeight:0,
    border:{
      top:0,
      left:0,
      right:0,
      bottom:0
    },
    imageWidth:0,
    imageHeight:0,
    // MaxScaling:3,
    MinScaling:1,
    Left:0,
    Top:0,
    cX:0,
    cY:0,
    imageX:0,
    imageY:0,
    clearRectx:0,
    clearRecty:0,
    clearRectW:0,
    clearRectH:0,
    axis:null,
    switch:false,
    screenScale:0,
    functionSwitch:false,
    stored:{
      wide: 0,
      high : 0,
      originScale: 0,
      scale: 1,
    }
  },
  // 在组件实例进入页面节点树时执行
  attached(){
    // 获取系统信息
    wx.getSystemInfo({
      success: res => {

        // 获取可使用窗口宽度
        let clientHeight = res.windowHeight;
        // 获取可使用窗口高度
        let clientWidth = res.windowWidth;
        this.data.clearRectx = -((clientHeight * 5) - clientWidth) / 2;
        this.data.clearRecty = -((clientWidth * 5) - clientHeight) / 2;
        this.data.clearRectW = clientHeight * 5;
        this.data.clearRectH = clientWidth * 5;
        this.data.screenScale = (clientWidth / 100) * 75;
      
        if(this.properties.MakWidth == this.properties.MakHeight){
          this.data.functionSwitch = true;
        }else{
          this.data.functionSwitch = false;
        }
        this.maskControl()
        let about = (clientWidth - this.data.MaskWidth) / 2;
        let UpDown = (clientHeight - this.data.MaskHeight) / 2;
        // 设置蒙版边框
        this.setData({
          windowWidth:clientWidth,
          windowHeight:clientHeight,
          'border.top':UpDown,
          'border.left':about,
          'border.right':about,
          'border.bottom':UpDown
        });
        
      }
    });

    this.canvasLoad('#myCanvasTwo',2);
    this.canvasLoad('#myCanvasThree',3);

    if(this.properties.Speed < 0 || this.properties.Speed > 3){
      this.data.speed = 1.7 * 10;
    }else{
      this.data.speed = this.properties.Speed * 10;
    };
  },
  /**
   * 组件的方法列表
   */
  methods: {
    loadingImgFn(res){
       let shape = res.detail.width - res.detail.height <= 0 ? true : false;
       let imageW = shape ? this.data.screenScale : res.detail.width / (res.detail.height / this.data.screenScale);
       let imageH = shape ? res.detail.height / (res.detail.width / this.data.screenScale) : this.data.screenScale;
       this.data.rotate = 0;
       this.setData({
          imageWidth:imageW,
          imageHeight:imageH,
          'stored.wide':imageW,
          'stored.high':imageH
       })
      this.canvasLoad('#myCanvas',1);
    },
    errorImgFn(res){
      console.log("图片加载失败",res)
    },
    canvasDraw() {
      this.data.imgObj = this.data.canvasObj.canvas.createImage();//创建img对象
      //如果需要向canvas里载入多张图片，则需要分别创建多个img对象
      this.data.imgObj.onload = () => {
        this.data.imageX = (this.data.windowWidth / 2) - (this.data.imageWidth / 2);
        this.data.imageY = (this.data.windowHeight / 2) - (this.data.imageHeight / 2);
        this.data.canvasObj.context.drawImage(this.data.imgObj,this.data.imageX,this.data.imageY, this.data.imageWidth, this.data.imageHeight);
      };
      this.data.imgObj.src = this.data.imgSrc;
    },
    touchStart(res){//触摸开始
      this.data.switch = true;
      if(res.touches.length == 1){
        this.data.cX = res.touches[0].x;
        this.data.cY = res.touches[0].y;
        this.data.Left = this.data.imageX;
        this.data.Top = this.data.imageY;
        this.data.axis = null
      }else if(res.touches.length == 2){
        this.data.axis = res.touches;
        this.data.Left = this.data.imageX; 
        this.data.Top = this.data.imageY; 
        this.data.stored.originScale = this.data.stored.scale || 1;
      };
    },
    touchEnd(res){
      if(!this.data.touchEndSwitch){
        return;
      };
      this.data.touchEndSwitch = false;
      this.data.Left = this.data.imageX;
      this.data.Top = this.data.imageY;
      this.data.switch = false;
      let countArr = [
        {
          str:"左",
          count:this.data.imageX - this.data.border.left,
          fn:()=>{
            this.transitionFn(()=>{
              this.data.imageX = this.data.imageX -  (countArr[0].count / 10);
            },10);
          }
        },
        {
          str:"上",
          count:this.data.imageY - this.data.border.top,
          fn:()=>{
            this.transitionFn(()=>{
              this.data.imageY = this.data.imageY -  (countArr[1].count / 10);
            },10);
          }
        },
        {
          str:"右",
          count:(this.data.border.left + this.data.MaskWidth) - (this.data.imageX + this.data.imageWidth),
          fn:()=>{
            this.transitionFn(()=>{
              this.data.imageX = this.data.imageX +  (countArr[2].count / 10);
            },10);
          }
        },
        {
          str:"下",
          count:(this.data.border.top + this.data.MaskHeight) - (this.data.imageY + this.data.imageHeight),
          fn:()=>{
            this.transitionFn(()=>{
              this.data.imageY = this.data.imageY +  (countArr[3].count / 10);
            },10);
          }
        },
      ];
    
      for(let i = 0;i<countArr.length;i++){
        if(countArr[i].count > 0){
          countArr[i].fn();
        };
      };
  
    },
    touching(res){
      if (!this.data.switch) {
        return;
      };
      this.data.touchEndSwitch = true;
     if(res.touches.length == 2 && this.data.axis){
        
        let now = res.touches;
        //得到缩放比例， getDistance 是勾股定理的一个方法
        let scale = this.getDistance(now[0], now[1]) / this.getDistance(this.data.axis[0], this.data.axis[1]);
        let newScale = this.data.stored.originScale * scale;
        if(newScale > this.properties.MaxScaling){
          newScale = this.properties.MaxScaling;
        }else if(newScale < this.data.MinScaling){
          newScale = this.data.MinScaling;
        };
        this.data.imageX = this.data.imageX - (((this.data.stored.wide*newScale) - this.data.imageWidth) / 2);
        this.data.imageY = this.data.imageY - (((this.data.stored.high*newScale) - this.data.imageHeight) / 2);
        this.data.imageWidth = this.data.stored.wide*newScale;
        this.data.imageHeight = this.data.stored.high*newScale;
        // 记住使用的缩放值
        this.data.stored.scale = newScale;
        this.redrawFn();
      }else if(res.touches.length == 1){
        let nx = res.touches[0].x;
        let ny = res.touches[0].y;
       
        if (this.data.rotate == 0) {
          this.data.imageX = nx - (this.data.cX - this.data.Left);
          this.data.imageY = ny - (this.data.cY - this.data.Top);
        } else if (this.data.rotate == 90) {
          this.data.imageX = ny - (this.data.cY - this.data.Left);
          this.data.imageY = this.data.cX - (nx - this.data.Top);
        } else if (this.data.rotate == 180) {
          this.data.imageX = this.data.cX - (nx - this.data.Left);
          this.data.imageY = this.data.cY - (ny - this.data.Top);
        } else if (this.data.rotate == 270) {
          this.data.imageX = this.data.cY - (ny - this.data.Left);
          this.data.imageY = nx - (this.data.cX - this.data.Top);
        }
        this.redrawFn();
      };
      
    },
    rotateFunction(){
      if(!this.data.functionSwitch){
        console.log("MakWidth与MakHeight不相等时，此功能禁用")
        return;
      };
 
      let centreX = this.data.windowWidth / 2;
      let centreY = this.data.windowHeight / 2;

      switch (this.data.rotate) {
        case 0:
            this.data.rotate = 90;
            break;
        case 90:
             this.data.rotate = 180;
             break;
        case 180:
             this.data.rotate = 270;
             break;
        case 270:
             this.data.rotate = 0;
             break;
      } 

      this.transitionFn(()=>{
        this.data.canvasObj.context.translate(centreX, centreY);
        this.data.canvasObj.context.rotate(6 * Math.PI / 180);
        this.data.canvasObj.context.translate(-centreX, -centreY);
        this.data.canvasObj.contextThree.translate(centreX, centreY);
        this.data.canvasObj.contextThree.rotate(6 * Math.PI / 180);
        this.data.canvasObj.contextThree.translate(-centreX, -centreY);
      },15)
  
    },
    restoreFunction(){
      let centreX = this.data.windowWidth / 2; 
      let centreY = this.data.windowHeight / 2; 

      let carryOut = this.data.rotate !=0 ? this.data.rotate / 6 : 12;
      let restoreX = (this.data.imageX-((this.data.windowWidth / 2) - (this.data.stored.wide / 2))) / carryOut;
      let restoreY = (this.data.imageY-((this.data.windowHeight / 2) - (this.data.stored.high / 2))) / carryOut;
      let restoreW = (this.data.imageWidth-this.data.stored.wide)/carryOut;
      let restoreH = (this.data.imageHeight-this.data.stored.high)/carryOut;
      this.data.stored.originScale = 1;
      this.data.stored.scale = 1;

      this.transitionFn(()=>{
        this.data.imageX = this.data.imageX - restoreX;
        this.data.imageY = this.data.imageY - restoreY;
        this.data.imageWidth = this.data.imageWidth - restoreW;
        this.data.imageHeight = this.data.imageHeight - restoreH;
      },carryOut);

 
      if(this.data.rotate != 0){
        this.transitionFn(()=>{
          this.data.canvasObj.context.translate(centreX, centreY);
          this.data.canvasObj.context.rotate(-6 * Math.PI / 180);
          this.data.canvasObj.context.translate(-centreX, -centreY);
          this.data.canvasObj.contextThree.translate(centreX, centreY);
          this.data.canvasObj.contextThree.rotate(-6 * Math.PI / 180);
          this.data.canvasObj.contextThree.translate(-centreX, -centreY);
        },carryOut);
        this.data.rotate = 0;
      };
    },
    shearFunction(){
    
      let destW = this.properties.MakWidth <= 0 ?  this.data.screenScale : this.properties.MakWidth;
      let destH = this.properties.MakHeight <= 0 ?  this.data.screenScale : this.properties.MakHeight;
      if(this.properties.MaskForm == 1 || !this.data.functionSwitch){
        wx.canvasToTempFilePath({
          x:this.data.border.left,
          y:this.data.border.top,
          width:this.data.MaskWidth,
          height: this.data.MaskHeight,
          destWidth: destW,
          destHeight: destH,
          canvas: this.data.canvasObj.canvas,
          quality: 1, 
          success: res => {
            this.triggerEvent('ImagePath',{pathStr:res.tempFilePath});
          },
          fail: res=>{
            console.log(res);
          }
        });
      }else if(this.properties.MaskForm == 2 && this.data.functionSwitch){
        // arc(x, y, r, s, e, counterclockwise)
        // x,y：圆心
        // r：圆的半径
        // s：起始弧度 (0)
        // e：终止弧度 (1.5 * Math.PI)
        // counterclockwise：弧度的方向是否是逆时针
        this.data.canvasObj.contextThree.save();
        this.data.canvasObj.contextThree.arc( this.data.windowWidth/2  , this.data.windowHeight/2 , this.data.MaskWidth/2, 0, 2 * Math.PI,false); 
        this.data.canvasObj.contextThree.clip(); //剪切形状
        this.data.canvasObj.contextThree.drawImage(this.data.imgObj,this.data.imageX,this.data.imageY, this.data.imageWidth, this.data.imageHeight); 
        this.data.canvasObj.contextThree.restore(); //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 可以继续绘制
        wx.canvasToTempFilePath({
          x:this.data.border.left,
          y:this.data.border.top,
          width:this.data.MaskWidth,
          height: this.data.MaskHeight,
          destWidth: destW,
          destHeight: destH,
          canvas: this.data.canvasObj.canvasThree,
          quality: 1, 
          success: res => {
            this.triggerEvent('ImagePath',{pathStr:res.tempFilePath});
            this.data.canvasObj.contextThree.clearRect(this.data.clearRectx,this.data.clearRecty, this.data.clearRectW,  this.data.clearRectH);
          },
          fail: res=>{
            console.log(res)
          }
        });
      };
    },
    canvasLoad(canvasnName,index){
        //  小程序画布的官方api    
     const query = wx.createSelectorQuery()
     query.in(this).select(canvasnName).fields({id: true,node: true,size: true}).exec(init.bind(this));
      function init(res) {
        //  小程序画布的官方api 
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        // //新接口需显示设置画布宽高；
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);
        if(index == 1){
          this.setData({
            'canvasObj.canvas':canvas,
            'canvasObj.context':ctx
          });
          this.canvasDraw();//向画布载入图片的方法
        }else if(index == 2){
          this.setData({
            'canvasObj.canvasTwo':canvas,
            'canvasObj.contextTwo':ctx
          });
          this.maskFormFn()//加载蒙版
        }else if(index == 3){
          this.setData({
            'canvasObj.canvasThree':canvas,
            'canvasObj.contextThree':ctx
          });
        }
      };
    },
    maskFormFn(){
      let form
      if(this.properties.MaskForm != 1 && this.properties.MaskForm != 2){
        form = 1
      }else{
        form = this.properties.MaskForm
      }
      if(form == 1 || !this.data.functionSwitch){//中心方形镂空
        // 外围
        this.data.canvasObj.contextTwo.moveTo(0, 0);
        this.data.canvasObj.contextTwo.lineTo(this.data.windowWidth, 0);
        this.data.canvasObj.contextTwo.lineTo(this.data.windowWidth, this.data.windowHeight);
        this.data.canvasObj.contextTwo.lineTo(0, this.data.windowHeight);
        this.data.canvasObj.contextTwo.closePath();
        // 内层
        this.data.canvasObj.contextTwo.moveTo(this.data.MaskWidth+this.data.border.left,this.data.border.top);
        this.data.canvasObj.contextTwo.lineTo(this.data.border.left, this.data.border.top);
        this.data.canvasObj.contextTwo.lineTo( this.data.border.left, this.data.MaskHeight+this.data.border.top);
        this.data.canvasObj.contextTwo.lineTo(this.data.MaskWidth+this.data.border.left, this.data.MaskHeight+this.data.border.top);
        this.data.canvasObj.contextTwo.closePath();
        this.data.canvasObj.contextTwo.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.data.canvasObj.contextTwo.fill();
      }else if(form  == 2){//中心圆形镂空
        this.data.canvasObj.contextTwo.fillStyle = 'rgba(0, 0, 0, 0.4)';
        // 外围
        this.data.canvasObj.contextTwo.moveTo(0, 0);
        this.data.canvasObj.contextTwo.lineTo(this.data.windowWidth, 0);
        this.data.canvasObj.contextTwo.lineTo(this.data.windowWidth, this.data.windowHeight);
        this.data.canvasObj.contextTwo.lineTo(0, this.data.windowHeight);
        this.data.canvasObj.contextTwo.closePath();
        // 内层
        this.data.canvasObj.contextTwo.arc( this.data.windowWidth/2 , this.data.windowHeight/2,this.data.MaskWidth/2, 0, 2 * Math.PI,true); 
        this.data.canvasObj.contextTwo.fill();
      }
    },
    maskControl(){
      if(this.properties.MakWidth > this.data.screenScale || this.properties.MakHeight > this.data.screenScale) {
          if(this.properties.MakWidth > this.properties.MakHeight){
            let ratio = this.properties.MakWidth / this.data.screenScale;
            this.data.MaskWidth = this.data.screenScale;
            this.data.MaskHeight = this.properties.MakHeight / ratio;
          }else{
            let ratio = this.properties.MakHeight / this.data.screenScale;
            this.data.MaskWidth = this.properties.MakWidth / ratio;
            this.data.MaskHeight = this.data.screenScale;
          }
      }else if(this.properties.MakWidth && this.properties.MakHeight){
        this.data.MaskWidth = this.properties.MakWidth;
        this.data.MaskHeight = this.properties.MakHeight;
      }else{
        this.data.MaskWidth = this.data.screenScale;
        this.data.MaskHeight = this.data.screenScale;
      }
    },
    redrawFn(){
      this.data.canvasObj.context.clearRect(this.data.clearRectx,this.data.clearRecty, this.data.clearRectW,  this.data.clearRectH);
      this.data.canvasObj.context.drawImage(this.data.imgObj,this.data.imageX,this.data.imageY, this.data.imageWidth, this.data.imageHeight);
    },
    transitionFn(fn,cishu){
      let count = 0;
      let time = setInterval(()=>{
        if(count < cishu){
          count++;
          fn();
          this.redrawFn();
      }else{
          clearInterval(time);
       };
      },this.data.speed);
    },
    getDistance(p1, p2) {
      let x = p2.x - p1.x,
          y = p2.y - p1.y;
      return Math.sqrt(x * x + y * y);
    },
  }
})
