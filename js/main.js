/*
	Main js entry for Ahmes web-app
    developed under CHANGES project
    
    Author: bruno.fanini_AT_cnr.it

===============================================*/
// Realize our app
let APP = ATON.App.realize();

APP.PATH_DB = APP.basePath + "data/main.json";
APP.MAIN_DB = "main";

APP.PATH_RES  = APP.basePath + "res/";
APP.PATH_CONF = APP.basePath + "config.json";

APP.PATH_TAX = APP.basePath + "taxonomies/";
APP.TAX_SEP  = " / ";

APP._conf     = undefined;
APP._currItem = undefined;
APP._currCat  = undefined;
APP._db       = undefined;

APP.TAX = {};


// APP.setup() is required for web-app initialization
// You can place here UI setup (HTML), events handling, etc.
APP.setup = ()=>{

	// Realize base ATON and add base UI events
    ATON.realize();
    ATON.UI.addBasicEvents();

    ATON.setBackgroundColor(new THREE.Color(0.3,0.3,0.3) );
    ATON.SUI.setSelectorRadius(0.01);

	APP.gItem = ATON.createSceneNode("item");
	APP.gItem.attachToRoot();

    APP.setupTaxonomies();
	APP.setupEventHandling();
    APP.setupUI();

    APP.loadJSONConfig(APP.PATH_CONF, (conf)=>{
        APP._conf = conf;

        APP.reloadDB( APP.onDBLoaded );
    });
};

APP.reloadDB = (onComplete)=>{
    APP.getStorage(APP.MAIN_DB)
        .then((data)=>{
            console.log(data);
            APP._db = data;

            if (onComplete) onComplete();
        })
        .catch((err)=>{
            console.log(err);
        });
};

// Helper
APP.buildTaxList = (L, path, children)=>{
    for (let c in children){
        let C = children[c];

        if (C.name){
            let pp = (path.length>0)? path + APP.TAX_SEP + C.name : C.name;

            L.push(pp);

            if (C.children) APP.buildTaxList(L, pp, C.children);
        }
    }
};

APP.setupTaxonomies = ()=>{
    APP.TAX.manufatti = [];
    ATON.REQ.get(APP.PATH_TAX+"manufatto.json", (d)=>{
        APP.buildTaxList(APP.TAX.manufatti, "", d.children);
    });

    APP.TAX.luoghi = [];
    ATON.REQ.get(APP.PATH_TAX+"luogo.json", (d)=>{
        APP.buildTaxList(APP.TAX.luoghi, "", d.children);
    });

    APP.TAX.personaggi = [];
    ATON.REQ.get(APP.PATH_TAX+"personaggio.json", (d)=>{
        APP.buildTaxList(APP.TAX.personaggi, "", d.children);
    });

    APP.TAX.periodi = [];
    ATON.REQ.get(APP.PATH_TAX+"periodo.json", (d)=>{
        APP.buildTaxList(APP.TAX.periodi, "", d.children);
    });

    APP.TAX.materiali = [];
    ATON.REQ.get(APP.PATH_TAX+"materiale.json", (d)=>{
        APP.buildTaxList(APP.TAX.materiali, "", d.children);
    });

    APP.TAX.aree = [];
    ATON.REQ.get(APP.PATH_TAX+"area.json", (d)=>{
        APP.buildTaxList(APP.TAX.aree, "", d.children);
    });
};


APP.setupEventHandling = ()=>{
    // If our app required ore or more flares (plugins), we can also wait for them to be ready for specific setups
    ATON.on("AllFlaresReady",()=>{
		// Do stuff
		console.log("All flares ready");
	});

	ATON.on("AllNodeRequestsCompleted",()=>{
		//
	});
};

APP.realizeDB = ()=>{
    //TODO
};

APP.loadItem = (item)=>{
    if (!APP._db) return;

    for (let cat in APP._db){
        const C = APP._db[cat];

        for (let i in C){
            if (i===item){
                const I = C[i];

                APP._currItem = i;
                APP._currCat  = cat;

                let url = I.models[0];

                if (APP._conf && APP._conf.collection && !url.startsWith("http:")) url = APP._conf.collection + url;

                APP.gItem.load( url );
                if (url.endsWith(".json")) APP.gItem.setRotation(-1.57079632679,0.0,0.0);
            }
        }
    }
};

APP.onDBLoaded = ()=>{
	let item = APP.params.get("i");
	if (item){
        APP.loadItem(item);
	}
    else {
        ATON.UI.showModal({
            header: "AHMES tool",
            body: ATON.UI.createContainer({items: [
                ATON.UI.createElementFromHTMLString(`
                    <p>
                    ...
                    </p>`
                ),
/*
                ATON.UI.createDropdown({
                    title: "Pick a 3D model",
                    btnclasses: "btn-default",
                    classes: "d-grid gap-2 dropup dropup-center",
                    items:[
                        {
                            title: "Mammouth",
                            icon: "collection-item",
                            url: APP.basePath+"?m=aldrovandi/models/CIPA2025/CS1-mammuth/mammuth_cs1.gltf",
                        },
                    ]
                })
*/
            ]})
        });
    }
};

/* 
    UI
=============================*/
APP.setupUI = ()=>{
    ATON.UI.get("userToolbar").append(
        ATON.UI.createButtonUser()
    );

    ATON.UI.get("toolbar").append(
        //ATON.UI.createButtonHome(),

        ATON.UI.createButton({
            icon: "gallery", //"bi-list",
            //text: "Item",
            onpress: APP.modalPickItem
        }),
    );

    ATON.UI.get("bottomToolbar").append(
        ATON.UI.createButton({
            icon: "bi-pencil-square",
            onpress: APP.modalEditCurrentItem
        }),

        ATON.UI.createButton({
            icon: "bi-camera",
            onpress: APP.modalCover
        }),
    );
};

APP.modalPickItem = ()=>{
    let elBody = ATON.UI.createContainer({
        style: "text-align:center"
    });

    APP.reloadDB(()=>{
        let elGaM = ATON.UI.createContainer();
        let elGaL = ATON.UI.createContainer();

        elBody.append(elGaM, elGaL);
/*
        elBody.append(ATON.UI.createTreeGroup({
            items:[
                {
                    title: "Manufatti",
                    content: elGaM
                },
                {
                    title: "Luoghi",
                    content: elGaL
                }
            ]
        }));
*/
        elGaM.append(ATON.UI.createElementFromHTMLString("<h5>Manufatti</h5>"));
        for (let i in APP._db.manufatti){
            const I = APP._db.manufatti[i];

            elGaM.append(ATON.UI.createCard({
                size: "small",
                title: (I.nome)? I.nome : i,
                cover: (I.cover)? I.cover : APP.PATH_RES+"item-cover.jpg",
                url: APP.basePath + "?i="+i,
                useblurtint: true
            }));
        }

        elGaL.append(ATON.UI.createElementFromHTMLString("<h5>Luoghi</h5>"));
        for (let i in APP._db.luoghi){
            const I = APP._db.luoghi[i];

            elGaL.append(ATON.UI.createCard({
                size: "small",
                title: (I.nome)? I.nome : i,
                cover: (I.cover)? I.cover : APP.PATH_RES+"item-cover.jpg",
                url: APP.basePath + "?i="+i,
                useblurtint: true
            }));
        }

        ATON.UI.showModal({
            header: "Pick an item",
            body: elBody
        });
    });
};

APP.modalCover = ()=>{
    let im = ATON.Utils.takeScreenshot(256, undefined, true);
    //let R = ATON.Utils.takeScreenshot(512, APP._currItem+".png", true);

    let elIMG = document.createElement("img");
    elIMG.src = im;
    elIMG.classList = "cover-img";

    let elBody = ATON.UI.createContainer();

    elBody.append(elIMG);

    // Save
    elBody.append( ATON.UI.createContainer({ 
        classes: "d-grid gap-2",
        style: "margin-top: 20px",
        items: [
            ATON.UI.createButton({
                text: "Save",
                classes: "aton-btn-highlight",
                onpress: ()=>{
                    let D = {};
                    D[APP._currCat] = {};
                    D[APP._currCat][APP._currItem] = {};
                    D[APP._currCat][APP._currItem].cover = im;

                    APP.addToStorage(APP.MAIN_DB, D);
                    ATON.UI.hideModal();
                }
            })
        ]
    }));

    ATON.UI.showModal({
        header: "Cover",
        body: elBody
    });
};

APP.modalEditCurrentItem = ()=>{
    let vSize = new THREE.Vector3();

    let elBody = ATON.UI.createContainer({
        //style: "padding:4px"
    });

    let D = {};
    D[APP._currCat] = {};
    D[APP._currCat][APP._currItem] = APP._db[APP._currCat][APP._currItem];

    // Nome
    elBody.append( ATON.UI.createElementFromHTMLString("<span class='field-label'>Nome</span>") );
    elBody.append( ATON.UI.createInputText({
        //label: "Nome",
        value: D[APP._currCat][APP._currItem].nome,
        oninput: (s)=>{
            D[APP._currCat][APP._currItem].nome = s;
        }
    }));

    // Descr
    let elDescr = ATON.UI.createElementFromHTMLString("<textarea spellcheck='false' rows='3' cols='50' class='field-descr'></textarea>");
    
    if (D[APP._currCat][APP._currItem].descrizione) elDescr.value = D[APP._currCat][APP._currItem].descrizione;
    
    elDescr.onchange = ()=>{
        D[APP._currCat][APP._currItem].descrizione = elDescr.value.trim();
    };
    elBody.append( ATON.UI.createElementFromHTMLString("<span class='field-label'>Descrizione</span>") );
    elBody.append( elDescr );

    // Cat
    elBody.append( ATON.UI.createElementFromHTMLString("<span class='field-label'>Num. Cat. ME</span>") );
    elBody.append( ATON.UI.createInputText({
        value: D[APP._currCat][APP._currItem].numero_cat,
        oninput: (s)=>{
            D[APP._currCat][APP._currItem].numero_cat = s;
        }
    }));

    // Size
    if (APP._currCat !== "personaggi"){
        elBody.append( ATON.UI.createElementFromHTMLString("<span class='field-label'>Dimensioni</span>") );
        elBody.append( ATON.UI.createVectorControl({
            vector: vSize,
            onupdate: ()=>{
                if (!D[APP._currCat][APP._currItem].dimensioni) D[APP._currCat][APP._currItem].dimensioni = {};

                D[APP._currCat][APP._currItem].dimensioni.x = vSize.x;
                D[APP._currCat][APP._currItem].dimensioni.y = vSize.y;
                D[APP._currCat][APP._currItem].dimensioni.z = vSize.z;
            }
        }));
    }

    // Type
    elBody.append( ATON.UI.createElementFromHTMLString("<span class='field-label'>Tipo</span>") );
    elBody.append( ATON.UI.createInputText({
        list: APP.TAX[APP._currCat],
        value: D[APP._currCat][APP._currItem].tipo,
        onchange: (s)=>{
            let v = s.split(APP.TAX_SEP);
            let last = v[v.length-1].trim();
            D[APP._currCat][APP._currItem].tipo = last;
            console.log(D[APP._currCat][APP._currItem])
        }
    }));

    // Provenance
    if (APP._currCat !== "personaggi"){
        elBody.append( ATON.UI.createElementFromHTMLString("<span class='field-label'>Provenienza / Area</span>") );
        elBody.append( ATON.UI.createInputText({
            list: APP.TAX.aree,
            value: D[APP._currCat][APP._currItem].provenienza,
            onchange: (s)=>{
                let v = s.split(APP.TAX_SEP);
                let last = v[v.length-1].trim();
                if (last.length < 1) return;

                D[APP._currCat][APP._currItem].provenienza = last;
                console.log(D[APP._currCat][APP._currItem])
            }
        }));
    }


    // Periods
    let elPeriodsArea = ATON.UI.createContainer({
        style: "margin-bottom:16px"
    });
    elBody.append( ATON.UI.createElementFromHTMLString("<span class='field-label'>Periodi</span>") );

    // Helper routine
    let appendTermToArea = (term,list,elArea)=>{
        elArea.append( ATON.UI.createChip({
            term: term,
            onremove: ()=>{
                let i = D[APP._currCat][APP._currItem][list].indexOf(term);
                if (i < 0) return;
                
                D[APP._currCat][APP._currItem][list].splice(i, 1);

                console.log(D[APP._currCat][APP._currItem][list]);
            }
        })); 
    };

    let elInputPeriods = ATON.UI.createInputText({
        list: APP.TAX.periodi,
        onchange: (s)=>{
            let v = s.split(APP.TAX_SEP);
            let last = v[v.length-1].trim();
            if (last.length < 1) return;

            let elInput = ATON.UI.getComponent(elInputPeriods, "input");
            elInput.value = "";

            if (!D[APP._currCat][APP._currItem].datazioni) D[APP._currCat][APP._currItem].datazioni = [];

            let i = D[APP._currCat][APP._currItem].datazioni.indexOf(last);
            if (i>=0) return;

            D[APP._currCat][APP._currItem].datazioni.push(last);

            appendTermToArea(last,"datazioni",elPeriodsArea);
        }
    });

    elBody.append(elInputPeriods);

    if (D[APP._currCat][APP._currItem].datazioni){
        for (let p in D[APP._currCat][APP._currItem].datazioni)
            appendTermToArea(
                D[APP._currCat][APP._currItem].datazioni[p],
                "datazioni",
                elPeriodsArea
            );
    }
    elBody.append(elPeriodsArea);


    // Materials
    if (APP._currCat === "manufatti"){
        let elMaterialsArea = ATON.UI.createContainer({
            style: "margin-bottom:16px"
        });
        elBody.append( ATON.UI.createElementFromHTMLString("<span class='field-label'>Materiali</span>") );

        let elInputMaterials = ATON.UI.createInputText({
            list: APP.TAX.materiali,
            onchange: (s)=>{
                let v = s.split(APP.TAX_SEP);
                let last = v[v.length-1].trim();
                if (last.length < 1) return;

                let elInput = ATON.UI.getComponent(elInputMaterials, "input");
                elInput.value = "";

                if (!D[APP._currCat][APP._currItem].materiali) D[APP._currCat][APP._currItem].materiali = [];

                let i = D[APP._currCat][APP._currItem].materiali.indexOf(last);
                if (i>=0) return;

                D[APP._currCat][APP._currItem].materiali.push(last);

                appendTermToArea(last,"materiali",elMaterialsArea);
            }
        });

        elBody.append(elInputMaterials);

        if (D[APP._currCat][APP._currItem].materiali){
            for (let p in D[APP._currCat][APP._currItem].materiali) 
                appendTermToArea(
                    D[APP._currCat][APP._currItem].materiali[p],
                    "materiali",
                    elMaterialsArea
                );
        }
        elBody.append(elMaterialsArea);
    }


    // Save
    elBody.append( ATON.UI.createContainer({ 
        classes: "d-grid gap-2",
        style: "margin-top: 20px",
        items: [
            ATON.UI.createButton({
                text: "Save",
                classes: "aton-btn-highlight",
                onpress: ()=>{
                    console.log(D)

                    let o = {};
                    o[APP._currCat] = {};
                    o[APP._currCat][APP._currItem] = {};
                    o[APP._currCat][APP._currItem].datazioni = [];
                    APP.deleteFromStorage(APP.MAIN_DB, o ).then(()=>{
                        o = {};
                        o[APP._currCat] = {};
                        o[APP._currCat][APP._currItem] = {};
                        o[APP._currCat][APP._currItem].materiali = [];
                        APP.deleteFromStorage(APP.MAIN_DB, o ).then(()=>{
                            APP.addToStorage(APP.MAIN_DB, D);
                        });
                    });

                    ATON.UI.hideModal();
                }
            })
        ]
    }));

    ATON.UI.showModal({
        header: "Edit '"+APP._currItem+"'",
        body: elBody
    });
};

/* If you plan to use an update routine (executed continuously), you can place its logic here.
APP.update = ()=>{

};
*/
