const $ = require('jquery');
import './scss/main.scss';
import "popper.js";
import "bootstrap";

let usersData = [];

window.loadUsers = () => {
    $(() => {
        fetch('http://volcraft.fr:9080/stats').then(blop => blop.json().then(users => {
            usersData = users;
            let topMinerDiam = [];
            let topDeath = [];
            let topStone = [];
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                const pseudos = user.pseudos;
                const lastPseudo = pseudos[pseudos.length - 1].name;
                const $figure = $(`      
                    <figure onclick="openModal('${user.uuid}','${lastPseudo}')" class="card btn shadow-sm m-2 p-1">
                        <figcaption class="card-body">
                            ${lastPseudo}
                        </figcaption>
                    </figure>
                `);
                $('#usersList').append($figure);
                if (user.stats && user.stats.stats) {
                    const stats = user.stats.stats;
                    if (stats['minecraft:mined']) {
                        const mined = stats['minecraft:mined'];
                        if (mined['minecraft:diamond_ore']) {
                            topMinerDiam.push({
                                pseudo: lastPseudo,
                                total: mined['minecraft:diamond_ore']
                            });
                        }
                        if (mined['minecraft:stone']) {
                            topStone.push({
                                pseudo: lastPseudo,
                                total: mined['minecraft:stone']
                            });
                        }
                    }
                    if (stats['minecraft:custom']) {
                        const custom = stats['minecraft:custom'];
                        if(custom['minecraft:deaths']){
                            topDeath.push({
                                pseudo: lastPseudo,
                                total: custom['minecraft:deaths']
                            })
                        }
                    }
                }
            }
            buildTop(topMinerDiam, '#topMinerDiam');
            buildTop(topDeath, '#topDeath');
            buildTop(topStone, '#topStone');
        }));
    });
};
const buildTop = (array, element,asc) => {
    if(!asc){
        array.sort((a, b) => b.total - a.total);
    }else{
        array.sort((a, b) => a.total - b.total);
    }
    const $ol = $('<ol></ol>');
    for (let i = 0; i < 5; i++) {
        if (array[i]) {
            $($ol).append(`<li>${array[i].pseudo} : ${array[i].total}</li>`);
        }
    }
    $(element).append($ol);
};
const buildEl = (json, parent) => {
    if (typeof json === 'object') {
        const $ul = $('<ul class="position-relative"></ul>');
        for (let key in json) {
            const child = json[key];
            if (typeof child === 'object') {
                $ul.append(`<h4 class="text-center">${key}</h4>`);
                buildEl(child, $ul);
            } else {
                $ul.append($(`<li><b class="w-25 d-inline-block">${child}</b>${key}</li>`))
            }
        }
        parent.append($ul);
    }
};
window.openModal = (userId, pseudo) => {
    fetch('http://volcraft.fr:9080/stats/' + userId).then(blop => blop.json().then(stats => {
        $('#modalTitle').text(pseudo);
        // const $content = $(`<div>${JSON.stringify(stats.stats)}</div>`);
        const $parent = $('<div></div>');
        buildEl(stats.stats, $parent);
        $('#modalContent').empty().append($parent);

        $('#modalUser').modal('show');
    }));
};