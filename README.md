#  shear-applet.js

>微信小程序图片裁剪组件


### 参数
参数|类型|是否必填|说明
--|:--:|--:|--:|
imageUrl|String|是|需要裁剪的图片路径
MakWidth|Number|否|蒙版中心镂空部分宽度
MakHeight|Number|否|蒙版中心镂空部分高度
MaskForm|Number|否|蒙版中心镂空形状与剪切后的图片形状(1为正方形，2为圆形，其他无效)
MaxScaling|Number|否|允许图片扩大的最大倍数
Speed|Number|否|动画运行速度（可选范围0至3，数字越大速度越慢，（默认为1）超出无效）
>### 注意
>#### 需要注意 MakWidth与MakHeight不相等时MaskForm不能为2，只能为1

### 方法
方法名|功能
--|:--:|
rotateFunction|旋转|
restoreFunction|图片状态初始化|
shearFunction|确认裁剪|

### 引入与获取裁剪后的图片临时路径
```

// json 引入并注册
 "usingComponents": {
        "shear":"../shear-applet/shear-applet"
  }
  
// wxml
 <shear id="shearId" imageUrl="{{url}}" bind:ImagePath="event"></shear>
 <view>
    <view bindtap="rotateFn">
      旋转
    </view>
    <view bindtap="restoreFn">
      还原
    </view>
    <view bindtap="shearFn">
      剪切
    </view>
</view>

// js
 event(res){
    console.log(res.detail.pathStr)//res.detail.pathStr是裁剪后的图片临时路径
  },
  rotateFn(){
    // 使用子组件内的旋转方法
    this.selectComponent("#shearId").rotateFunction()
  },
  restoreFn(){
    // 使用子组件内的还原方法
    this.selectComponent("#shearId").restoreFunction()
  },
  shearFn(){
    // 使用子组件内的裁剪方法
    this.selectComponent("#shearId").shearFunction()
  },

```


- 邮箱: 1033279566@qq.com

---
