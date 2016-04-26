(function () {
  var keysKey = '[enquete-keys] ' + location.pathname;
  var s = localStorage;

  // CSV書き出しエリア作成
  $('.post-panel').append(
    '<p>アンケート結果を自動取得中...。(Excelなどに貼り付け可能な形式)</p>' +
    '<textarea id="enquete-csv"></textarea>');
  // 0.1秒置きにアンケート結果確認
  function track() {
    var question = $('div.question').text();
    if (!question || $('.seconds').length !== 0) {
      return;
    }

    var answers = $.makeArray($('.text').map(function (e) { return $(this).text() }));
    var percentages = $.makeArray($('.percentage > span:even').map(function (e) { return $(this).text() }));
    store({
      question: question,
      answers: answers,
      percentages: percentages
    });
  }
  setInterval(track, 100);

  function store(result) {
    // 同じ分に2回アンケートがない前提でアンケートを、WebStrageとTextarea要素、consoleに出力
    var now = new Date();
    var timeStringWithoutMin =
      now.getFullYear() + '/' +
      addZero(now.getMonth() + 1) + '/' + addZero(now.getDate()) +
      ' ' + addZero(now.getHours()) + ':';
    var timeStringFull = timeStringWithoutMin + addZero(now.getMinutes());
    var key = '[enquete] ' + timeStringFull;
    var prevKey = '[enquete] ' + timeStringWithoutMin + addZero(new Date(now.getTime() - 60000).getMinutes());
    var value =
      result.question + '\t' +
      result.answers[0] + '\t' +
      result.percentages[0] + '\t' +
      result.answers[1] + '\t' +
      result.percentages[1] + '\t' +
      result.answers[2] + '\t' +
      result.percentages[2] + '\t' +
      result.answers[3] + '\t' +
      result.percentages[3];
    if (!s.getItem(key)
      && s.getItem(prevKey) !== value) { // 保存アンケート結果がない、かつ、ひとつ前の値が同じでない場合のみ

      // localStrageに保存
      s.setItem(key, value);

      // localStrageにキーを保存
      if (!s.getItem(keysKey)) {
        s.setItem(keysKey, JSON.stringify([]));
      }
      var keys = JSON.parse(s.getItem(keysKey));
      keys.push(key);
      s.setItem(keysKey, JSON.stringify(keys));

      // Textarea
      var csvText = $('#enquete-csv').val();
      csvText = csvText + timeStringFull + '\t' + value + '\n';
      $('#enquete-csv').val(csvText);

      // console.log
      console.log('store: ' + key);
      console.log(timeStringFull + '\t' + value);
    }
  }

  /**
   * n が1桁の際に 0 を先頭に足した文字列とする
   * n {number} 自然数とする
   */
  function addZero(n) {
    var result = n;
    if (n < 10) {
      result = '0' + result;
    }
    return result.toString();
  }

  // 起動時に同じURLのキーを復活
  function restore() {
    var csvText = $('#enquete-csv').val();
    if (s.getItem(keysKey)) { // 既にキーがあれば
      var keys = JSON.parse(s.getItem(keysKey));
      console.log('--- localStorageから復元 ---');
      console.log(keys);
      for (var i = 0; i < keys.length; i++) {
        csvText = csvText + keys[i].slice(10) + '\t' + s.getItem(keys[i]) + '\n';
      }
    }
    $('#enquete-csv').val(csvText);
  }
  restore();
})();