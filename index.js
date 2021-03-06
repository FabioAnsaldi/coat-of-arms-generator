const program = require('commander');
const sync = require('fs-sync');
const minify = require('html-minifier').minify;


program
    .version('1.0')
    .option('-p, --parameters [value]', 'Parametri per la generazione dello stemma')
    .parse(process.argv);


const prepareRect = (elements, starting) => {

    let arrayElement = [];

    for (let i = 0; i < elements.length; i++) {

        let transform = '';
        if (Array.isArray(elements[i])) {

            let new_p = (starting.p / elements.length);
            let new_k = i * new_p;
            arrayElement = arrayElement.concat(prepareRect(elements[i], {
                y: 0,
                x: 0,
                p: new_p,
                k: new_k,
                s: starting.s
            }));
            continue;
        }
        if (elements[i].rotate) {

            let _height = 150 / 2;
            if (starting.k === 0) {

                _height += starting.s;
            } else {
                _height += 150 / 100 * starting.k;
            }
            let _width = 125 / 4;
            if (starting.k === 0) {

                _width = 125 / 4 - starting.s * 2;
            }
            transform = 'transform="rotate(' + elements[i].rotate + ' ' + _width + ' ' + _height + ')"';
        } else if (elements[i].horizontal) {

            starting.y = i * (starting.p / elements.length) + starting.k;
            starting.x = 0;
        } else if (elements[i].vertical) {

            starting.y = starting.k;
            starting.x = i * (100 / elements.length);
        }

        let rect = '<rect x="' + starting.x + '%" y="' + starting.y + '%" width="125" height="150" fill="url(#rect-' + starting.k + '-' + +starting.p + '-' + i + ')" ' + transform + '/>';
        let linearGradientLight = '#' + (parseInt(elements[i].background.replace('#', ''), 16) + 819).toString(16);
        let gradient = '<linearGradient id="rect-' + starting.k + '-' +  + starting.p + '-' + i + '" x1="0" y1="0" x2="90%" y2="90%" gradientUnits="userSpaceOnUse"><stop stop-color="' + linearGradientLight + '" offset="0"/><stop stop-color="' + elements[i].background + '" offset="1"/></linearGradient>';

        arrayElement.push({rect: rect, gradient: gradient});
    }

    return arrayElement;
};

const renderRect = (elements, svg) => {

    let rect = '';
    let gradient = '';

    for (let i = 0; i < elements.length; i++) {

        rect += elements[i].rect;
        gradient += elements[i].gradient;
    }
    svg = svg.replace(new RegExp('{{rect}}', 'g'), rect);
    svg = svg.replace(new RegExp('{{linearGradient-rect}}', 'g'), gradient);

    return svg;
};

if (sync.exists('assets/stemma.svg')) {

    sync.defaultEncoding = 'utf-8';
    let stemma = sync.read('assets/stemma.svg');
    let parameters = {

        border: '#333',
        stroke: '3.5',
        divided: [
            {
                background: '#ccc',
                horizontal: true,
            },
            {
                background: '#000',
                horizontal: true,
                rotate: 45
            }
        ]
    };

    stemma = stemma.replace(/{{border}}/g, parameters.border);

    let borderLight = '#' + (parseInt(parameters.border.replace('#', ''), 16) + 819).toString(16);

    stemma = stemma.replace(/{{border-light}}/g, borderLight);
    stemma = stemma.replace(/{{stroke}}/g, parameters.stroke);

    let arrayElement = prepareRect(parameters.divided, {y: 0, x: 0, p: 100, k: 0, s: parseFloat(parameters.stroke)});

    stemma = renderRect(arrayElement, stemma);

    let result = minify(stemma, {removeComments: true});

    console.log(result);
}
