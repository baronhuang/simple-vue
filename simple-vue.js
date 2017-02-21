/**
 * Created by Administrator on 2017/2/21 0021.
 */

;(function () {
    /*把元素转换成DocumentFragment，便于插入document里面*/
    function nodeToFragment (node, vm) {
        var flag = document.createDocumentFragment();
        [].slice.call(node.childNodes).forEach(function (item, i) {
            compile(item, vm);
            flag.append(item);
        });

        return flag;
    }

    /*编译template*/
    function compile (node, vm) {
        if(node.nodeType === 1){
            if(node.hasAttribute('v-text')){
                /*编译的时候，把watcher、html元素、vm实例关联起来*/
                new Watcher(vm, node, node.getAttribute('v-text'), 'text');

                /*有子元素则继续遍历*/
            }else if(node.hasChildNodes()){
                [].slice.call(node.childNodes).forEach(function(node) {
                    compile(node, vm);
                });
            }

            /*检测是否绑定了事件*/
            var reg = /\@(.+)/;
            var reg2 = /\((.*)\)/;
            [].slice.call(node.attributes).forEach(function (attr, i) {
                if(reg.test(attr.nodeName)){
                    var eventName = attr.nodeName.match(reg)[1];
                    var funName = attr.nodeValue.replace(reg2, '');
                    var params = attr.nodeValue.match(reg2)[1].split(',');
                    node.addEventListener(eventName, function () {
                        vm.method[funName].apply(vm, params)
                    }, false);

                }
            });

            dirctive(node, vm);
        }
    }

    /*这里定义一些diective*/
    function dirctive(node, vm) {
        if(node.hasAttribute('v-model') &&
            (node.tagName == 'INPUT' || node.tagName == 'TEXTAREA')){
            new Watcher(vm, node, node.getAttribute('v-model'), 'model');
            node.addEventListener('input', function (e) {
                vm[node.getAttribute('v-model')] = e.target.value;
            }.bind(vm), false);
        }
    }

    /*观察者*/
    function observer (obj, vm) {
        /*遍历data里面的key*/
        Object.keys(obj).forEach(function (key) {
            defineReactive(vm, key, obj[key]);
        });
    }

    /*利用defineProperty的特性定义响应操作，并把data遍历出来放到vue实例里面*/
    function defineReactive(obj, key, val) {
        console.log('-------defineReactive')
        var dep = new Dep();
        Object.defineProperty(obj, key, {
            get: function () {
                console.log('------------get');
                /*埋点，第一次调用get才会用到*/
                if (Dep.target) dep.addSub(Dep.target);
                return val;
            },
            set: function (newVal) {
                console.log('-------------set');
                if(newVal === val) {
                    return;
                }else {
                    val = newVal;
                    dep.notify();

                }
            }
        })
    }

    /*订阅者，data对象变化时做相应的操作*/
    function Watcher(vm, node, name, type) {
        /*Dep.target作为一个缓存对象，用于存放当前准备加入监听队列的订阅者，之后需要置空*/
        Dep.target = this;
        this.name = name;
        this.node = node;
        this.type = type;
        this.vm = vm;
        this.update();
        /*加入队列后置为空*/
        Dep.target = null;
    }

    Watcher.prototype = {
        /*当defineReactive里调用set时会调用*/
        update: function () {
            this.get();
            /*获取data的值，更新dom*/
            if (this.type == 'text') {
                this.node.innerHTML = this.value;
            }

            if(this.type == 'model'){
                this.node.value = this.value;
            }

        },
        get: function () {
            this.value = this.vm[this.name];
        }
    }

    /*把监听者和订阅者关联起来，往监听者里面添加订阅者就靠它了，相当于调度中心*/
    function Dep () {
        this.subs = [];
    }

    Dep.prototype = {
        /*添加监听队列，当第一次调用Watcher的update时调用*/
        addSub: function(sub) {
            console.info('addSub', sub)
            this.subs.push(sub);
        },
        /*当defineReactive触发set时，调用此函数，
         调用Watcher的update，给html模板进行赋值等*/
        notify: function() {
            this.subs.forEach(function(sub) {
                console.info('notify', sub)
                sub.update();
            });
        }
    }

    /*simple-vue 构造函数*/
    function Sue (options) {
        this.data = options.data;
        /*调用观察者函数，转换data并添加埋点，这时watcher并没有初始化*/
        observer(this.data, this);

        this.$el = document.querySelector(options.el);
        this.method = options.method;
        /*如果有template，则读取*/
        if(options.template){
            this.$el.innerHTML = document.querySelector(options.template).innerHTML;
        }

        /*初始化watcher，把observer，watcher，dep关联起来*/
        var dom = nodeToFragment(this.$el, this);
        this.$el.appendChild(dom);

    }

    window.Sue = Sue;
})();