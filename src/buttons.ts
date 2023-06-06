const buttons: HTMLButtonElement[] = [];

export function createButton(id: string, caption: string, _image: string, onclick: () => void) {
    const toolsEl = document.getElementById('tools');

    const button = document.createElement('button');
    button.dataset.id = id;
    button.innerText = caption;
    button.addEventListener('click', onclick);
    toolsEl?.appendChild(button);

    buttons.push(button);

    return button;
}

export function createSeparator() {
    const toolsEl = document.getElementById('tools');
    const sep = document.createElement('span');
    sep.className = 'hsep';
    toolsEl?.appendChild(sep);
}

export function updateButtons (active: string) {
    for (const b of buttons) {
        if (b.dataset.id && b.dataset.id === active) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    }
}