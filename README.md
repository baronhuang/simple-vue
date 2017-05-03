# simple-vue
使用vue双向绑定原理做的简单计算器

# 实现原理
vue的实现原理主要是利用es5的Object.defineProperty()方法，对属性进行劫持，监听数据的变化。在实现细节上利用观察者模式（订阅发布模式），
可以让多个观察者监听某一个对象，当对象的属性变化时，通知观察者，观察者就可以做相应的回调操作，然后更新前端的视图（调用compile，编译模板）。
流程：用户操作->directive指令->Dep.notify()->通知Watch.update()->视图变化
<br>
![](https://github.com/baronhuang/simple-vue/raw/master/static/ex.png) 