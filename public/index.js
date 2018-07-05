(function() {
  /**
   * 生成书籍列表卡片（dom元素）
   * @param {Object} book 书籍相关数据
   */
  function createCard(book) {
    var li = document.createElement('li');
    // var img = document.createElement('img');
    var title = document.createElement('div');
    var author = document.createElement('div');
    var desc = document.createElement('div');
    var publisher = document.createElement('span');
    var price = document.createElement('span');
    title.className = 'title';
    author.className = 'author';
    desc.className = 'desc';
    // img.src = book.image;
    title.innerText = book.title;
    author.innerText = book.author;
    publisher.innerText = book.publisher;
    price.innerText = book.price;

    book.publisher && desc.appendChild(publisher);
    book.price && desc.appendChild(price);
    // li.appendChild(img);
    li.appendChild(title);
    li.appendChild(author);
    li.appendChild(desc);

    return li;
  }

  /**
   * 根据获取的数据列表，生成书籍展示列表
   * @param {Array} list 书籍列表数据
   */
  function fillList(list) {
    list.forEach(function (book) {
      var node = createCard(book);
      document.querySelector('#js-list').appendChild(node);
    });
  }

  /**
   * 控制tip展示与显示的内容
   * @param {string | undefined} text tip的提示内容
   */
  function tip(text) {
    if (text === undefined) {
      document.querySelector('#js-tip').style = 'display: none';
    }
    else {
      document.querySelector('#js-tip').innerHTML = text;
      document.querySelector('#js-tip').style = 'display: block';
    }
  }

  /**
   * 控制loading动画的展示
   * @param {boolean | undefined} isloading 是否展示loading
   */
  function loading(isloading) {
    if (isloading) {
      tip();
      document.querySelector('#js-loading').style = 'display: block';
    }
    else {
      document.querySelector('#js-loading').style = 'display: none';
    }
  }

  function sleep (time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  /**
   * 根据用户输入结果
   * 使用XMLHttpRequest查询并展示数据列表
   */
  function queryBook() {
    console.log('正在请求数据。。。');
    var input = document.querySelector('#js-search-input');
    var query = input.value;
    var url = '/book?q=' + query + '&fields=id,title,image,author,publisher,price';
    var cacheData;
    if (query === '') {
      tip('请输入关键词');
      return;
    }
    document.querySelector('#js-list').innerHTML = '';
    document.querySelector('#js-thanks').style = 'display: none';
    // loading(true);
    // 从 sw 文件读取 skeleton
    var remotePromise = getApiDataRemote(url);
    getApiDataFromCache(url).then(function (data) {
      console.log('11')
      if (data) {
        // 把 skeleton 清空 ，渲染正常的结果
        // loading(false);
        document.querySelector('#main').innerHTML = '<div id="js-loading" class="loading"></div><div id="js-tip" class="tip"></div><ul class="list" id="js-list"></ul><a id="js-thanks" class="thanks" href="https://developers.douban.com/wiki/?title=guide">- 本Demo基于豆瓣API，感谢豆瓣开放平台 -</a>';
        input.blur();
        fillList(data.books);
        console.log('from cache');
        document.querySelector('#js-thanks').style = 'display: block';
        // cacheData = data;
        // return remotePromise || null;
      } else {
        getApiDataRemote('./skeleton.json').then((r) => {
          var newchild = document.createElement("div");
          newchild.innerHTML = r.skeleton;
          document.querySelector('#main').appendChild(newchild)
        })
      }
      cacheData = data || {};
      return remotePromise || null;
    }).then(function (data) {
      // get remote data 为空时，直接返回
      if (!data) return
      if (JSON.stringify(data) !== JSON.stringify(cacheData)) {
        // 把 skeleton 清空 ，渲染正常的结果
        // loading(false);
        document.querySelector('#main').innerHTML = '<div id="js-loading" class="loading"></div><div id="js-tip" class="tip"></div><ul class="list" id="js-list"></ul><a id="js-thanks" class="thanks" href="https://developers.douban.com/wiki/?title=guide">- 本Demo基于豆瓣API，感谢豆瓣开放平台 -</a>';
        input.blur();
        fillList(data.books);
        console.log('from remote');
        document.querySelector('#js-thanks').style = 'display: block';
      }
    });
  }
  function getApiDataFromCache(url) {
    if ('caches' in window) {
      return caches.match(url).then(function (cache) {
        if (!cache) {
          return;
        }
        return cache.json();
      });
    }
    else {
      return Promise.resolve();
    }
  }
  function getApiDataRemote(url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.timeout = 60000;
      xhr.onreadystatechange = function () {
        var response = {};
        if (xhr.readyState === 4 && xhr.status === 200) {
          try {
            response = JSON.parse(xhr.responseText);
          }
          catch (e) {
            response = xhr.responseText;
          }
          resolve(response);
        }
        else if (xhr.readyState === 4) {
          resolve();
        }
      };
      xhr.onabort = reject;
      xhr.onerror = reject;
      xhr.ontimeout = reject;
      xhr.open('GET', url, true);
      xhr.send(null);
    });
  }

  /**
   * 监听“搜索”按钮点击事件
   */
  document.querySelector('#js-search-btn').addEventListener('click', function () {
    queryBook();
  });
  /**
   * 监听“回车”事件
   */
  window.addEventListener('keypress', function (e) {
    if (e.keyCode === 13) {
      queryBook();
    }
  });
  // 注册 sw 文件
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(function () {
      console.log('Service Worker 注册成功');
    });
  }
})();