document.addEventListener('DOMContentLoaded', function () {
  const filenameInput = document.getElementById('filenameInput');
  const resultDiv = document.getElementById('result');

  // ファイル名が入力されるたびにチェックを実行
  filenameInput.addEventListener('input', function() {
    const filename = filenameInput.value;
    checkFilename(filename);
  });

  function checkFilename(filename) {
    // 入力が空の場合は結果をクリア
    if (!filename) {
      resultDiv.innerHTML = '';
      resultDiv.className = '';
      return;
    }

    let errors = [];

    // --- 1. ファイル名の長さチェック (バイト数) ---
    // 多くのファイルシステムではファイル名は255バイトに制限されている
    const byteLength = new TextEncoder().encode(filename).length;
    if (byteLength > 255) {
        errors.push(`ファイル名が長すぎます (${byteLength} バイト)。多くのシステムでは255バイトが上限です。`);
    }

    // --- 2. Windows & NAS の禁則文字チェック ---
    // 対象: \ / : * ? " < > |
    const winInvalidChars = /[\\/:*?"<>|]/g;
    let match;
    while ((match = winInvalidChars.exec(filename)) !== null) {
      errors.push(`<strong>${match[0]}</strong> はWindowsやNASで使用できません。`);
    }

    // --- 3. Windows の予約名チェック ---
    // 対象: CON, PRN, AUX, NUL, COM1-9, LPT1-9 (大文字小文字を区別しない)
    const winReservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
    if (winReservedNames.test(filename.split('.')[0])) {
        errors.push(`<strong>${filename.split('.')[0]}</strong> はWindowsの予約名のため使用できません。`);
    }

    // --- 4. macOS の禁則文字チェック ---
    // Finder上では / に変換されるため避けるのが安全
    if (filename.includes(':')) {
      errors.push(`<strong>:</strong> はmacOSでスラッシュに変換されるため、互換性の問題を起こす可能性があります。`);
    }
    // スラッシュ自体はどのOSでも使えない
    if (filename.includes('/')) {
        // winInvalidCharsのチェックと重複するが、macOSの文脈でも言及
        errors.push(`<strong>/</strong> はパスの区切り文字のため、ファイル名には使用できません。`);
    }

    // --- 5. 共通の注意点 ---
    // ファイル名の先頭のピリオド (.) は隠しファイルになる
    if (filename.startsWith('.')) {
      errors.push(`先頭の <strong>.</strong> は、macOSやLinux等で隠しファイルとして扱われます。`);
    }

    // --- 6. 結果の表示 ---
    if (errors.length > 0) {
      // エラーメッセージの重複を削除して表示
      const uniqueErrors = [...new Set(errors)];
      resultDiv.innerHTML = '<ul>' + uniqueErrors.map(e => `<li>${e}</li>`).join('') + '</ul>';
      resultDiv.className = 'error';
    } else {
      resultDiv.innerHTML = '✅ このファイル名は使用可能です。';
      resultDiv.className = 'success';
    }
  }
});