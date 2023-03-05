const comments = document.querySelectorAll('details:not(.content-warning)');
comments.forEach(comment => {
  const summary = comment.querySelector('summary');
  const permalink = comment.querySelector('a.permalink').href;
  const handleLong = comment.querySelector('span.handle').innerText;
  const handleShort = handleLong.substring(0, handleLong.indexOf('@', 1));

  const profile = comment.querySelector('a.profile').href;

  summary.insertAdjacentHTML('beforeend', `
    <button class="context-menu" aria-label="More">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    </button>
  `);

  const button = comment.querySelector('button[aria-label="More"]');
  button.insertAdjacentHTML('beforeend', `
    <menu>
      <a href="${permalink}" data-mastodon>Reply to this post</a>
      <a href="${permalink}" data-copy>Copy link to this post</a>
      <a href="${permalink}">Open in original site</a>
      <a href="${profile}" data-mastodon>Follow ${handleShort}</a>
    </menu>
  `);
  button.addEventListener('click', () => {
    const menu = button.querySelector('menu');
    menu.classList.toggle('show');
  });

  // Add a listener to the copy link button
  const copyButton = comment.querySelector('a[data-copy]');
  copyButton.addEventListener('click', () => {
    const link = copyButton.href;
    navigator.clipboard.writeText(link);
  });
});

document.querySelectorAll('a[data-mastodon]').forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const url = new URL(e.target.href);
    const origin = url.origin;
    const username = url.pathname.split('/')[1].slice(1) + '@' + url.hostname;
    const isFollow = Boolean(url.pathname.split('/')[2]==undefined);
    let homeInstance = localStorage.getItem('homeInstance');
    
    if (!homeInstance) {
      // create a dialog
      const dialog = document.createElement('dialog');
      dialog.classList.add('dialog-homeinstance');
      dialog.innerHTML = `
        <form method="dialog">
          <label for="homeInstance">Enter your home instance URL:</label>
          <input type="url" name="homeInstance" list="homeInstance" value="https://">
          <datalist id="homeInstance">
            <option>${origin}</option>
          </datalist>
          <menu>
            <button type="reset" value="cancel">Cancel</button>
            <button type="submit" value="ok">OK</button>
          </menu>
        </form>
      `;
      document.body.appendChild(dialog);
      dialog.showModal();
      const input = dialog.querySelector('input')
      input.focus();
      input.selectionStart = input.selectionEnd = input.value.length;
      
      dialog.querySelector('form').addEventListener('reset', function(e) {
        dialog.close();
      });

      dialog.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        dialog.close();
        dialog.removeAttribute('open');
        let instance = new URL(input.value);
        localStorage.setItem('homeInstance', instance);
        window.open(isFollow ? `https://${instance.hostname}/authorize_interaction?acct=${username}` : `https://${instance.hostname}/authorize_interaction?uri=${url}`);
      });
    }
    else {
      let instance = new URL(homeInstance);
      window.open(isFollow ? `https://${instance.hostname}/authorize_interaction?acct=${username}` : `https://${instance.hostname}/authorize_interaction?uri=${url}`);
    }
  });
});
