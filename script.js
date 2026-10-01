document.addEventListener('DOMContentLoaded', () => {
  const windows = [...document.querySelectorAll('.xp-window')];
  const taskbarTasks = document.querySelector('#taskbar-tasks');
  const startMenu = document.querySelector('#start-menu');
  const startButton = document.querySelector('#start-button');
  const welcomePopup = document.querySelector('#welcome-popup');
  const welcomeBadge = document.querySelector('#welcome-badge');
  const heroClose = document.querySelector('#hero-close');
  let zIndex = 20;

  const bringToFront = (win) => {
    zIndex += 1;
    win.style.zIndex = zIndex;
    document.querySelectorAll('.task-button').forEach((button) => {
      button.classList.toggle('active', button.dataset.window === win.id);
    });
  };

  const updateTasks = () => {
    taskbarTasks.innerHTML = '';
    windows.filter((win) => !win.hidden).forEach((win) => {
      const button = document.createElement('button');
      button.className = 'task-button';
      button.dataset.window = win.id;
      button.textContent = win.dataset.title;
      button.classList.toggle('active', !win.classList.contains('minimized'));
      button.addEventListener('click', () => {
        if (win.classList.contains('minimized')) {
          win.classList.remove('minimized');
          win.style.display = '';
          bringToFront(win);
        } else {
          win.classList.add('minimized');
          win.style.display = 'none';
        }
        updateTasks();
      });
      taskbarTasks.appendChild(button);
    });
  };

  const openWindow = (id) => {
    const win = document.getElementById(id);
    if (!win) return;
    win.hidden = false;
    win.classList.remove('minimized');
    win.style.display = '';
    bringToFront(win);
    startMenu.hidden = true;
    updateTasks();
  };

  const closeWindow = (win) => {
    win.hidden = true;
    win.classList.remove('is-maximized', 'minimized');
    win.style.display = '';
    win.style.left = '';
    win.style.top = '';
    win.dataset.restoreLeft = '';
    win.dataset.restoreTop = '';
    updateTasks();
  };

  const toggleMaximize = (win) => {
    const shouldMaximize = !win.classList.contains('is-maximized');
    if (shouldMaximize) {
      win.dataset.restoreLeft = win.style.left;
      win.dataset.restoreTop = win.style.top;
      // Inline posições criadas pelo arraste não podem sobrescrever o modo maximizado.
      win.style.left = '';
      win.style.top = '';
      win.classList.add('is-maximized');
    } else {
      win.classList.remove('is-maximized');
      win.style.left = win.dataset.restoreLeft || '';
      win.style.top = win.dataset.restoreTop || '';
    }
    bringToFront(win);
  };

  document.querySelectorAll('[data-window]').forEach((trigger) => {
    trigger.addEventListener('click', () => openWindow(trigger.dataset.window));
  });

  windows.forEach((win) => {
    win.addEventListener('mousedown', () => bringToFront(win));
    win.querySelector('[data-action="close"]').addEventListener('click', () => closeWindow(win));
    win.querySelector('[data-action="minimize"]').addEventListener('click', () => {
      win.classList.add('minimized');
      win.style.display = 'none';
      updateTasks();
    });
    win.querySelector('[data-action="maximize"]').addEventListener('click', () => toggleMaximize(win));

    const titlebar = win.querySelector('.window-titlebar');
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    titlebar.addEventListener('dblclick', (event) => {
      if (!event.target.closest('button')) toggleMaximize(win);
    });

    titlebar.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button') || win.classList.contains('is-maximized')) return;
      const rect = win.getBoundingClientRect();
      dragging = true;
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      titlebar.setPointerCapture?.(event.pointerId);
      titlebar.classList.add('window-dragging');
      bringToFront(win);
      event.preventDefault();
    });

    titlebar.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      const parentRect = win.offsetParent.getBoundingClientRect();
      const maxX = Math.max(0, win.offsetParent.clientWidth - win.offsetWidth);
      const maxY = Math.max(0, win.offsetParent.clientHeight - win.offsetHeight);
      const nextX = event.clientX - parentRect.left - offsetX;
      const nextY = event.clientY - parentRect.top - offsetY;
      win.style.left = `${Math.min(Math.max(0, nextX), maxX)}px`;
      win.style.top = `${Math.min(Math.max(0, nextY), maxY)}px`;
    });

    const stopDragging = (event) => {
      if (!dragging) return;
      dragging = false;
      titlebar.releasePointerCapture?.(event.pointerId);
      titlebar.classList.remove('window-dragging');
    };
    titlebar.addEventListener('pointerup', stopDragging);
    titlebar.addEventListener('pointercancel', stopDragging);
  });

  startButton.addEventListener('click', () => { startMenu.hidden = !startMenu.hidden; });
  document.addEventListener('click', (event) => {
    if (!startMenu.hidden && !event.target.closest('#start-menu') && !event.target.closest('#start-button')) startMenu.hidden = true;
  });

  heroClose.addEventListener('click', () => welcomePopup.classList.add('is-closed'));
  welcomeBadge.addEventListener('click', () => welcomePopup.classList.remove('is-closed'));

  const clock = document.querySelector('#clock');
  const updateClock = () => { clock.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); };
  updateClock();
  setInterval(updateClock, 30000);
});
