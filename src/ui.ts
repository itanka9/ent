const buttons: HTMLButtonElement[] = [];
const selects: HTMLSelectElement[] = [];

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
    for (const s of selects) {
        s.value = active;
    }
}

export function createSelect (onchange: (input: string) => void) {
    const toolsEl = document.getElementById('tools');
    const select = document.createElement('select');
    select.className = 'select';
    select.addEventListener('change', () => {
        onchange(select.value);
    })
    toolsEl?.appendChild(select);
    selects.push(select);

    return {
        addOption (id: string, caption: string) {
            const option = document.createElement('option');
            option.innerText = caption;
            option.value = id;
            select.appendChild(option);
        },
    }
}